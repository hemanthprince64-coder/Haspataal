import { test, expect, BrowserContext } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { SignJWT } from 'jose';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const prisma = new PrismaClient();
const SECRET_KEY = process.env.NEXTAUTH_SECRET || 'dummy-secret-for-build-purposes-only';
const key = new TextEncoder().encode(SECRET_KEY);

async function generateAuthToken(userId: string, role: string, hospitalId: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return new SignJWT({
    user: { id: userId, name: 'UI Load Tester', role, hospitalId },
    expiresAt,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
}

test.describe.parallel('UI Concurrency (Track D)', () => {
  let testHospitalId: string;
  let testDoctorId: string;
  let testUserId: string;
  let authToken: string;

  test.beforeAll(async () => {
    let hospital = await prisma.hospitalsMaster.findFirst();
    if (!hospital) {
      hospital = await prisma.hospitalsMaster.create({
        data: {
          legalName: 'Muzaffarpur General Pilot',
          displayName: 'Muzaffarpur General Pilot',
          registrationNumber: 'HOSP-SIM-101',
          verificationStatus: 'verified',
          accountStatus: 'active',
        },
      });
    }
    testHospitalId = hospital.id;

    let doctor = await prisma.doctorMaster.findFirst();
    if (!doctor) {
      doctor = await prisma.doctorMaster.create({
        data: {
          fullName: 'Dr. Pilot Tester',
          mobile: '9876543210',
          email: 'dr.pilot@haspataal.com',
          kycStatus: 'VERIFIED',
          accountStatus: 'ACTIVE',
        },
      });
    }
    testDoctorId = doctor.id;
    testUserId = 'system-test-user';
    authToken = await generateAuthToken(testUserId, 'HOSPITAL_ADMIN', testHospitalId);
  });

  test('5 Receptionists register patients simultaneously via UI', async ({ browser }) => {
    test.setTimeout(120000); // Allow 2 minutes for concurrent UI loading

    const NUM_RECEPTIONISTS = 5;
    const contexts: BrowserContext[] = [];

    for (let i = 0; i < NUM_RECEPTIONISTS; i++) {
      const context = await browser.newContext();
      await context.addCookies([
        {
          name: 'session_user',
          value: authToken,
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          sameSite: 'Lax',
          expires: Math.round(Date.now() / 1000) + 86400,
        },
      ]);
      contexts.push(context);
    }

    const pages = await Promise.all(contexts.map((c) => c.newPage()));

    // 1. All receptionists navigate to the registration page concurrently
    await Promise.all(
      pages.map(async (page, i) => {
        // Randomized slight delay for realistic contention
        await new Promise((r) => setTimeout(r, Math.random() * 300));
        await page.goto('/hospital/dashboard/reception');
      }),
    );

    // Wait for the form to be ready on all pages
    await Promise.all(pages.map((page) => page.waitForSelector('text="Complete Registration"')));

    // 2. All receptionists fill out the form
    await Promise.all(
      pages.map(async (page, i) => {
        const uniquePhone = `99${Date.now().toString().slice(-6)}${i.toString().padStart(2, '0')}`;
        await page.fill('input[id="patientName"]', `Concurrent Patient ${i}`);
        await page.fill('input[id="patientMobile"]', uniquePhone);
        await page.fill('input[id="age"]', '30');

        // Shadcn Select for Gender (assuming default is MALE, but we click anyway if needed, actually it defaults to 'M' in code)
        // The code says: `gender: 'M'` as initial state. So we skip Gender.

        // Shadcn Select for Doctor
        // Click the trigger that contains the placeholder "Select doctor..."
        // Or just click the label and then the first option
        await page.getByLabel('Assign Doctor / Department').click({ force: true });
        await page.waitForTimeout(500); // Wait for animation
        await page.getByRole('option').first().click();
      }),
    );

    // 3. All receptionists click SAVE at exactly the same time (with slight 50-300ms random delay as requested by CTO)
    const startTime = Date.now();
    const saveResults = await Promise.allSettled(
      pages.map(async (page, i) => {
        const delay = 50 + Math.random() * 250;
        await new Promise((r) => setTimeout(r, delay));

        const clickTime = Date.now();
        await page.getByRole('button', { name: /Complete Registration/i }).click();

        // Wait for success indicator (e.g. redirect or toast)
        // Since we don't know the exact UI success state, we'll wait for network idle or a specific response
        const response = await page.waitForResponse(
          (res) => res.url().includes('/api/hospital/reception/register') && res.status() === 200,
        );
        return {
          receptionistIndex: i,
          clickToSaveTime: Date.now() - clickTime,
          responseStatus: response.status(),
        };
      }),
    );

    const endTime = Date.now();
    const totalDuration = endTime - startTime;

    console.log(`[UI Concurrency] 5 Receptionists completed in ${totalDuration}ms`);

    let successCount = 0;
    saveResults.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        successCount++;
        console.log(`Receptionist ${i} E2E Latency: ${result.value.clickToSaveTime}ms`);
      } else {
        console.error(`Receptionist ${i} failed:`, result.reason);
      }
    });

    expect(successCount).toBe(NUM_RECEPTIONISTS);

    // Cleanup
    await Promise.all(contexts.map((c) => c.close()));
  });
});
