import * as fs from 'fs';
import * as path from 'path';

import { prisma } from '@/lib/util/prisma-singleton';

export interface DHIS2AggregateData {
  period: string; // YYYYMMDD
  orgUnit: string; // DHIS2 Organization Unit ID
  dataValues: Array<{
    dataElement: string; // DHIS2 Data Element ID
    categoryOptionCombo?: string; // category combo (e.g., Male/Female, age group)
    value: string;
  }>;
}

/**
 * DHIS2 & ADX Aggregate Reporting Worker
 * Generates nightly aggregate reports for health oversight.
 */
export async function runDHIS2Reporting(targetDate?: Date): Promise<void> {
  const date = targetDate || new Date();
  // Yesterday's boundaries
  const startOfYesterday = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - 1, 0, 0, 0),
  );
  const endOfYesterday = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - 1, 23, 59, 59),
  );

  const periodString = `${startOfYesterday.getUTCFullYear()}${String(startOfYesterday.getUTCMonth() + 1).padStart(2, '0')}${String(startOfYesterday.getUTCDate()).padStart(2, '0')}`;

  // Default Org Unit matching local operational profile or default district hospital
  const orgUnitId = process.env.DHIS2_ORG_UNIT || 'OU-BIHAR-PHC-123';

  console.log(
    `[DHIS2-Worker] Running aggregate queries for period: ${periodString} (${startOfYesterday.toISOString()} to ${endOfYesterday.toISOString()})`,
  );

  try {
    // 1. Total OPD Consultations (appointments)
    const opdCount = await prisma.appointment.count({
      where: {
        createdAt: {
          gte: startOfYesterday,
          lte: endOfYesterday,
        },
        status: { not: 'CANCELLED' },
      },
    });

    // 2. Patient registrations by gender
    const maleRegistrations = await prisma.patient.count({
      where: {
        createdAt: {
          gte: startOfYesterday,
          lte: endOfYesterday,
        },
        gender: { equals: 'MALE' },
      },
    });

    const femaleRegistrations = await prisma.patient.count({
      where: {
        createdAt: {
          gte: startOfYesterday,
          lte: endOfYesterday,
        },
        gender: { equals: 'FEMALE' },
      },
    });

    // 3. Malaria cases (based on visit diagnosis text containing malaria)
    const malariaCount = await prisma.visit.count({
      where: {
        createdAt: {
          gte: startOfYesterday,
          lte: endOfYesterday,
        },
        diagnosis: {
          contains: 'malaria',
        },
      },
    });

    // 4. ANC visits (Antenatal care)
    const ancCount = await prisma.visit.count({
      where: {
        createdAt: {
          gte: startOfYesterday,
          lte: endOfYesterday,
        },
        diagnosis: {
          contains: 'ANC',
        },
      },
    });

    // Construct DHIS2 JSON Data Value Set
    const reportData: DHIS2AggregateData = {
      period: periodString,
      orgUnit: orgUnitId,
      dataValues: [
        { dataElement: 'DE-OPD-TOTAL', value: String(opdCount) },
        { dataElement: 'DE-REG-MALE', value: String(maleRegistrations) },
        { dataElement: 'DE-REG-FEMALE', value: String(femaleRegistrations) },
        { dataElement: 'DE-DIAG-MALARIA', value: String(malariaCount) },
        { dataElement: 'DE-ANC-VISIT', value: String(ancCount) },
      ],
    };

    console.log('[DHIS2-Worker] Compiled DHIS2 JSON Payload:', JSON.stringify(reportData, null, 2));

    // Generate ADX (Aggregate Data Exchange) XML format
    const adxXml = `<?xml version="1.0" encoding="UTF-8"?>
<adx xmlns="urn:ihe:qrph:adx:2015"
     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
     xsi:schemaLocation="urn:ihe:qrph:adx:2015 ADX.xsd"
     source="${orgUnitId}"
     exported="${new Date().toISOString()}">
  <group period="${periodString}" orgUnit="${orgUnitId}">
    <dataValue dataElement="DE-OPD-TOTAL" value="${opdCount}" />
    <dataValue dataElement="DE-REG-MALE" value="${maleRegistrations}" />
    <dataValue dataElement="DE-REG-FEMALE" value="${femaleRegistrations}" />
    <dataValue dataElement="DE-DIAG-MALARIA" value="${malariaCount}" />
    <dataValue dataElement="DE-ANC-VISIT" value="${ancCount}" />
  </group>
</adx>
`;

    // Save report locally for offline/air-gapped export
    const reportsDir = path.resolve(__dirname, '../apps/patient-portal/public/reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportPath = path.join(reportsDir, `dhis2-adx-${periodString}.xml`);
    fs.writeFileSync(reportPath, adxXml, 'utf8');
    console.log(`[DHIS2-Worker] Offline ADX XML report successfully saved to: ${reportPath}`);

    // If online, optionally push to DHIS2 Web API
    if (process.env.DHIS2_API_URL && process.env.DHIS2_USERNAME && process.env.DHIS2_PASSWORD) {
      console.log('[DHIS2-Worker] Online mode: Pushing aggregate data to central DHIS2 API...');
      const authHeader =
        'Basic ' +
        Buffer.from(`${process.env.DHIS2_USERNAME}:${process.env.DHIS2_PASSWORD}`).toString(
          'base64',
        );
      const response = await fetch(`${process.env.DHIS2_API_URL}/dataValueSets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify(reportData),
      });

      if (response.ok) {
        console.log('[DHIS2-Worker] Successfully pushed report to DHIS2 Server.');
      } else {
        console.error('[DHIS2-Worker] DHIS2 server rejected request:', response.statusText);
      }
    }
  } catch (err) {
    console.error('[DHIS2-Worker] Error running reporting job:', err);
  }
}

// Automatic runner when invoked directly
if (require.main === module) {
  runDHIS2Reporting()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error('[DHIS2-Worker] Worker failed:', e);
      process.exit(1);
    });
}
