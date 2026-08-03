const fs = require('fs');
const p = 'packages/db/prisma/schema.prisma';
let c = fs.readFileSync(p, 'utf-8');

// Add relations to ClinicalOrder
c = c.replace(
  '  ImagingStudy ImagingStudy[]',
  `  ImagingStudy ImagingStudy[]
  PharmacyExecution PharmacyExecution?
  LaboratoryExecution LaboratoryExecution?
  RadiologyExecution RadiologyExecution?`,
);

// Remove relations from Order
c = c.replace(/  pharmacyExecution\s+PharmacyExecution\?\r?\n/g, '');
c = c.replace(/  LaboratoryExecution\s+LaboratoryExecution\?\r?\n/g, '');
c = c.replace(/  radiologyExecution\s+RadiologyExecution\?\r?\n/g, '');

fs.writeFileSync(p, c);
