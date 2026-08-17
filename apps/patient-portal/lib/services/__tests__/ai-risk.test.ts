import { describe, it, expect, vi, beforeEach } from 'vitest';

import { prisma } from '../../util/prisma-singleton';
import { abdmMockService } from '../abdm-mock';
import { aiRiskService } from '../ai-risk';

vi.mock('../../util/prisma-singleton', () => ({
  prisma: {
    pregnancyProfile: {
      findUnique: vi.fn(),
    },
    patient: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    familyMember: {
      create: vi.fn(),
    },
  },
}));

describe('AI Risk & ABDM Mock Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('aiRiskService', () => {
    it('evaluates low risk pregnancy profile correctly', async () => {
      const mockProfile = {
        id: 'preg-123',
        gestationalAge: 20,
        highRisk: false,
        highRiskReasons: [],
        visits: [{ bpSystolic: 120, bpDiastolic: 80, hemoglobin: 12 }],
        obstetricHistory: [],
      };

      vi.mocked(prisma.pregnancyProfile.findUnique).mockResolvedValue(mockProfile as any);

      const result = await aiRiskService.evaluatePregnancyRisk('preg-123', 'en');
      expect(result.pretermRisk).toBe('low');
      expect(result.pihRisk).toBe('normal');
      expect(result.gdmRisk).toBe('low');
      expect(result.narrativeSummary).toContain('Your pregnancy is progressing normally');
    });

    it('flags high risk pregnancy (severe PIH) correctly', async () => {
      const mockProfile = {
        id: 'preg-123',
        gestationalAge: 32,
        highRisk: true,
        highRiskReasons: ['Hypertension'],
        visits: [{ bpSystolic: 165, bpDiastolic: 112, hemoglobin: 11 }],
        obstetricHistory: [],
      };

      vi.mocked(prisma.pregnancyProfile.findUnique).mockResolvedValue(mockProfile as any);

      const result = await aiRiskService.evaluatePregnancyRisk('preg-123', 'en');
      expect(result.pihRisk).toBe('severe');
      expect(result.narrativeSummary).toContain('There are some risk factors flagged');
    });
  });

  describe('abdmMockService', () => {
    it('creates and updates ABHA details for a patient', async () => {
      const mockPatient = {
        id: 'pat-123',
        name: 'Sita Devi',
        gender: 'F',
        dob: new Date('1995-05-10'),
      };

      vi.mocked(prisma.patient.findUnique).mockResolvedValue(mockPatient as any);
      vi.mocked(prisma.patient.update).mockResolvedValue(mockPatient as any);

      const result = await abdmMockService.createABHA('pat-123', '123412341234');
      expect(result.verified).toBe(true);
      expect(result.abhaAddress).toContain('sitadevi');
      expect(result.abhaAddress).toContain('@abdm');
    });
  });
});
