const fs = require('fs');
let content = fs.readFileSync(
  'packages/core/domain/referral/__tests__/phase5b6-referral.integration.test.ts',
  'utf8',
);

content = content.replace(
  `              hospitalId: testHospitalId,
              patientId: testPatientId,
              catalogVersionId: testCatalogVersionId,
              code: 'REF_CARDIO',
              name: 'Cardiology Referral',
              quantity: 1,`,
  `              catalogVersionId: testCatalogVersionId,
              quantity: 1,`,
);

content = content.replace(
  `create: [{ hospitalId: testHospitalId, patientId: testPatientId, catalogVersionId: testCatalogVersionId, code: 'REF2', name: 'Ref2', quantity: 1 }],`,
  `create: [{ catalogVersionId: testCatalogVersionId, quantity: 1 }],`,
);

content = content.replace(
  `create: [{ hospitalId: testHospitalId, patientId: testPatientId, catalogVersionId: testCatalogVersionId, code: 'REF3', name: 'Ref3', quantity: 1 }],`,
  `create: [{ catalogVersionId: testCatalogVersionId, quantity: 1 }],`,
);

fs.writeFileSync(
  'packages/core/domain/referral/__tests__/phase5b6-referral.integration.test.ts',
  content,
);
console.log('Fixed test item schema');
