import { createClient } from '@/lib/supabase/client';

export const InsuranceService = {
  async verifyInsurance(
    hospitalId: string,
    patientId: string,
    policyNumber: string,
    insurerName: string,
    tpaName?: string,
  ) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('insurance_verifications')
      .insert({
        hospital_id: hospitalId,
        patient_id: patientId,
        policy_number: policyNumber,
        insurer_name: insurerName,
        tpa_name: tpaName || null,
        status: 'APPROVED', // pre-auth auto approved for general limits
        pre_auth_amount: 50000.0,
        verified_at: new Date(),
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async submitClaim(invoiceId: string, claimAmount: number) {
    const supabase = createClient();

    // Fetch invoice details
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();
    if (fetchError || !invoice) throw new Error('Invoice not found');

    const { data, error } = await supabase
      .from('insurance_claims')
      .insert({
        hospital_id: invoice.hospital_id,
        patient_id: invoice.patient_id,
        invoice_id: invoiceId,
        claim_amount: claimAmount,
        status: 'SUBMITTED',
        submitted_at: new Date(),
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async settleClaim(claimId: string, approvedAmount: number, settledAmount: number) {
    const supabase = createClient();

    // Fetch claim
    const { data: claim, error: fetchError } = await supabase
      .from('insurance_claims')
      .select('*')
      .eq('id', claimId)
      .single();
    if (fetchError || !claim) throw new Error('Claim not found');

    // Update claim
    const { data, error } = await supabase
      .from('insurance_claims')
      .update({
        status: 'PAID',
        approved_amount: approvedAmount,
        settled_amount: settledAmount,
        settled_at: new Date(),
      })
      .eq('id', claimId)
      .select()
      .single();
    if (error) throw error;

    // Deduct settled amount from invoice balance amount
    const { data: invoice, error: invoiceFetchError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', claim.invoice_id)
      .single();

    if (!invoiceFetchError && invoice) {
      const remainingBalance = Math.max(0, Number(invoice.balance_amount) - settledAmount);
      await supabase
        .from('invoices')
        .update({
          balance_amount: remainingBalance,
          paid_amount: Number(invoice.paid_amount) + settledAmount,
          status: remainingBalance === 0 ? 'PAID' : invoice.status,
          paid_at: remainingBalance === 0 ? new Date() : invoice.paid_at,
        })
        .eq('id', claim.invoice_id);
    }

    return data;
  },
};
