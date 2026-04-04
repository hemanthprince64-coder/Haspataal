/**
 * Circuit Breaker Pattern (Level 2 Resilience)
 * Protects the system from hanging on slow/failed external services (SMS, Payment)
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime: number | null = null;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private threshold: number = 5, 
    private resetTimeout: number = 30000
  ) {}

  async execute<T>(action: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - (this.lastFailureTime || 0) > this.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit is OPEN: Service temporarily unavailable.');
      }
    }

    try {
      const result = await action();
      this.reset();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
      console.warn('Circuit Breaker OPENED due to high failure rate.');
    }
  }

  private reset() {
    this.failures = 0;
    this.state = 'CLOSED';
  }
}

// Global instances for external services
export const smsCircuitBreaker = new CircuitBreaker(5, 60000); // 1 min timeout
export const paymentCircuitBreaker = new CircuitBreaker(3, 30000);
