import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConsultationAiEngine } from '../engine';
import prisma from '../../../../../lib/prisma';

// Mock path and fs to avoid actual file reads for prompts
vi.mock('fs', () => ({
  default: {
    readFileSync: vi.fn().mockReturnValue('Medication Structurer\n---\nFollowUp\n---\nCare Insights\n---\nRoadmap'),
  },
}));

vi.mock('../../../../../lib/prisma', () => ({
  __esModule: true,
  default: {
    careJourney: {
      create: vi.fn(),
    },
    medicationPlan: {
      createMany: vi.fn(),
    },
    careRedFlag: {
      createMany: vi.fn(),
    },
    followUpPlan: {
      create: vi.fn(),
    },
    recoveryStep: {
      createMany: vi.fn(),
    },
    nudgeSchedule: {
      createMany: vi.fn(),
    },
    outboxEvent: {
      create: vi.fn(),
    },
    $transaction: vi.fn((cb) => cb(prisma)),
  },
}));

describe('ConsultationAiEngine Offline Fallback tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NETWORK_STATUS = 'offline'; // Force offline mode
    process.env.GEMINI_API_KEY = '';
  });

  it('should fall back to rule-based generation and write to outbox when offline and Ollama fails', async () => {
    // Mock fetch to simulate Ollama failing
    const fetchSpy = vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Connection refused'));

    const mockJourney = { id: 'journey-1', visitId: 'visit-1' };
    vi.mocked(prisma.careJourney.create).mockResolvedValue(mockJourney as any);

    const input = {
      visitId: 'visit-1',
      clinicalNotes: 'Patient has high fever and shivering',
      patientProfile: { age: 30, language: 'en' },
    };

    const result = await ConsultationAiEngine.process(input);

    expect(result).toBe(mockJourney);
    expect(prisma.careJourney.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          conditionSimple: 'Acute Fever / Suspected Malaria',
          seriousness: 'URGENT',
        }),
      }),
    );

    // Verify outbox event created for recompute
    expect(prisma.outboxEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          eventType: 'AI_RECOMPUTE_REQUIRED',
        }),
      }),
    );

    fetchSpy.mockRestore();
  });

  it('should use Ollama if it is running and returns valid JSON response', async () => {
    const mockOllamaResponse = {
      medications: [
        {
          name: 'OllamaMeds',
          dosage: '10mg',
          duration: '3 days',
          instructions: 'Before meals',
          schedule: { morning: true, afternoon: false, night: false, beforeFood: true },
        },
      ],
      conditionSimple: 'Ollama diagnosed illness',
      explanation: 'Ollama explained',
      seriousness: 'ROUTINE',
      timeline: '3 days',
      redFlags: [{ symptom: 'Ollama flag', action: 'CONTACT_HOSPITAL' }],
      followUp: { recommendedDays: 5, reason: 'Ollama follow' },
      roadmap: [{ dayNumber: 1, expectedSymptoms: 'Ollama roadmap', markers: 'Rest', guidance: 'Sleep' }],
    };

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        response: JSON.stringify(mockOllamaResponse),
      }),
    } as any);

    const mockJourney = { id: 'journey-2', visitId: 'visit-2' };
    vi.mocked(prisma.careJourney.create).mockResolvedValue(mockJourney as any);

    const input = {
      visitId: 'visit-2',
      clinicalNotes: 'Check with Ollama',
    };

    const result = await ConsultationAiEngine.process(input);

    expect(result).toBe(mockJourney);
    expect(prisma.careJourney.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          conditionSimple: 'Ollama diagnosed illness',
          explanation: 'Ollama explained',
        }),
      }),
    );

    fetchSpy.mockRestore();
  });
});
