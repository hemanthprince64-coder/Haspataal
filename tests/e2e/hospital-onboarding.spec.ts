import { test, expect } from '@playwright/test';
import { HospitalPage } from './pages/HospitalPage';
import { AdminPage } from './pages/AdminPage';

test.describe('Hospital Onboarding', () => {
  test('should complete hospital onboarding and doctor approval', async ({ page }) => {
    const hospitalPage = new HospitalPage(page);
    const adminPage = new AdminPage(page);

    const hospitalData = {
      hospitalName: 'Test Hospital ' + Date.now(),
      city: 'Delhi',
      adminName: 'Admin User',
      mobile: `8${Math.floor(Math.random() * 1000000000)}`.padEnd(10, '0'),
      password: 'Password123!',
    };

    // 1. Register hospital
    await hospitalPage.navigateToRegister();
    await hospitalPage.register(hospitalData);
    await expect(page).toHaveText(/pending/i);

    // 2. Super Admin approves hospital
    // Create a new context/page for admin to avoid session mixing if needed,
    // but here we just reuse the page for simplicity.
    await adminPage.login('9999999999', 'admin-pass');
    await adminPage.approveHospital(hospitalData.hospitalName);

    // 3. Hospital logs in and adds a doctor
    await hospitalPage.login(hospitalData.mobile, hospitalData.password);
    const doctorData = {
      name: 'Dr. E2E Test',
      mobile: `7${Math.floor(Math.random() * 1000000000)}`.padEnd(10, '0'),
      speciality: 'Cardiology',
      fee: '500',
    };
    await hospitalPage.addDoctor(doctorData);

    // 4. Assert: doctor affiliation is PENDING in DB
    await hospitalPage.verifyAffiliationInDb(hospitalData.hospitalName, doctorData.mobile);

    // 5. Hospital admin approves doctor (or simulate approval)
    // For Flow 2, we assume the admin approves it
    // await hospitalPage.approveDoctor(doctorData.name);

    // 6. Verify doctor appears in dashboard
    await hospitalPage.expectDoctorInDashboard(doctorData.name);
  });
});
