/* eslint-disable */
import { prisma } from '@haspataal/db';

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
    // 1. Process stock reduction, fetch items, and create invoice within a single transaction
    const { dispensedItems, totalChargeAmount } = await prisma.$transaction(async (tx) => {
      const dispensedItems = [];
      let totalChargeAmount = 0;

      for (const item of items) {
        // PESSIMISTIC LOCK: Lock the specific batch row against concurrent reads
        const stocks: any[] = await tx.$queryRaw`
          SELECT * FROM drug_stocks 
          WHERE id = ${item.drugStockId} 
          FOR UPDATE
        `;

        if (!stocks || stocks.length === 0) {
          throw new Error(`Drug stock not found: ${item.drugStockId}`);
        }

        const stock = stocks[0];

        if (stock.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for drug: ${stock.name}. Available: ${stock.stock}, Requested: ${item.quantity}`,
          );
        }

        const newStock = stock.stock - item.quantity;
        await tx.$executeRaw`
          UPDATE drug_stocks 
          SET stock = ${newStock} 
          WHERE id = ${item.drugStockId}
        `;

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

        // Log stock reduction audit inside transaction
        await tx.$executeRaw`
          INSERT INTO audit_logs (hospital_id, action, entity_name, entity_id, payload)
          VALUES (
            ${hospitalId}, 
            'DRUG_STOCK_DISPENSE', 
            'drug_stocks', 
            ${item.drugStockId}, 
            ${JSON.stringify({ changeQty: -item.quantity, reason: `Dispensed to patient ${patientId}` })}::jsonb
          )
        `;
      }

      // Connect to billing: If visit or admission is provided, create invoice/charges
      if (visitId || admissionId) {
        const invoiceNumber = 'INV-' + Math.random().toString(36).substring(2, 8).toUpperCase();

        await tx.$executeRaw`
          INSERT INTO invoices (
            hospital_id, patient_id, admission_id, invoice_number, 
            source, status, subtotal, total_amount, balance_amount, payload
          ) VALUES (
            ${hospitalId}, 
            ${patientId}, 
            ${admissionId ? admissionId : null}, 
            ${invoiceNumber}, 
            ${admissionId ? 'IPD' : 'OPD'}, 
            'DRAFT', 
            ${totalChargeAmount}, 
            ${totalChargeAmount}, 
            ${totalChargeAmount}, 
            ${JSON.stringify({ dispensedItems })}::jsonb
          )
        `;
      }

      return { dispensedItems, totalChargeAmount };
    });

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
      occurredAt: new Date(),
      hospitalId,
    } as any);

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
      // console.error('[Timeline] Failed to publish DrugDispensed event:', e);
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
