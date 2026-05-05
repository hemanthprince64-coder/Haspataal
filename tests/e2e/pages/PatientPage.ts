import { Page, expect } from '@playwright/test';

export class PatientPage {
  constructor(private page: Page) {}

  async navigateToRegister() {
    await this.page.goto('/register');
  }

  async navigateToLogin() {
    await this.page.goto('/login');
  }

  async register(data: {
    mobile: string;
    name: string;
    age: string;
    gender: string;
    city: string;
  }) {
    await this.page.fill('input[name="mobile"]', data.mobile);
    await this.page.fill('input[name="name"]', data.name);
    await this.page.fill('input[name="age"]', data.age);
    await this.page.selectOption('select[name="gender"]', data.gender);
    await this.page.fill('input[name="city"]', data.city);
    await this.page.click('button[type="submit"]');
  }

  async login(mobile: string, otp: string) {
    await this.page.fill('input[name="mobile"]', mobile);
    await this.page.click('button:has-text("Get Secure OTP")');
    await this.page.fill('input[name="otp"]', otp);
    await this.page.click('button:has-text("Secure Login")');
  }

  async logout() {
    await this.page.click('button:has-text("Terminate Secured Session")');
  }

  async expectDashboard(name: string) {
    await expect(this.page).toHaveURL('/');
    await expect(this.page.locator(`text=Welcome back, ${name}`)).toBeVisible();
  }

  async bookAppointment(doctorName: string, speciality: string) {
    await this.page.goto('/search');
    await this.page.fill('input[placeholder*="speciality"]', speciality);
    await this.page.click(`text=${doctorName}`);
    await this.page.click('button:has-text("Book Slot")');
  }
}
