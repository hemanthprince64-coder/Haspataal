import { prisma } from '@haspataal/db';

export interface RecentHospital {
  id: string;
  legalName: string;
  city: string | null;
  state: string | null;
  onboardingState: string;
  healthScore: number | null;
  createdAt: Date;
}

export interface ExecutiveDashboardData {
  dashboard: {
    kpis: {
      totalHospitals: number;
      activeHospitals: number;
      pendingHospitals: number;
      platformUsers: number;
      totalVisits: number;
    };
    recentHospitals: RecentHospital[];
    systemHealth: {
      status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
      components: { name: string; status: 'connected' | 'disconnected' }[];
    } | null;
    metadata: {
      generatedAt: string;
      refreshInterval: number;
      version: string;
    };
  };
}

export class PlatformDashboardService {
  /**
   * Fetches the executive dashboard data running independent aggregates concurrently
   */
  static async getExecutiveDashboard(): Promise<ExecutiveDashboardData> {
    const [
      totalHospitals,
      activeHospitals,
      pendingHospitals,
      totalDoctors,
      totalPatients,
      totalVisits,
      recentHospitalsData,
      systemHealth,
    ] = await Promise.all([
      prisma.hospitalsMaster.count(),
      prisma.hospitalsMaster.count({ where: { onboardingState: 'LIVE' } }),
      prisma.hospitalsMaster.count({ where: { onboardingState: 'PENDING' } }),
      prisma.doctorMaster.count(),
      prisma.patient.count(),
      prisma.visit.count(),
      prisma.hospitalsMaster.findMany({
        select: {
          id: true,
          legalName: true,
          city: true,
          state: true,
          onboardingState: true,
          healthScore: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.getSystemHealth(), // compute health concurrently
    ]);

    const platformUsers = totalDoctors + totalPatients;

    return {
      dashboard: {
        kpis: {
          totalHospitals,
          activeHospitals,
          pendingHospitals,
          platformUsers,
          totalVisits,
        },
        recentHospitals: recentHospitalsData,
        systemHealth,
        metadata: {
          generatedAt: new Date().toISOString(),
          refreshInterval: 15000,
          version: '1.0.0', // could pull from process.env
        },
      },
    };
  }

  static async getSystemHealth() {
    const checks = {
      status: 'HEALTHY' as 'HEALTHY' | 'DEGRADED' | 'DOWN',
      components: [] as { name: string; status: 'connected' | 'disconnected' }[],
    };

    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.components.push({ name: 'Postgres Primary', status: 'connected' });
    } catch {
      checks.components.push({ name: 'Postgres Primary', status: 'disconnected' });
      checks.status = 'DEGRADED';
    }

    // Return the system health object directly
    return checks;
  }
}
