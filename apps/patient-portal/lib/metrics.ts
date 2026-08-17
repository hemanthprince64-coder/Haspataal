/* eslint-disable */
// Simple metrics counters for development
// In production, these would integrate with Prometheus or similar

class Counter {
  private value: number = 0;

  constructor(private name: string) {}

  inc(_labels?: Record<string, string | number | undefined>): void {
    this.value++;
  }

  getValue(): number {
    return this.value;
  }

  reset(): void {
    this.value = 0;
  }
}

export const hospitalRegistrationsCounter = new Counter('hospital_registrations_total');
export const appointmentsCreatedCounter = new Counter('appointments_created_total');
