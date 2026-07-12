import { prisma } from '@haspataal/db';
import { buildCanonicalOutbox, ScopeType } from '@haspataal/platform-contracts/dist/events/outbox';
import { BedStatus } from '@prisma/client';

import { createClient } from '@/lib/supabase/client';

export const IPDService = {
  async admitPatient(
    hospitalId: string,
    patientId: string,
    bedId: string,
    attendingDoctorId: string,
    reason: string,
  ) {
    const supabase = createClient();

    // 1. Check if bed is available
    const { data: bed, error: bedError } = await supabase
      .from('beds')
      .select('*')
      .eq('id', bedId)
      .single();
    if (bedError || !bed) throw new Error('Bed not found');
    if (bed.status !== 'AVAILABLE') throw new Error('Bed is not available');

    // 2. Generate admission number
    const admissionNumber = 'ADM-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    // 3. Create admission record
    const { data: admission, error: admissionError } = await supabase
      .from('admissions')
      .insert({
        hospital_id: hospitalId,
        patient_id: patientId,
        bed_id: bedId,
        attending_doctor_id: attendingDoctorId,
        admission_number: admissionNumber,
        status: 'ADMITTED',
        reason,
        daily_bed_charge: 1500, // standard baseline bed charge
      })
      .select()
      .single();
    if (admissionError) throw admissionError;

    // 4. Update Bed status to OCCUPIED and link patient
    const { error: bedUpdateError } = await supabase
      .from('beds')
      .update({
        status: 'OCCUPIED',
        patient_id: patientId,
        admitted_at: new Date(),
      })
      .eq('id', bedId);
    if (bedUpdateError) throw bedUpdateError;

    // 5. Emit PatientAdmitted event
    const { eventBus } = await import('@haspataal/events');
    await eventBus.publish({
      id: crypto.randomUUID(),
      type: 'PatientAdmitted',
      payload: {
        admissionId: admission.id,
        admissionNumber: admission.admission_number,
        patientId,
        bedId,
        attendingDoctorId,
      },
      timestamp: new Date(),
      hospitalId,
    });

    // Timeline Engine publish
    try {
      const { getTimelinePublisher } = await import('@haspataal/timeline');
      await getTimelinePublisher().publish({
        patientId,
        hospitalId,
        doctorId: attendingDoctorId,
        eventType: 'PatientAdmitted',
        title: 'Patient Admitted to Ward',
        subtitle: `Admission Number: ${admission.admission_number}`,
        summary: reason,
        timestamp: new Date(),
        category: 'ADMISSION',
        module: 'ipd',
        severity: 'MEDIUM',
        metadata: {
          admissionId: admission.id,
          admissionNumber: admission.admission_number,
          bedId,
        },
      });
    } catch (e: any) {
      console.error('[Timeline] Failed to publish PatientAdmitted event:', e.message);
    }

    return admission;
  },

  async transferWard(admissionId: string, newBedId: string) {
    const supabase = createClient();

    // Get current admission details
    const { data: admission, error: fetchError } = await supabase
      .from('admissions')
      .select('*')
      .eq('id', admissionId)
      .single();
    if (fetchError || !admission) throw new Error('Admission not found');

    const oldBedId = admission.bed_id;
    if (oldBedId === newBedId) return admission;

    // Check if new bed is available
    const { data: newBed, error: bedError } = await supabase
      .from('beds')
      .select('*')
      .eq('id', newBedId)
      .single();
    if (bedError || !newBed) throw new Error('Target bed not found');
    if (newBed.status !== 'AVAILABLE') throw new Error('Target bed is not available');

    // Free old bed
    if (oldBedId) {
      const { error: oldBedError } = await supabase
        .from('beds')
        .update({
          status: 'AVAILABLE',
          patient_id: null,
          admitted_at: null,
        })
        .eq('id', oldBedId);
      if (oldBedError) throw oldBedError;
    }

    // Occupy new bed
    const { error: newBedError } = await supabase
      .from('beds')
      .update({
        status: 'OCCUPIED',
        patient_id: admission.patient_id,
        admitted_at: new Date(),
      })
      .eq('id', newBedId);
    if (newBedError) throw newBedError;

    // Update Admission
    const { data: updatedAdmission, error: updateError } = await supabase
      .from('admissions')
      .update({ bed_id: newBedId })
      .eq('id', admissionId)
      .select()
      .single();
    if (updateError) throw updateError;

    // Timeline Engine publish
    try {
      const { getTimelinePublisher } = await import('@haspataal/timeline');
      await getTimelinePublisher().publish({
        patientId: admission.patient_id,
        hospitalId: admission.hospital_id,
        eventType: 'WardTransfer',
        title: 'Ward Transfer completed',
        subtitle: `Transferred to Bed: ${newBedId}`,
        timestamp: new Date(),
        category: 'ADMISSION',
        module: 'ipd',
        severity: 'LOW',
        metadata: {
          admissionId,
          oldBedId,
          newBedId,
        },
      });
    } catch (e: any) {
      console.error('[Timeline] Failed to publish WardTransfer event:', e.message);
    }

    return updatedAdmission;
  },

  async expectedDischarge(admissionId: string, date: Date) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('admissions')
      .update({ expected_discharge_at: date })
      .eq('id', admissionId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async dischargePatient(admissionId: string, notes: string, dischargeSummary: string) {
    // 1. Compatibility Router: Updates ONLY clinical/administrative status.
    const dischargedAt = new Date();

    return await prisma.$transaction(async (tx) => {
      const admission = await tx.admission.findUniqueOrThrow({ where: { id: admissionId } });

      // Update admission with Phase 3 clinical enum AND legacy string status.
      // Preserves physicalPresenceStatus = PRESENT.
      const updatedAdmission = await tx.admission.update({
        where: { id: admissionId },
        data: {
          status: 'DISCHARGED', // legacy string
          dischargedAt,
          dischargeSummary,
          reason: notes || admission.reason,
          clinicalStatus: 'DISCHARGE_CLINICALLY_DECIDED',
        },
      });

      // Handle billing (create invoice)
      const stayMs = dischargedAt.getTime() - admission.admittedAt.getTime();
      const stayDays = Math.max(1, Math.ceil(stayMs / (1000 * 60 * 60 * 24)));
      const bedChargeRate = Number(admission.dailyBedCharge || 1500);
      const totalBedCharges = stayDays * bedChargeRate;
      const invoiceNumber = 'INV-' + Math.random().toString(36).substring(2, 8).toUpperCase();

      await tx.invoice.create({
        data: {
          hospitalId: admission.hospitalId,
          patientId: admission.patientId,
          admissionId: admission.id,
          invoiceNumber,
          source: 'IPD',
          status: 'DRAFT',
          subtotal: totalBedCharges,
          totalAmount: totalBedCharges,
          balanceAmount: totalBedCharges,
          payload: { stayDays, bedChargeRate, totalBedCharges },
        },
      });

      return updatedAdmission;
    });
  },

  async confirmPhysicalDeparture(
    admissionId: string,
    pathway: 'STANDARD' | 'LAMA' | 'WITHOUT_NOTICE',
    confirmedByActorId: string,
    confirmerRole: string,
    evidenceType: 'MANUAL_ENTRY' | 'SECURITY_GATE' | 'SYSTEM_OVERRIDE',
    sourceWorkflow: string,
  ) {
    try {
      return await prisma.$transaction(async (tx) => {
        const admission = await tx.admission.findUniqueOrThrow({ where: { id: admissionId } });

        if (
          admission.physicalPresenceStatus !== 'PRESENT' &&
          admission.physicalPresenceStatus !== 'SUSPECTED_ABSENT'
        ) {
          const existing = await tx.physicalDepartureRecord.findUnique({ where: { admissionId } });
          if (existing && existing.pathway === pathway) {
            return { status: 'already_confirmed', record: existing };
          }
          throw new Error(
            `Invalid state transition: Patient physical presence is ${admission.physicalPresenceStatus}`,
          );
        }

        let newPresenceStatus: any = 'DEPARTED_STANDARD';
        let eventType = 'PATIENT_PHYSICALLY_LEFT_STANDARD';

        if (pathway === 'LAMA') {
          newPresenceStatus = 'DEPARTED_LAMA';
          eventType = 'PATIENT_PHYSICALLY_LEFT_LAMA';
        } else if (pathway === 'WITHOUT_NOTICE') {
          newPresenceStatus = 'DEPARTED_WITHOUT_NOTICE';
          eventType = 'PATIENT_PHYSICALLY_LEFT_WITHOUT_NOTICE';
        }

        // Update Admission
        const updatedAdmission = await tx.admission.update({
          where: { id: admissionId },
          data: {
            physicalPresenceStatus: newPresenceStatus,
            // Explicitly NOT updating clinical status here.
          },
        });

        const correlationId = crypto.randomUUID();

        // Insert Record (will throw P2002 if racing)
        const departureRecord = await tx.physicalDepartureRecord.create({
          data: {
            admissionId: admission.id,
            pathway,
            confirmedByActorId,
            confirmerRole,
            evidenceType,
            sourceWorkflow,
            correlationId,
          },
        });

        // Create Outbox Event using canonical builder
        const canonicalEvent = buildCanonicalOutbox({
          eventId: crypto.randomUUID(),
          eventType,
          payload: { evidenceId: departureRecord.id },
          aggregateType: 'Admission',
          aggregateId: admission.id,
          scopeType: 'PATIENT' as any,
          hospitalId: admission.hospitalId,
          actorId: confirmedByActorId,
          actorRole: confirmerRole,
          correlationId,
          depth: 0,
        });

        // We now use exactly the Phase 0A canonical output.
        await tx.outboxEvent.create({
          data: {
            ...canonicalEvent,
            payload: canonicalEvent.payload as any,
          },
        });

        // Update Bed
        if (admission.bedId) {
          await tx.bed.update({
            where: { id: admission.bedId },
            data: {
              status: BedStatus.CLEANING,
              patientId: null,
              admittedAt: null,
              expectedDischargeAt: null,
            },
          });
        }

        return { status: 'success', admission: updatedAdmission, record: departureRecord };
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        const existing = await prisma.physicalDepartureRecord.findUnique({
          where: { admissionId },
        });
        if (existing?.pathway === pathway) {
          return { status: 'already_confirmed', record: existing };
        } else {
          throw new Error(`Conflict: Patient already departed under pathway: ${existing?.pathway}`);
        }
      }
      throw error;
    }
  },

  async initiateLAMA(admissionId: string, actorId: string) {
    return await prisma.lamaEpisode.create({
      data: {
        admissionId,
        status: 'INITIATED',
        initiatedBy: actorId,
      },
    });
  },

  async documentLAMA(admissionId: string, actorId: string) {
    return await prisma.lamaEpisode.updateMany({
      where: { admissionId, status: { in: ['INITIATED', 'DOCUMENTATION_IN_PROGRESS'] } },
      data: {
        status: 'DOCUMENTED',
        documentedAt: new Date(),
      },
    });
  },

  async withdrawLAMA(admissionId: string, actorId: string) {
    return await prisma.lamaEpisode.updateMany({
      where: {
        admissionId,
        status: { in: ['INITIATED', 'DOCUMENTATION_IN_PROGRESS', 'DOCUMENTED'] },
      },
      data: {
        status: 'WITHDRAWN',
        withdrawnAt: new Date(),
      },
    });
  },

  async suspectAbsence(admissionId: string, actorId: string) {
    return await prisma.$transaction(async (tx) => {
      const episode = await tx.absenceEpisode.create({
        data: {
          admissionId,
          status: 'SUSPECTED',
        },
      });
      await tx.admission.update({
        where: { id: admissionId },
        data: { physicalPresenceStatus: 'ABSENCE_SUSPECTED' },
      });
      return episode;
    });
  },

  async resolveAbsence(admissionId: string, actorId: string) {
    return await prisma.$transaction(async (tx) => {
      await tx.absenceEpisode.updateMany({
        where: { admissionId, status: 'SUSPECTED' },
        data: {
          status: 'RESOLVED_RETURNED',
          resolvedAt: new Date(),
        },
      });
      await tx.admission.update({
        where: { id: admissionId },
        data: { physicalPresenceStatus: 'PRESENT' },
      });
    });
  },
};
