import { prisma } from '@haspataal/db';
import { SearchService, PostgresSearchProvider } from '@haspataal/search';
import type { EntityType } from '@haspataal/search';

import { NextResponse } from 'next/server';

const provider = new PostgresSearchProvider(prisma);
const searchService = new SearchService(provider);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const action = searchParams.get('action') || 'search';

    if (!query) {
      return NextResponse.json({ error: 'Query parameter required' }, { status: 400 });
    }

    if (action === 'autocomplete') {
      const types = searchParams.get('types')?.split(',') as EntityType[] | undefined;
      const limit = parseInt(searchParams.get('limit') || '10');
      const hospitalId = searchParams.get('hospitalId') || undefined;

      const results = await searchService.autocomplete(query, limit, types, hospitalId);
      return NextResponse.json({ suggestions: results.suggestions, tookMs: results.tookMs });
    }

    const types = searchParams.get('types')?.split(',') as EntityType[] | undefined;
    const limit = parseInt(searchParams.get('limit') || '20');
    const hospitalId = searchParams.get('hospitalId') || undefined;

    const results = await searchService.search({
      text: query,
      types,
      limit,
      hospitalId,
      sort: 'relevance',
      order: 'desc',
    });
    return NextResponse.json(results);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'seed-catalog') {
      await seedMedicineCatalog();
      await seedInvestigationCatalog();
      return NextResponse.json({ success: true, message: 'Catalogs seeded successfully' });
    }

    if (action === 'seed-all') {
      await seedMedicineCatalog();
      await seedInvestigationCatalog();
      await seedPatients();
      await seedDoctors();
      await seedAppointments();
      await seedTimelineEvents();
      return NextResponse.json({ success: true, message: 'All entities seeded successfully' });
    }

    if (action === 'index-medicine') {
      const { drugId, drugName, genericName, strength, formulation } = body;
      await searchService.index({
        entityType: 'medicine',
        entityId: drugId,
        title: drugName,
        content: `${genericName || ''} ${strength || ''} ${formulation || ''}`.trim(),
        metadata: { genericName, strength, formulation },
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'index-investigation') {
      const { testId, testName, testCode, sampleType, fastingRequired } = body;
      await searchService.index({
        entityType: 'investigation',
        entityId: testId,
        title: testName,
        content: `${testCode || ''} ${sampleType || ''}`.trim(),
        metadata: { testCode, sampleType, fastingRequired },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function seedMedicineCatalog() {
  const drugs = await prisma.drugMaster.findMany({
    select: { id: true, name: true, genericName: true, strength: true, formulation: true },
  });

  for (const drug of drugs) {
    await searchService.index({
      entityType: 'medicine',
      entityId: drug.id,
      title: drug.name,
      content: `${drug.genericName || ''} ${drug.strength || ''} ${drug.formulation || ''}`.trim(),
      metadata: {
        genericName: drug.genericName,
        strength: drug.strength,
        formulation: drug.formulation,
      },
    });
  }
}

async function seedInvestigationCatalog() {
  const investigations = await prisma.investigationMaster.findMany({
    select: { id: true, testName: true, testCode: true, sampleType: true, fastingRequired: true },
  });

  for (const test of investigations) {
    await searchService.index({
      entityType: 'investigation',
      entityId: test.id,
      title: test.testName,
      content: `${test.testCode || ''} ${test.sampleType || ''}`.trim(),
      metadata: {
        testCode: test.testCode,
        sampleType: test.sampleType,
        fastingRequired: test.fastingRequired,
      },
    });
  }
}

async function seedPatients() {
  const patients = await prisma.patient.findMany();
  for (const p of patients) {
    await searchService.index({
      entityType: 'patient',
      entityId: p.id,
      title: p.name.trim(),
      content: `Phone: ${p.phone} Gender: ${p.gender || ''}`,
      metadata: p as any,
    });
  }
}

async function seedDoctors() {
  const doctors = await prisma.doctorMaster.findMany();
  for (const d of doctors) {
    await searchService.index({
      entityType: 'doctor',
      entityId: d.id,
      title: d.fullName.trim(),
      content: `Email: ${d.email} Mobile: ${d.mobile}`,
      metadata: d as any,
    });
  }
}

async function seedAppointments() {
  const appointments = await prisma.appointment.findMany();
  for (const a of appointments) {
    await searchService.index({
      entityType: 'appointment',
      entityId: a.id,
      hospitalId: a.hospitalId || undefined,
      title: `Appointment ${a.id}`,
      content: `Date: ${a.date} Slot: ${a.slot} Status: ${a.status}`,
      metadata: a as any,
    });
  }
}

async function seedTimelineEvents() {
  const events = await prisma.timelineEvent.findMany();
  for (const e of events) {
    await searchService.index({
      entityType: 'timeline',
      entityId: e.id,
      hospitalId: e.hospitalId || undefined,
      title: e.title,
      content: e.description || e.summary || JSON.stringify(e.metadata),
      metadata: e as any,
    });
  }
}
