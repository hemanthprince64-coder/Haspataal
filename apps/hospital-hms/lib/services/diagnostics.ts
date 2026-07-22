/* eslint-disable @typescript-eslint/no-unused-vars */
import { eventBus, EVENT_TYPES } from '@haspataal/events';

import { createClient } from '@/lib/supabase/client';

export const LabService = {
  async getCatalog() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('investigation_master')
      .select('*')
      .order('test_name');

    if (error) throw error;
    return data;
  },

  generateBarcode(hospitalId, _testName) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return 'LAB-' + hospitalId.substring(0, 4) + '-' + dateStr + '-' + random;
  },

  async createOrder(
    hospitalId,
    patientId,
    doctorId,
    tests,
    appointmentId,
    visitId,
    priority,
    clinicalInfo,
  ) {
    const supabase = createClient();
    const orderNumber = LabService.generateBarcode(hospitalId, 'LAB');
    const { data: order, error: orderError } = await supabase
      .from('lab_orders')
      .insert({
        hospital_id: hospitalId,
        patient_id: patientId,
        doctor_id: doctorId,
        appointment_id: appointmentId,
        visit_id: visitId,
        order_number: orderNumber,
        priority: priority || 'ROUTINE',
        clinical_info: clinicalInfo,
        status: 'ORDERED',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const samples = tests.map((testId) => ({
      lab_order_id: order.id,
      test_id: testId,
      barcode: LabService.generateBarcode(hospitalId, testId),
      sample_type: 'BLOOD',
      status: 'PENDING',
    }));

    const { data: createdSamples, error: sampleError } = await supabase
      .from('lab_samples')
      .insert(samples)
      .select();

    if (sampleError) throw sampleError;

    await eventBus.publish({
      id: crypto.randomUUID(),
      type: EVENT_TYPES.INVESTIGATION_ORDERED,
      payload: {
        orderId: order.id,
        orderNumber: order.order_number,
        patientId,
        doctorId,
        tests: createdSamples.map((s) => s.test_id),
      },
      timestamp: new Date(),
      hospitalId,
    });

    return { order, samples: createdSamples };
  },

  async getOrders(hospitalId: string, status?: string) {
    const supabase = createClient();
    let query = supabase
      .from('lab_orders')
      .select(
        '*, patient:hospital_patients(global_patients(name, phone)), doctor:doctors_master(full_name), samples:lab_samples(*)',
      )
      .eq('hospital_id', hospitalId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async collectSample(sampleId, collectedById, collectionTime, notes) {
    const supabase = createClient();
    const { data: sample, error: updateError } = await supabase
      .from('lab_samples')
      .update({
        collected_by_id: collectedById,
        collected_at: new Date(),
        collection_time: collectionTime || new Date(),
        notes: notes,
        status: 'COLLECTED',
      })
      .eq('id', sampleId)
      .select()
      .single();

    if (updateError) throw updateError;

    const { data: order } = await supabase
      .from('lab_orders')
      .select('id, status')
      .eq('id', sample.lab_order_id)
      .single();

    const { count: collectedCount } = await supabase
      .from('lab_samples')
      .select('id', { count: 'exact' })
      .eq('lab_order_id', sample.lab_order_id)
      .eq('status', 'COLLECTED');

    const { count: totalSamples } = await supabase
      .from('lab_samples')
      .select('id', { count: 'exact' })
      .eq('lab_order_id', sample.lab_order_id);

    if (collectedCount === totalSamples && order) {
      await supabase
        .from('lab_orders')
        .update({ status: 'SAMPLE_COLLECTED' })
        .eq('id', sample.lab_order_id);
    }

    // Timeline Engine publish
    try {
      const { getTimelinePublisher } = await import('@haspataal/timeline');
      await getTimelinePublisher().publish({
        patientId: sample.patient_id,
        hospitalId: sample.hospital_id,
        eventType: 'SampleCollected',
        title: `Sample Collected: ${sample.sample_type}`,
        timestamp: sample.collected_at || new Date(),
        category: 'INVESTIGATION',
        module: 'laboratory',
        severity: 'LOW',
        metadata: {
          sampleId: sample.id,
          orderId: sample.lab_order_id,
          sampleType: sample.sample_type,
        },
      });
    } catch (e: any) {
      // console.error('[Timeline] Failed to publish SampleCollected event:', e.message);
    }

    return sample;
  },

  async processResult(sampleId, resultValue, resultFlag) {
    const supabase = createClient();
    const { data: sample, error } = await supabase
      .from('lab_samples')
      .update({
        result_value: resultValue,
        result_flag: resultFlag,
        status: 'PROCESSED',
      })
      .eq('id', sampleId)
      .select()
      .single();

    if (error) throw error;
    LabService._checkCriticalValues(sample);
    return sample;
  },

  async verifyResult(sampleId, verifiedById, reportFileUrl) {
    const supabase = createClient();
    const { data: sample, error } = await supabase
      .from('lab_samples')
      .update({
        verified_by_id: verifiedById,
        verified_at: new Date(),
        report_file_url: reportFileUrl,
        status: 'VERIFIED',
      })
      .eq('id', sampleId)
      .select()
      .single();

    if (error) throw error;

    const { data: order } = await supabase
      .from('lab_orders')
      .select('id, hospital_id')
      .eq('id', sample.lab_order_id)
      .single();

    const { count: verifiedCount } = await supabase
      .from('lab_samples')
      .select('id', { count: 'exact' })
      .eq('lab_order_id', sample.lab_order_id)
      .eq('status', 'VERIFIED');

    const { count: totalSamples } = await supabase
      .from('lab_samples')
      .select('id', { count: 'exact' })
      .eq('lab_order_id', sample.lab_order_id);

    if (verifiedCount === totalSamples && order) {
      await supabase
        .from('lab_orders')
        .update({ status: 'REPORT_READY' })
        .eq('id', sample.lab_order_id);

      await eventBus.publish({
        id: crypto.randomUUID(),
        type: EVENT_TYPES.LAB_COMPLETED,
        payload: {
          orderId: order.id,
          patientId: sample.patient_id,
        },
        timestamp: new Date(),
        hospitalId: order.hospital_id,
      });

      // Timeline Engine publish
      try {
        const { getTimelinePublisher } = await import('@haspataal/timeline');
        await getTimelinePublisher().publish({
          patientId: sample.patient_id,
          hospitalId: order.hospital_id,
          eventType: 'LabCompleted',
          title: `Lab Report Ready: ${sample.test_name || 'Investigation'}`,
          timestamp: new Date(),
          category: 'INVESTIGATION',
          module: 'laboratory',
          severity: sample.result_flag === 'CRITICAL' ? 'CRITICAL' : 'LOW',
          metadata: {
            orderId: order.id,
            resultId: sample.id,
            testName: sample.test_name,
            result: sample.result_value,
            isAbnormal: sample.result_flag === 'CRITICAL' || sample.result_flag === 'HIGH',
          },
        });
      } catch (e: any) {
        // console.error('[Timeline] Failed to publish LabCompleted event:', e.message);
      }
    }

    return sample;
  },

  async _checkCriticalValues(sample) {
    if (!sample.reference_range) return;
    const refs = sample.reference_range;
    const isNumeric = !isNaN(Number(sample.result_value));
    if (isNumeric) {
      const value = Number(sample.result_value);
      const parts = refs.split('-');
      if (parts.length === 2) {
        const low = Number(parts[0]);
        const high = Number(parts[1]);
        if (value < low * 0.5 || value > high * 1.5) {
          await eventBus.publish({
            id: crypto.randomUUID(),
            type: 'CRITICAL_VALUE_ALERT',
            payload: {
              sampleId: sample.id,
              resultValue: sample.result_value,
              referenceRange: refs,
              flag: 'CRITICAL',
            },
            timestamp: new Date(),
            hospitalId: sample.hospital_id,
          });
        }
      }
    }
  },
};

export const DiagnosticsService = LabService;
