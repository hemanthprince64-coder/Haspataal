export type InvoiceInputLine = {
  description: string;
  type: 'CONSULTATION' | 'PROCEDURE' | 'LAB_TEST' | 'IMAGING' | 'BED_CHARGE' | 'MEDICINE' | 'PACKAGE';
  serviceId?: string | null;
  quantity?: number;
  unitPrice: number;
  gstRate?: number;
  gstInclusive?: boolean;
  discountAmount?: number;
  metadata?: Record<string, unknown>;
};

export function calculateInvoiceLine(line: InvoiceInputLine) {
  const quantity = line.quantity ?? 1;
  const gross = quantity * line.unitPrice;
  const discountAmount = line.discountAmount ?? 0;
  const net = Math.max(gross - discountAmount, 0);
  const gstRate = line.gstRate ?? 0;
  const gstFactor = gstRate / 100;

  const taxableAmount = line.gstInclusive && gstFactor > 0 ? net / (1 + gstFactor) : net;
  const gstAmount = line.gstInclusive ? net - taxableAmount : taxableAmount * gstFactor;
  const totalAmount = line.gstInclusive ? net : taxableAmount + gstAmount;

  return {
    quantity,
    discountAmount: roundMoney(discountAmount),
    taxableAmount: roundMoney(taxableAmount),
    gstAmount: roundMoney(gstAmount),
    totalAmount: roundMoney(totalAmount),
  };
}

export function summarizeInvoice(lines: InvoiceInputLine[]) {
  const calculated = lines.map((line) => ({ input: line, amounts: calculateInvoiceLine(line) }));
  return {
    lines: calculated,
    subtotal: roundMoney(calculated.reduce((sum, line) => sum + line.amounts.taxableAmount, 0)),
    gstTotal: roundMoney(calculated.reduce((sum, line) => sum + line.amounts.gstAmount, 0)),
    discountTotal: roundMoney(calculated.reduce((sum, line) => sum + line.amounts.discountAmount, 0)),
    totalAmount: roundMoney(calculated.reduce((sum, line) => sum + line.amounts.totalAmount, 0)),
  };
}

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function invoiceNumber(prefix = 'INV') {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  return `${prefix}-${stamp}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
