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

    // 3. Assert: BookingStatus is AWAITING_PAYMENT after creation
    await expect(page.locator('text=AWAITING_PAYMENT')).toBeVisible();

    // 4. Hospital admin confirms payment
    // Log out as patient, log in as hospital
    await patientPage.logout();
    await hospitalPage.login('8000000001', 'hospital-pass');
    await hospitalPage.confirmPayment('Test Patient');

    // 5. Assert: BookingStatus is BOOKED
    await expect(page.locator('text=BOOKED')).toBeVisible();

    // 6. Patient dashboard shows the confirmed appointment
    await page.goto('/hospital/login');
    await patientPage.navigateToLogin();
    await patientPage.login('9000000001', '1234');

    await expect(page.locator('text=BOOKED')).toBeVisible();
    await expect(page.locator('text=Dr. Arvind Sharma')).toBeVisible();
  });
});
