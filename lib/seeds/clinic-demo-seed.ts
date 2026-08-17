/**
 * lib/seeds/clinic-demo-seed.ts
 *
 * Seeds a demo single-doctor clinic + a multi-speciality clinic
 * for local development.  Run with:
 *   npx tsx lib/seeds/clinic-demo-seed.ts
 *
 * SAFETY: never run this against production.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding clinic demo data…');

  // ── 1. Single-doctor clinic ────────────────────────────────────────────────
  const singleDoctor = await prisma.hospitalsMaster.create({
    data: {
      legalName:      'Dr. Sharma\'s Dental & Skin Clinic',
      displayName:    'Sharma Clinic',
      registrationNumber: 'REG-SINGLE-001',
      contactNumber:  '9876543210',
      addressLine1:   '12, MG Road',
      city:           'Jaipur',
      state:          'Rajasthan',
      pincode:        '302001',
      officialEmail:  'dr.sharma@clinic.demo',
      type:           'CLINIC',                        // existing HospitalType
      facilityType:   'CLINIC',                        // new FacilityType
      clinicTier:     'SINGLE_DOCTOR',
      gstExempt:      true,                            // < ₹20 lakh
      timezone:       'Asia/Kolkata',
      workingDays:    ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
      openTime:       '09:00',
      closeTime:      '20:00',
      allowOnlineBooking:  true,
      accountStatus:  'ACTIVE',
      verificationStatus: 'verified',
      admins: {
        create: {
          fullName: 'Dr. Raj Sharma',
          mobile:   '9876543210',
          email:    'dr.sharma@clinic.demo',
          isPrimary: true,
        },
      },
      clinicProfile: {
        create: {
          tier:              'SINGLE_DOCTOR',
          doctorInCharge:    'Dr. Raj Sharma',
          specialization:    'Dentistry, Dermatology',
          hasPharmacy:       false,
          hasOwnLab:         false,
          allowedFeatures:   [
            'OPD', 'BILLING', 'APPOINTMENTS',
            'PATIENT_RECORDS', 'FOLLOW_UP',
            'LAB_INTEGRATION', 'PHARMACY_INTEGRATION',
          ],
        },
      },
    },
  });

  console.log('✅ Created single-doctor clinic:', singleDoctor.displayName);

  // ── 2. Multi-speciality clinic ──────────────────────────────────────────────
  const multiSpeciality = await prisma.hospitalsMaster.create({
    data: {
      legalName:         'City Care Multi-Speciality Centre',
      displayName:       'City Care Centre',
      registrationNumber: 'REG-MULTI-001',
      gstNumber:         '08AAAAA0000A1Z5',  // registered, >₹20L
      contactNumber:     '9123456780',
      addressLine1:      '45, Civil Lines',
      city:              'Jaipur',
      state:             'Rajasthan',
      pincode:           '302006',
      officialEmail:     'admin@citycare.demo',
      type:              'CLINIC',
      facilityType:      'CLINIC',
      clinicTier:        'MULTI_SPECIALITY',
      gstExempt:         false,   // GST registered
      timezone:          'Asia/Kolkata',
      workingDays:       ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
      openTime:          '09:00',
      closeTime:         '21:00',
      allowOnlineBooking: true,
      isMultiBranch:     false,
      accountStatus:     'ACTIVE',
      verificationStatus: 'verified',
      admins: {
        create: {
          fullName: 'Ms. Priya Mehta',
          mobile:   '9123456780',
          email:    'admin@citycare.demo',
          isPrimary: true,
        },
      },
      clinicProfile: {
        create: {
          tier:             'MULTI_SPECIALITY',
          doctorInCharge:   'Dr. Raj Sharma',
          specialization:   'Cardiology, Dermatology, Orthopedics, ENT',
          numDoctors:       6,
          hasPharmacy:      true,
          hasOwnLab:        true,
          avgDailyPatients: 80,
          allowedFeatures: [
            'OPD', 'BILLING', 'APPOINTMENTS',
            'PATIENT_RECORDS', 'FOLLOW_UP',
            'PHARMACY', 'LAB_MANAGEMENT',
            'MULTI_DOCTOR', 'REFERRAL_TRACKING',
            'REVENUE_ANALYTICS',
          ],
        },
      },
    },
  });

  console.log('✅ Created multi-speciality clinic:', multiSpeciality.displayName);
  console.log('\n🎉 Seeding complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
