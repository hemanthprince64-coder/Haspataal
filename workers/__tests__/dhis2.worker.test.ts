import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runDHIS2Reporting } from '../dhis2.worker';
import { prisma } from '../../apps/patient-portal/lib/util/prisma-singleton';
import * as fs from 'fs';

// Mock Prisma
vi.mock('../../apps/patient-portal/lib/util/prisma-singleton', () => ({
  prisma: {
    appointment: {
      count: vi.fn(),
    },
    patient: {
      count: vi.fn(),
    },
    visit: {
      count: vi.fn(),
    },
  },
}));

// Mock FS
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

describe('DHIS2 worker tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should compile correct aggregate counts and save ADX XML report', async () => {
    // Mock database counts
    vi.mocked(prisma.appointment.count).mockResolvedValue(10); // OPD total
    vi.mocked(prisma.patient.count)
      .mockResolvedValueOnce(4) // Male registrations
      .mockResolvedValueOnce(6); // Female registrations
    vi.mocked(prisma.visit.count)
      .mockResolvedValueOnce(3) // Malaria cases
      .mockResolvedValueOnce(5); // ANC visits

    vi.mocked(fs.existsSync).mockReturnValue(true);

    const testDate = new Date('2026-06-14T10:00:00Z');
    
    await runDHIS2Reporting(testDate);

    // Verify correct queries were made
    expect(prisma.appointment.count).toHaveBeenCalled();
    expect(prisma.patient.count).toHaveBeenCalledTimes(2);
    expect(prisma.visit.count).toHaveBeenCalledTimes(2);

    // Verify fs write
    expect(fs.writeFileSync).toHaveBeenCalled();
    const [writtenPath, content] = vi.mocked(fs.writeFileSync).mock.calls[0] as [string, string];
    
    // Expect correct XML contents matching mock data
    expect(content).toContain('dataValue dataElement="DE-OPD-TOTAL" value="10"');
    expect(content).toContain('dataValue dataElement="DE-REG-MALE" value="4"');
    expect(content).toContain('dataValue dataElement="DE-REG-FEMALE" value="6"');
    expect(content).toContain('dataValue dataElement="DE-DIAG-MALARIA" value="3"');
    expect(content).toContain('dataValue dataElement="DE-ANC-VISIT" value="5"');
    expect(content).toContain('period="20260613"'); // Period is yesterday's date
  });
});
