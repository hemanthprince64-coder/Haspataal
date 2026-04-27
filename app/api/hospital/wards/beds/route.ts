import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getHospitalIdFromSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const beds = await prisma.bed.findMany({
    where: { hospitalId },
    include: { unit: { include: { department: true } } },
    orderBy: { bedNumber: 'asc' }
  });

  return NextResponse.json({ beds });
}

export async function POST(req: NextRequest) {
  const hospitalId = await getHospitalIdFromSession(req);
  if (!hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { prefix, count, type, deptId } = await req.json();

  // Validate input
  if (!deptId || !prefix || !count || count < 1) {
    return NextResponse.json(
      { error: 'Missing required fields: deptId, prefix, count (positive number)' },
      { status: 400 }
    );
  }
  if (count > 100) {
    return NextResponse.json(
      { error: 'Cannot create more than 100 beds at once' },
      { status: 400 }
    );
  }

  try {
    // Verify department belongs to this hospital
    const department = await prisma.department.findFirst({
      where: { id: deptId, hospitalId }
    });
    if (!department) {
      return NextResponse.json(
        { error: 'Department not found or access denied' },
        { status: 404 }
      );
    }

    // Create a new Unit under this department to contain these beds
    const unitName = `${department.name} - ${prefix} Ward`;
    const unit = await prisma.unit.create({
      data: {
        departmentId: deptId,
        name: unitName,
        capacity: count,
        bedType: type || "GENERAL",
        sortOrder: await prisma.unit.count({ where: { departmentId: deptId } }) + 1,
      }
    });

    // Create beds linked to this unit, with department reference for quick lookup
    const createdBeds = [];
    for (let i = 1; i <= count; i++) {
      const bed = await prisma.bed.create({
        data: {
          hospitalId,
          unitId: unit.id,
          departmentId: deptId,
          bedNumber: `${prefix}-${i.toString().padStart(3, '0')}`,
          type: type || "GENERAL",
          status: "AVAILABLE",
          isActive: true,
        }
      });
      createdBeds.push(bed);
    }

    return NextResponse.json({
      unit,
      beds: createdBeds,
      message: `Created ${count} beds in unit "${unitName}"`
    });
  } catch (error) {
    console.error('[wards/beds POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create beds. Please try again.' },
      { status: 500 }
    );
  }
}
