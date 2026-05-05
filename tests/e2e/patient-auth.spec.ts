import { test, expect } from '@playwright/test';
import { PatientPage } from './pages/PatientPage';

test.describe('Patient Authentication', () => {
  test('should register a new patient and log in successfully', async ({ page }) => {
    const patientPage = new PatientPage(page);
    const testData = {
      mobile: `9${Math.floor(Math.random() * 1000000000)}`.padEnd(10, '0'),
      name: 'Test Patient',
      age: '25',
      gender: 'MALE',
      city: 'Mumbai',
    };

    // 1. Navigate to register and fill form
    await patientPage.navigateToRegister();
    await patientPage.register(testData);

    // 2. Assert redirect to profile
    await expect(page).toHaveURL('/profile');

    // 3. Log out
    await patientPage.logout();

    // 4. Log back in
    await patientPage.navigateToLogin();
    // In a real test, we would handle the OTP properly.
    // For demo purposes, we assume '1234' works or is bypassed in test mode.
    await patientPage.login(testData.mobile, '1234');

    // 5. Assert dashboard loads with correct name
    await patientPage.expectDashboard(testData.name);
  });
});
