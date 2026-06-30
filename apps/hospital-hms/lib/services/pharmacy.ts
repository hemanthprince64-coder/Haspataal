import { createClient } from '@/lib/supabase/client';

export const PharmacyService = {
  async getInventory(hospitalId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('drug_stocks')
      .select('*')
      .eq('hospital_id', hospitalId);
    if (error) throw error;
    return data;
  },

  async dispenseDrug(
    hospitalId: string,
    patientId: string,
    items: Array<{ drugStockId: string; quantity: number }>,
    visitId?: string,
    admissionId?: string,
  ) {
    const supabase = createClient();

    // 1. Process stock reduction and fetch items
    const dispensedItems = [];
    let totalChargeAmount = 0;

    for (const item of items) {
      const { data: stock, error: fetchError } = await supabase
        .from('drug_stocks')
        .select('*')
        .eq('id', item.drugStockId)
        .single();
      if (fetchError || !stock) throw new Error(`Drug stock not found: ${item.drugStockId}`);

      if (stock.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for drug: ${stock.name}. Available: ${stock.stock}, Requested: ${item.quantity}`,
        );
      }

      const newStock = stock.stock - item.quantity;
      const { error: updateError } = await supabase
        .from('drug_stocks')
        .update({ stock: newStock })
        .eq('id', item.drugStockId);
      if (updateError) throw updateError;

      const mrp = Number(stock.mrp || 0);
      const totalPrice = mrp * item.quantity;
      totalChargeAmount += totalPrice;

      dispensedItems.push({
        drugStockId: item.drugStockId,
        name: stock.name,
        quantity: item.quantity,
        unitPrice: mrp,
        totalPrice,
      });

      // Log stock reduction audit
      await this.logInventoryAudit(
        hospitalId,
        item.drugStockId,
        'DISPENSE',
        -item.quantity,
        `Dispensed to patient ${patientId}`,
      );
    }

    // 2. Connect to billing: If visit or admission is provided, create invoice/charges
    if (visitId || admissionId) {
      const invoiceNumber = 'INV-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const { error: invoiceError } = await supabase.from('invoices').insert({
        hospital_id: hospitalId,
        patient_id: patientId,
        admission_id: admissionId || null,
        invoice_number: invoiceNumber,
        source: admissionId ? 'IPD' : 'OPD',
        status: 'DRAFT',
        subtotal: totalChargeAmount,
        total_amount: totalChargeAmount,
        balance_amount: totalChargeAmount,
        payload: { dispensedItems },
      });
      if (invoiceError) throw invoiceError;
    }

    // Emit event
    const { eventBus } = await import('@haspataal/events');
    await eventBus.publish({
      id: crypto.randomUUID(),
      type: 'DrugDispensed',
      payload: {
        patientId,
        items: dispensedItems,
        totalAmount: totalChargeAmount,
      },
      timestamp: new Date(),
      hospitalId,
    });

    // Timeline Engine publish
    try {
      const { getTimelinePublisher } = await import('@haspataal/timeline');
      for (const item of dispensedItems) {
        await getTimelinePublisher().publish({
          patientId,
          hospitalId,
          eventType: 'DrugDispensed',
          title: `Drug Dispensed: ${item.name}`,
          subtitle: `Qty: ${item.quantity}`,
          summary: `Dispensed drug stock ${item.drugStockId}. MRP per unit: ₹${item.unitPrice.toFixed(2)}. Total: ₹${item.totalPrice.toFixed(2)}.`,
          timestamp: new Date(),
          category: 'PRESCRIPTION',
          module: 'pharmacy',
          severity: 'LOW',
          metadata: {
            drugStockId: item.drugStockId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          },
        });
      }
    } catch (e: any) {
      console.error('[Timeline] Failed to publish DrugDispensed event:', e);
    }

    return { dispensedItems, totalAmount: totalChargeAmount };
  },

  async logInventoryAudit(
    hospitalId: string,
    drugStockId: string,
    type: string,
    changeQty: number,
    reason: string,
  ) {
    const supabase = createClient();
    const { error } = await supabase.from('audit_logs').insert({
      hospital_id: hospitalId,
      action: `DRUG_STOCK_${type}`,
      entity_name: 'drug_stocks',
      entity_id: drugStockId,
      payload: { changeQty, reason },
    });
    if (error) throw error;
  },
};
