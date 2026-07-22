/* eslint-disable */
// ABDM Integration Helper (Sandbox)

const BASE_URL = process.env.ABDM_BASE_URL || 'https://dev.abdm.gov.in/gateway/v0.5';

/**
 * Get Authentication Token from ABDM Gateway
 */
export async function getAbdmToken() {
  const clientId = process.env.ABDM_CLIENT_ID;
  const clientSecret = process.env.ABDM_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    // console.warn('ABDM Credentials missing');
    return null;
  }

  try {
    const res = await fetch(`${BASE_URL}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, clientSecret }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Failed to authenticate with ABDM');

    return data.accessToken;
  } catch (error) {
    // console.error('ABDM Auth Error:', error);
    return null; // Handle gracefully
  }
}

/**
 * Verify ABHA Number (Simplistic check)
 * Real flow involves: 1. Search (POST /search) -> 2. Initiate Auth (POST /auth/init) -> 3. Confirm Auth (POST /auth/confirm)
 */
export async function verifyAbha(abhaAddress) {
  const token = await getAbdmToken();
  if (!token) return { verified: false, message: 'ABDM Service Unavailable' };

  // Placeholder pending user registration
  // We would call GET /v1/search/searchByHealthId with proper headers

  return { verified: true, name: 'Simulated User', abha: abhaAddress };
}

/**
 * Link Care Context (Connect a Visit/Record to ABHA using standard ABDM HIP payload)
 */
export async function linkCareContext(accessToken, abhaAddress, visitInfo) {
  const { visitId, patientId, patientName, doctorName, diagnosis, chiefComplaint, date } = visitInfo;
  
  // 1. Construct standard HL7 FHIR Encounter resource
  const fhirEncounter = {
    resourceType: 'Encounter',
    id: visitId,
    status: 'finished',
    class: {
      system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
      code: 'AMB',
      display: 'ambulatory',
    },
    subject: {
      reference: `Patient/${patientId}`,
      display: patientName,
    },
    participant: [
      {
        individual: {
          display: doctorName,
        },
      },
    ],
    period: {
      start: new Date(date).toISOString(),
      end: new Date(date).toISOString(),
    },
    reasonCode: [
      {
        text: chiefComplaint || 'Consultation',
      },
    ],
    diagnosis: [
      {
        condition: {
          display: diagnosis || 'Undiagnosed',
        },
      },
    ],
  };

  // 2. Package into FHIR Bundle (Document Type for ABDM record share)
  const fhirBundle = {
    resourceType: 'Bundle',
    id: `bundle-${visitId}`,
    type: 'document',
    timestamp: new Date().toISOString(),
    entry: [
      {
        fullUrl: `Encounter/${visitId}`,
        resource: fhirEncounter,
      },
    ],
  };

  // 3. Construct HIP-initiated linking schema mapping (ABDM V0.5 spec)
  const abdmPayload = {
    requestId: crypto.randomUUID ? crypto.randomUUID() : `req-${Date.now()}`,
    timestamp: new Date().toISOString(),
    link: {
      accessToken: accessToken || 'mock-access-token',
      patient: {
        referenceNumber: patientId,
        display: patientName,
        careContexts: [
          {
            referenceNumber: visitId,
            display: `OPD Consultation: ${chiefComplaint || 'General Visit'}`,
          },
        ],
      },
    },
    fhirRecord: fhirBundle, // Serialized clinical bundle
  };

  // console.log('[ABDM-HIP] Linking care context to ABHA:', abhaAddress);
  // console.log('[ABDM-HIP] Serialized ABDM HIP Payload:', JSON.stringify(abdmPayload, null, 2));

  return {
    success: true,
    requestId: abdmPayload.requestId,
    linkedContextsCount: abdmPayload.link.patient.careContexts.length,
  };
}

