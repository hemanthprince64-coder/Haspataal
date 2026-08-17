import { prisma } from '@haspataal/db';

export const JourneyTemplates = {
  pregnancy: {
    name: 'Antenatal Care',
    category: 'MATERNAL',
    stages: [
      {
        name: 'First Trimester',
        category: 'CLINICAL',
        tasks: ['Initial Visit', 'Hb-Normal', 'U/S-Dating'],
      },
      { name: 'Second Trimester', category: 'CLINICAL', tasks: ['Anomaly Scan', 'Glucose Screen'] },
      { name: 'Third Trimester', category: 'CLINICAL', tasks: ['Growth Scan', 'Final Visit'] },
      { name: 'Delivery', category: 'PROCEDURE', tasks: ['Admission', 'Delivery', 'Postnatal'] },
    ],
  },
  diabetes: {
    name: 'Diabetes Management',
    category: 'CHRONIC_DIABETES',
    stages: [
      { name: 'Diagnosis', category: 'CLINICAL', tasks: ['Confirm Diagnosis', 'HbA1c Test'] },
      { name: 'Lifestyle', category: 'LIFESTYLE', tasks: ['Diet Counseling', 'Exercise Plan'] },
      { name: 'Medication', category: 'CLINICAL', tasks: ['Prescribe', 'Follow-up Dose'] },
      { name: 'Monitoring', category: 'CLINICAL', tasks: ['Monthly HbA1c', 'Quarterly Eye Exam'] },
    ],
  },
  hypertension: {
    name: 'Hypertension Management',
    category: 'CHRONIC_HYPERTENSION',
    stages: [
      { name: 'Diagnosis', category: 'CLINICAL', tasks: ['BP Confirmation', 'Lab Work'] },
      { name: 'Medication', category: 'CLINICAL', tasks: ['Start Meds', 'Adjust Dose'] },
      { name: 'Monitoring', category: 'CLINICAL', tasks: ['Weekly BP Log', 'Monthly Check'] },
      { name: 'MNA', category: 'COMPLICATION', tasks: ['Kidney Function', 'Eye Check'] },
    ],
  },
};

export async function seedJourneyTemplates(hospitalId: string) {
  for (const template of Object.values(JourneyTemplates)) {
    await prisma.journeyTemplate.create({
      data: {
        ...template,
        hospitalId,
        stages: template.stages as any,
        isActive: true,
      },
    });
  }
}
