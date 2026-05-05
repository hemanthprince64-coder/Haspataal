import { Page, expect } from '@playwright/test';

export class AdminPage {
  constructor(private page: Page) {}

  async login(mobile: string, password: string) {
    await this.page.goto('/admin');
    await this.page.fill('input[name="mobile"]', mobile);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('button[type="submit"]');
  }

  async approveHospital(hospitalName: string) {
    await this.page.goto('/admin/dashboard/hospitals');
    await this.page.click(`tr:has-text("${hospitalName}") button:has-text("Approve")`);
  }
}
