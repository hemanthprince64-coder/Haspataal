const fs = require('fs');
let content = fs.readFileSync(
  'packages/core/domain/referral/__tests__/phase5b6-referral.integration.test.ts',
  'utf8',
);

// Add testCatalogVersionId
content = content.replace(
  'let testExecutionItemId: string;',
  'let testExecutionItemId: string;\n  let testCatalogVersionId: string;',
);

// Create Catalog before Order
content = content.replace(
  '    // Create a canonical REFERRAL order',
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

    // Create a canonical REFERRAL order`,
);

// Add catalogVersionId to items
content = content.replace(
  "code: 'REF_CARDIO',",
  "catalogVersionId: testCatalogVersionId,\n              code: 'REF_CARDIO',",
);
content = content.replace(
  "code: 'REF2',",
  "catalogVersionId: testCatalogVersionId,\n              code: 'REF2',",
);
content = content.replace(
  "code: 'REF3',",
  "catalogVersionId: testCatalogVersionId,\n              code: 'REF3',",
);

fs.writeFileSync(
  'packages/core/domain/referral/__tests__/phase5b6-referral.integration.test.ts',
  content,
);
console.log('Fixed test catalog reference');
