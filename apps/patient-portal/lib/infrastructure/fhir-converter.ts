/* eslint-disable */
export interface FHIRResource {
  resourceType: string;
  id?: string;
  [key: string]: any;
}

export function toFhirPatient(patient: any): FHIRResource {
  return {
    resourceType: 'Patient',
    id: patient.id,
    identifier: [
      {
        use: 'official',
        type: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0203', code: 'MR', display: 'Medical Record Number' }] },
        value: patient.id,
      },
      ...(patient.abhaAddress ? [{ system: 'https://ndhm.gov.in/abha-address', value: patient.abhaAddress }] : []),
    ],
    active: true,
    name: [{ use: 'official', text: patient.name }],
    telecom: [
      ...(patient.phone ? [{ system: 'phone', value: patient.phone, use: 'mobile' }] : []),
      ...(patient.email ? [{ system: 'email', value: patient.email }] : []),
    ],
    gender: patient.gender ? patient.gender.toLowerCase() : 'unknown',
    birthDate: patient.dob ? new Date(patient.dob).toISOString().split('T')[0] : undefined,
  };
}

export function toFhirObservation(vitals: {
  systolicBp?: number;
  diastolicBp?: number;
  weightKg?: number;
  fundalHeightCm?: number;
  fetalHeartRate?: number;
  hemoglobin?: number;
  bloodSugar?: number;
  gestationalAge?: number;
}, patientId: string, doctorId: string, timestamp: number | Date): FHIRResource {
  const ts = timestamp instanceof Date ? timestamp.toISOString() : new Date(timestamp).toISOString();
  const components: any[] = [];
  const map: [keyof typeof vitals, string, string, string?][] = [
    ['systolicBp',      '8480-6', 'Systolic blood pressure', 'mmHg'],
    ['diastolicBp',     '8462-4', 'Diastolic blood pressure', 'mmHg'],
    ['weightKg',        '29463-7', 'Body weight', 'kg'],
    ['fundalHeightCm',  '11727-3', 'Fundal height', 'cm'],
    ['fetalHeartRate',  '8862-5', 'Fetal heart rate', '/min'],
    ['hemoglobin',      '718-7',  'Hemoglobin', 'g/dL'],
    ['bloodSugar',      '2339-0', 'Glucose [mass/vol]', 'mg/dL'],
  ];

  for (const [key, code, display, unit] of map) {
    const v = vitals[key];
    if (v != null) {
      components.push({
        code: { coding: [{ system: 'http://loinc.org', code, display }] },
        valueQuantity: { value: Number(v), unit, system: 'http://unitsofmeasure.org', code: unit },
      });
    }
  }

  if (vitals.gestationalAge != null) {
    components.push({
      code: { coding: [{ system: 'http://loinc.org', code: '11728-1', display: 'Gestational age' }] },
      valueQuantity: { value: Number(vitals.gestationalAge), unit: 'wk', system: 'http://unitsofmeasure.org', code: 'wk' },
    });
  }

  return {
    resourceType: 'Observation',
    status: 'final',
    category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs', display: 'Vital Signs' }] }],
    code: { coding: [{ system: 'http://loinc.org', code: '85354-9', display: 'Blood pressure panel with all children optional' }], text: 'ANC Vitals Bundle' },
    subject: { reference: `Patient/${patientId}` },
    performer: doctorId ? [{ reference: `Practitioner/${doctorId}` }] : [],
    effectiveDateTime: ts, component: components,
  };
}

export function toFhirEncounter(visit: any): FHIRResource {
  return {
    resourceType: 'Encounter',
    id: visit.id,
    status: 'finished',
    class: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'AMB', display: 'ambulatory' },
    subject: { reference: `Patient/${visit.patientId}`, display: visit.patient?.name || 'Patient' },
    participant: visit.doctorId ? [{ individual: { reference: `Practitioner/${visit.doctorId}`, display: visit.doctor?.name || 'Doctor' } }] : [],
    period: { start: new Date(visit.createdAt).toISOString(), end: new Date(visit.createdAt).toISOString() },
    reasonCode: [{ text: visit.chiefComplaint || 'ANTENATAL' }],
    diagnosis: visit.diagnosis ? [{ condition: { display: visit.diagnosis } }] : [],
  };
}

export function toFhirPregnancyProfile(profile: any, patientRef: string): FHIRResource {
  return {
    resourceType: 'Observation',
    id: `pregnancy-profile-${profile.id}`,
    status: 'final',
    category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'social-history', display: 'Social History' }] }],
    code: { coding: [{ system: 'http://loinc.org', code: '82810-3', display: 'Pregnancy status' }], text: 'Pregnancy Profile' },
    subject: { reference: patientRef },
    effectiveDateTime: profile.updatedAt ? new Date(profile.updatedAt).toISOString() : new Date().toISOString(),
    component: [
      ...(profile.lmp ? [{ code: { coding: [{ system: 'http://loinc.org', code: '86645-9', display: 'Last menstrual period date' }] }, valueDateTime: new Date(profile.lmp).toISOString() }] : []),
      ...(profile.edd ? [{ code: { coding: [{ system: 'http://loinc.org', code: '11778-6', display: 'Estimated date of delivery' }] }, valueDateTime: new Date(profile.edd).toISOString() }] : []),
      ...(profile.gestationalAge != null ? [{ code: { coding: [{ system: 'http://loinc.org', code: '11728-1', display: 'Gestational age' }] }, valueQuantity: { value: Number(profile.gestationalAge), unit: 'wk', system: 'http://unitsofmeasure.org', code: 'wk' } }] : []),
      ...(profile.bloodGroup ? [{ code: { coding: [{ system: 'http://loinc.org', code: '883-9', display: 'Blood type' }] }, valueString: profile.bloodGroup }] : []),
      ...(profile.rhFactor ? [{ code: { coding: [{ system: 'http://loinc.org', code: '10331-7', display: 'Rh type' }] }, valueString: profile.rhFactor }] : []),
      ...(profile.para != null ? [{ code: { coding: [{ system: 'http://loinc.org', code: '49052-4', display: 'Parity' }] }, valueInteger: profile.para }] : []),
      ...(profile.gravida != null ? [{ code: { coding: [{ system: 'http://loinc.org', code: '49051-6', display: 'Gravidity' }] }, valueInteger: profile.gravida }] : []),
      ...(profile.bmiPrePregnancy ? [{ code: { coding: [{ system: 'http://loinc.org', code: '39156-5', display: 'Body mass index (BMI)' }] }, valueQuantity: { value: Number(profile.bmiPrePregnancy), unit: 'kg/m2', system: 'http://unitsofmeasure.org', code: 'kg/m2' } }] : []),
      ...(Array.isArray(profile.highRiskReasons) && profile.highRiskReasons.length ? [{ code: { coding: [{ system: 'http://loinc.org', code: '75323-6', display: 'Risk alert' }] }, valueString: profile.highRiskReasons.join('; ') }] : []),
    ],
  };
}

export function toFhirBundle(resources: FHIRResource[]): FHIRResource {
  return { resourceType: 'Bundle', type: 'collection', total: resources.length, entry: resources.map(r => ({ resource: r })) };
}
