const fs = require('fs');

const testFile = 'packages/core/domain/bloodbank/__tests__/phase5b5-bloodbank.integration.test.ts';
let content = fs.readFileSync(testFile, 'utf8');

content = content.replace(
  'let episodeId: string;',
  'let episodeId: string;\n  let testCatalogVersionId: string;',
);

content = content.replace(
  '// Create Blood Units',
  `// Create Catalog
    const cat = await prisma.clinicalOrderCatalog.create({
      data: {
        hospitalId: testHospitalId,
        code: 'PACKED_RBC',
        name: 'PRBC',
        type: 'BLOOD_BANK',
        versions: {
          create: [{ versionNumber: 1, createdBy: 'test', metadata: { volume: 300 } }]
        }
      },
      include: { versions: true }
    });
    testCatalogVersionId = cat.versions[0].id;

    // Create Blood Units`,
);

content = content.replace(
  /items: \{ create: \[\{ hospitalId: testHospitalId, patientId: testPatientId, code: 'PACKED_RBC', name: 'PRBC 1 Unit', quantity: 1, volume: 300, status: 'REQUESTED'.*?\}]/g,
  "items: { create: [{ catalogVersionId: testCatalogVersionId, quantity: 1, status: 'REQUESTED' }]",
);

fs.writeFileSync(testFile, content);
console.log('Fixed test file');
