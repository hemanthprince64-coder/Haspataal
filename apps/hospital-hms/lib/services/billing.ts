/* eslint-disable */
import crypto from 'crypto';
import Razorpay from 'razorpay';

import { createClient } from '@/lib/supabase/client';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'key_secret',
});

export const BillingService = {
  async createOrder(amount: number, receiptId: string) {
    const options = {
      amount: amount * 100, // amount in paisa
      currency: 'INR',
      receipt: receiptId,
    };
    try {
      const order = await razorpay.orders.create(options);
      return order;
    } catch (error) {
      throw error;
    }
  },

  verifySignature(body: string, signature: string, secret: string) {
    const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');
    return expectedSignature === signature;
  },

  async recordTransaction(hospitalId: string, paymentDetails: any) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('payment_transactions')
      .insert({
        hospital_id: hospitalId,
        razorpay_payment_id: paymentDetails.razorpay_payment_id,
        razorpay_order_id: paymentDetails.razorpay_order_id,
        amount: paymentDetails.amount,
        status: 'success',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async activateSubscription(hospitalId: string, planId: string, durationDays: number) {
    const supabase = createClient();

    // Calculate end date
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + durationDays);

    const { data, error } = await supabase
      .from('hospital_subscriptions')
      .insert({
        hospital_id: hospitalId,
        plan_id: planId,
        status: 'active',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createDynamicBill(
    hospitalId: string,
    patientId: string,
    items: Array<{ serviceName: string; quantity: number; unitPrice: number }>,
    admissionId?: string,
    diagnosticOrderId?: string,
  ) {
    const supabase = createClient();
    const invoiceNumber = 'INV-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    let subtotal = 0;
    for (const item of items) {
      subtotal += item.quantity * item.unitPrice;
    }

    const gstRate = 0.05; // 5% standard service GST for hospital
    const gstTotal = subtotal * gstRate;
    const totalAmount = subtotal + gstTotal;

    const { data, error } = await supabase
      .from('invoices')
      .insert({
        hospital_id: hospitalId,
        patient_id: patientId,
        admission_id: admissionId || null,
        diagnostic_order_id: diagnosticOrderId || null,
        invoice_number: invoiceNumber,
        source: admissionId ? 'IPD' : 'DIRECT',
        status: 'DRAFT',
        subtotal,
        gst_total: gstTotal,
        total_amount: totalAmount,
        balance_amount: totalAmount,
        payload: { items },
      })
      .select()
      .single();
    if (error) throw error;

    // Timeline Engine publish
    try {
      const { getTimelinePublisher } = await import('@haspataal/timeline');
      await getTimelinePublisher().publish({
        patientId,
        hospitalId,
        eventType: 'BillingCompleted',
        title: `Bill Generated: ${invoiceNumber}`,
        subtitle: `Amount: ₹${totalAmount.toFixed(2)}`,
        summary: `Bill generated for ${admissionId ? 'IPD Stay' : 'Outpatient diagnostics'}. GST included: ₹${gstTotal.toFixed(2)}.`,
        timestamp: new Date(),
        category: 'BILLING',
        module: 'billing',
        severity: 'LOW',
        metadata: {
          invoiceId: data.id,
          invoiceNumber,
          totalAmount,
          admissionId,
          diagnosticOrderId,
        },
      });
    } catch (e: any) {
      // console.error('[Timeline] Failed to publish BillingCompleted event:', e.message);
    }

    return data;
  },

  async applyPackageBilling(hospitalId: string, patientId: string, packageId: string) {
    const supabase = createClient();

    // In a real system we would lookup package pricing. Here we apply a static packaged price.
    const invoiceNumber = 'INV-PKG-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const packagedAmount = 25000.0; // flat package fee

    const { data, error } = await supabase
      .from('invoices')
      .insert({
        hospital_id: hospitalId,
        patient_id: patientId,
        invoice_number: invoiceNumber,
        source: 'PACKAGE',
        status: 'DRAFT',
        subtotal: packagedAmount,
        total_amount: packagedAmount,
        balance_amount: packagedAmount,
        payload: { packageId, packageName: 'Maternity Package Core' },
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async refundBill(invoiceId: string, amount: number, reason: string) {
    const supabase = createClient();

    // 1. Fetch current invoice details
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();
    if (fetchError || !invoice) throw new Error('Invoice not found');

    const totalRefunded = Number(invoice.payload?.refundedAmount || 0) + amount;
    if (totalRefunded > Number(invoice.total_amount)) {
      throw new Error('Refund amount exceeds total invoice amount');
    }

    // 2. Update invoice status / refund payload
    const { data: updatedInvoice, error: updateError } = await supabase
      .from('invoices')
      .update({
        status: totalRefunded === Number(invoice.total_amount) ? 'REFUNDED' : invoice.status,
        payload: {
          ...invoice.payload,
          refundedAmount: totalRefunded,
          refundReason: reason,
        },
      })
      .eq('id', invoiceId)
      .select()
      .single();
    if (updateError) throw updateError;

    // 3. Log a refund audit transaction
    await supabase.from('audit_logs').insert({
      hospital_id: invoice.hospital_id,
      action: 'INVOICE_REFUND',
      entity_name: 'invoices',
      entity_id: invoiceId,
      payload: { refundAmount: amount, reason },
    });

    return updatedInvoice;
  },
};
