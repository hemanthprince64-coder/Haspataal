import { Page, expect } from '@playwright/test';

export class HospitalPage {
  constructor(private page: Page) {}

  async navigateToRegister() {
    await this.page.goto('/hospital/register');
  }

  async register(data: {
    hospitalName: string;
    city: string;
    adminName: string;
    mobile: string;
    password: string;
  }) {
    await this.page.fill('input[name="hospitalName"]', data.hospitalName);
    await this.page.fill('input[name="city"]', data.city);
    await this.page.fill('input[name="adminName"]', data.adminName);
    await this.page.fill('input[name="mobile"]', data.mobile);
    await this.page.fill('input[name="password"]', data.password);
    await this.page.click('button[type="submit"]');
  }

  async login(mobile: string, password: string) {
    await this.page.goto('/hospital/login');
    await this.page.fill('input[name="mobile"]', mobile);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('button[type="submit"]');
  }

  async addDoctor(doctorData: { name: string; mobile: string; speciality: string; fee: string }) {
    await this.page.goto('/hospital/dashboard/setup/doctors');
    await this.page.fill('input[name="name"]', doctorData.name);
    await this.page.fill('input[name="mobile"]', doctorData.mobile);
    await this.page.fill('input[name="speciality"]', doctorData.speciality);
    await this.page.fill('input[name="fee"]', doctorData.fee);
    await this.page.click('button:has-text("Add Doctor")');
  }

  async confirmPayment(patientName: string) {
    await this.page.goto('/hospital/dashboard/billing');
    await this.page.click(`tr:has-text("${patientName}") button:has-text("Confirm Payment")`);
  }

  async expectDoctorInDashboard(doctorName: string) {
    await this.page.goto('/hospital/dashboard/doctors');
    await expect(this.page.locator(`text=${doctorName}`)).toBeVisible();
  }

  async verifyAffiliationInDb(hospitalName: string, doctorMobile: string) {
    // First get hospital ID
    const hRes = await this.page.request.get(
      `/api/test/verify?type=hospital&name=${encodeURIComponent(hospitalName)}`,
    );
    const hData = await hRes.json();

    const response = await this.page.request.get(
      `/api/test/verify?type=affiliation&hospitalId=${hData.id}&mobile=${doctorMobile}`,
    );
    const data = await response.json();
    expect(data).not.toBeNull();
    expect(data.status).toBe('PENDING');
  }
}
