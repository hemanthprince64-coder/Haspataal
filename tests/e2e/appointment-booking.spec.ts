import { test, expect } from '@playwright/test';
import { PatientPage } from './pages/PatientPage';
import { HospitalPage } from './pages/HospitalPage';

test.describe('Appointment Booking', () => {
  test('should book an appointment and verify status changes', async ({ page }) => {
    const patientPage = new PatientPage(page);
    const hospitalPage = new HospitalPage(page);

    // 1. Patient logs in
    await patientPage.navigateToLogin();
    await patientPage.login('9000000001', '1234'); // Existing test user

    // 2. Search and book appointment
    await patientPage.bookAppointment('Dr. Arvind Sharma', 'Cardiology');

    // 3. Assert status is AWAITING_PAYMENT
    await expect(page.locator('text=AWAITING_PAYMENT')).toBeVisible();

    // 4. Hospital confirms payment
    // Log out as patient, log in as hospital
    await patientPage.logout();
    await hospitalPage.login('8000000001', 'hospital-pass');
    await hospitalPage.confirmPayment('Test Patient');

    // 5. Patient verifies status is BOOKED
    await hospitalPage.page.goto('/hospital/login'); // Triggering logout by going to login or use a logout method
    // In real app, we would have a clear logout
    await patientPage.navigateToLogin();
    await patientPage.login('9000000001', '1234');

    await expect(page.locator('text=BOOKED')).toBeVisible();
  });
});
