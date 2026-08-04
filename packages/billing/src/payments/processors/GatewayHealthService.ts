export interface GatewayHealth {
  availability: boolean;
  latencyAvg: number; // in ms
  latencyP95: number; // in ms
  successRate: number; // 0.0 to 1.0
  failureRate: number; // 0.0 to 1.0
  lastError?: string;
  lastErrorAt?: Date;
  circuitBreakerState: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

export class GatewayHealthService {
  private healthData: Map<string, GatewayHealth> = new Map();

  // In a real application, this would pull from Prometheus, Datadog, or an internal metric store
  public getHealth(gatewayName: string): GatewayHealth {
    if (!this.healthData.has(gatewayName)) {
      this.healthData.set(gatewayName, {
        availability: true,
        latencyAvg: 50,
        latencyP95: 120,
        successRate: 1.0,
        failureRate: 0.0,
        circuitBreakerState: 'CLOSED',
      });
    }
    return this.healthData.get(gatewayName)!;
  }

  public recordSuccess(gatewayName: string, latencyMs: number) {
    const health = this.getHealth(gatewayName);
    // Simple moving average
    health.latencyAvg = (health.latencyAvg * 9 + latencyMs) / 10;
    // P95 calculation is complex, so we'll just mock it
    health.latencyP95 = health.latencyAvg * 1.5;

    health.successRate = (health.successRate * 99 + 1) / 100;
    health.failureRate = 1 - health.successRate;

    if (health.circuitBreakerState === 'HALF_OPEN') {
      health.circuitBreakerState = 'CLOSED';
    }
  }

  public recordFailure(gatewayName: string, errorMsg: string) {
    const health = this.getHealth(gatewayName);
    health.lastError = errorMsg;
    health.lastErrorAt = new Date();

    health.successRate = (health.successRate * 99) / 100;
    health.failureRate = 1 - health.successRate;

    if (health.failureRate > 0.1) {
      health.circuitBreakerState = 'OPEN';
      health.availability = false;

      // Mock auto-recovery after 1 minute
      setTimeout(() => {
        const h = this.getHealth(gatewayName);
        h.circuitBreakerState = 'HALF_OPEN';
        h.availability = true;
      }, 60000);
    }
  }
}

export const gatewayHealthService = new GatewayHealthService();
