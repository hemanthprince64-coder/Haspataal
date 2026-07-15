const fs = require('fs');
let content = fs.readFileSync(
  'packages/core/domain/referral/__tests__/phase5b6-referral.integration.test.ts',
  'utf8',
);

content = content.replace(
  `    // Create Catalog
    const cat = await prisma.clinicalOrderCatalog.create({
      data: {
        hospitalId: testHospitalId,
        catalogVersionId: testCatalogVersionId,
              code: 'REF_CARDIO',
        name: 'Cardiology Referral',
        type: 'REFERRAL',
        versions: {
          create: [{ versionNumber: 1, createdBy: 'test' }],
        },
      },
      include: { versions: true },
    });
    testCatalogVersionId = cat.versions[0].id;

    // Create a canonical REFERRAL order
    const order = await prisma.order.create({
      data: {
        hospitalId: testHospitalId,
        patientId: testPatientId,
        clinicalContext: 'IPD',
        orderedBy: primaryDoctorId,
        items: {
          create: [
            {
              hospitalId: testHospitalId,
              patientId: testPatientId,
              code: 'REF_CARDIO',
              name: 'Cardiology Referral',
              quantity: 1,
            },
          ],
        },
      },
      include: { items: true },
    });`,
  `    // Create Catalog
    const cat = await prisma.clinicalOrderCatalog.create({
      data: {
        hospitalId: testHospitalId,
        code: 'REF_CARDIO',
        name: 'Cardiology Referral',
        type: 'REFERRAL',
        versions: {
          create: [{ versionNumber: 1, createdBy: 'test' }],
        },
      },
      include: { versions: true },
    });
    testCatalogVersionId = cat.versions[0].id;

    // Create a canonical REFERRAL order
    const order = await prisma.order.create({
      data: {
        hospitalId: testHospitalId,
        patientId: testPatientId,
        clinicalContext: 'IPD',
        orderedBy: primaryDoctorId,
        items: {
          create: [
            {
              hospitalId: testHospitalId,
              patientId: testPatientId,
              catalogVersionId: testCatalogVersionId,
              code: 'REF_CARDIO',
              name: 'Cardiology Referral',
              quantity: 1,
            },
          ],
        },
      },
      include: { items: true },
    });`,
);

content = content.replace(
  `        items: {
          create: [{ hospitalId: testHospitalId, patientId: testPatientId, catalogVersionId: testCatalogVersionId,
              code: 'REF2', name: 'Ref2', quantity: 1 }],
        },`,
  `        items: {
          create: [{ hospitalId: testHospitalId, patientId: testPatientId, catalogVersionId: testCatalogVersionId, code: 'REF2', name: 'Ref2', quantity: 1 }],
        },`,
);

content = content.replace(
  `        items: {
          create: [{ hospitalId: testHospitalId, patientId: testPatientId, catalogVersionId: testCatalogVersionId,
              code: 'REF3', name: 'Ref3', quantity: 1 }],
        },`,
  `        items: {
          create: [{ hospitalId: testHospitalId, patientId: testPatientId, catalogVersionId: testCatalogVersionId, code: 'REF3', name: 'Ref3', quantity: 1 }],
        },`,
);

fs.writeFileSync(
  'packages/core/domain/referral/__tests__/phase5b6-referral.integration.test.ts',
  content,
);
console.log('Fixed test');
