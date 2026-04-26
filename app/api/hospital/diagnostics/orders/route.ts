import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { invoiceNumber, summarizeInvoice } from "@/lib/billing/invoice";
import { hospitalAccessError, requireHospitalAccess, writeAuditLog } from "@/lib/auth/hospital-access";

const orderSchema = z.object({
  patientId: z.string().min(1),
  doctorId: z.string().optional().nullable(),
  testIds: z.array(z.string().min(1)).min(1),
  createInvoice: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  let access;
  try {
    access = await requireHospitalAccess("diagnostics", "read");
  } catch (error) {
    return hospitalAccessError(error);
  }

  const orders = await prisma.diagnosticOrder.findMany({
    where: { hospitalId: access.hospitalId },
    include: {
      patient: { select: { id: true, name: true, phone: true } },
      doctor: { select: { id: true, fullName: true } },
      items: { include: { test: true, results: true } },
      invoices: { select: { id: true, invoiceNumber: true, status: true, totalAmount: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  let access;
  try {
    access = await requireHospitalAccess("diagnostics", "create");
  } catch (error) {
    return hospitalAccessError(error);
  }

  const body = await req.json().catch(() => null);
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 422 });
  }

  const data = parsed.data;
  const result = await prisma.$transaction(async (tx) => {
    const pricing = await tx.hospitalDiagnosticPricing.findMany({
      where: { hospitalId: access.hospitalId, testId: { in: data.testIds }, isAvailable: true },
      include: { test: true },
    });
    if (pricing.length !== data.testIds.length) throw new Error("PRICING_MISSING");

    const totalAmount = pricing.reduce((sum, item) => sum + Number(item.price), 0);
    const order = await tx.diagnosticOrder.create({
      data: {
        hospitalId: access.hospitalId,
        patientId: data.patientId,
        doctorId: data.doctorId ?? null,
        orderStatus: "ORDERED",
        totalAmount,
        items: {
          create: pricing.map((item) => ({
            testId: item.testId,
            priceAtOrder: item.price,
            status: "ORDERED",
          })),
        },
      },
      include: { items: { include: { test: true } }, patient: true },
    });

    const invoice = data.createInvoice
      ? await tx.invoice.create({
          data: {
            hospitalId: access.hospitalId,
            patientId: data.patientId,
            diagnosticOrderId: order.id,
            invoiceNumber: invoiceNumber("LAB"),
            source: "DIAGNOSTICS",
            status: "FINALIZED",
            finalizedAt: new Date(),
            ...(() => {
              const summary = summarizeInvoice(pricing.map((item) => ({
                description: item.test.testName,
                type: "LAB_TEST" as const,
                quantity: 1,
                unitPrice: Number(item.price),
                gstRate: 0,
              })));
              return {
                subtotal: summary.subtotal,
                gstTotal: summary.gstTotal,
                discountTotal: summary.discountTotal,
                totalAmount: summary.totalAmount,
                balanceAmount: summary.totalAmount,
                lineItems: {
                  create: summary.lines.map(({ input, amounts }) => ({
                    description: input.description,
                    type: input.type,
                    quantity: amounts.quantity,
                    unitPrice: input.unitPrice,
                    gstRate: input.gstRate ?? 0,
                    gstInclusive: false,
                    discountAmount: amounts.discountAmount,
                    taxableAmount: amounts.taxableAmount,
                    gstAmount: amounts.gstAmount,
                    totalAmount: amounts.totalAmount,
                  })),
                },
              };
            })(),
          },
        })
      : null;

    return { order, invoice };
  }).catch((error) => {
    if (error instanceof Error && error.message === "PRICING_MISSING") return null;
    throw error;
  });

  if (!result) return NextResponse.json({ error: "One or more tests are not priced for this hospital" }, { status: 422 });

  await writeAuditLog({
    hospitalId: access.hospitalId,
    userId: access.user.id,
    action: "create",
    entity: "diagnostic_order",
    entityId: result.order.id,
    details: { invoiceId: result.invoice?.id },
  });

  return NextResponse.json(result, { status: 201 });
}
