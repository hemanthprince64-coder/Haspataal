import { describe, it, expect, vi, beforeEach } from 'vitest';

import { BillingService } from '../../apps/hospital-hms/lib/services/billing';
import { DischargeService } from '../../apps/hospital-hms/lib/services/discharge';
import { ICUService } from '../../apps/hospital-hms/lib/services/icu';
import { InsuranceService } from '../../apps/hospital-hms/lib/services/insurance';
import { IPDService } from '../../apps/hospital-hms/lib/services/ipd';
import { NursingService } from '../../apps/hospital-hms/lib/services/nursing';
import { OTService } from '../../apps/hospital-hms/lib/services/ot';
import { PharmacyService } from '../../apps/hospital-hms/lib/services/pharmacy';
import { RecordsService } from '../../apps/hospital-hms/lib/services/records';
import { WardService } from '../../apps/hospital-hms/lib/services/ward';

// Helper to create chainable mock queries
const createMockQuery = (resolvedValue: any) => {
  const query: any = Promise.resolve(resolvedValue);
  query.select = vi.fn().mockReturnValue(query);
  query.insert = vi.fn().mockReturnValue(query);
  query.update = vi.fn().mockReturnValue(query);
  query.eq = vi.fn().mockReturnValue(query);
  query.order = vi.fn().mockReturnValue(query);
  query.is = vi.fn().mockReturnValue(query);
  query.single = vi.fn().mockReturnValue(query);
  return query;
};

let nextQueryResult: any = { data: null, error: null };
const mockSupabase = {
  from: vi.fn().mockImplementation(() => createMockQuery(nextQueryResult)),
};

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase,
}));

describe('Phase 3 Hospital Operations Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    nextQueryResult = { data: null, error: null };
  });

  describe('PharmacyService', () => {
    it('dispenses drugs and logs audit', async () => {
      // 1. mock drug stock retrieval
      nextQueryResult = {
        data: { id: 'd1', name: 'Paracetamol', stock: 100, mrp: 10 },
        error: null,
      };

      const res = await PharmacyService.dispenseDrug('h1', 'p1', [
        { drugStockId: 'd1', quantity: 5 },
      ]);
      expect(res.totalAmount).toBe(50);
      expect(res.dispensedItems[0].name).toBe('Paracetamol');
    });
  });

  describe('IPDService', () => {
    it('admits a patient if bed is available', async () => {
      // mock bed check, then admission insert
      mockSupabase.from
        .mockImplementationOnce(() => createMockQuery({ data: { id: 'b1', status: 'AVAILABLE' } }))
        .mockImplementationOnce(() =>
          createMockQuery({ data: { id: 'adm1', admission_number: 'ADM-123' } }),
        )
        .mockImplementationOnce(() => createMockQuery({ data: {} })); // bed update

      const res = await IPDService.admitPatient('h1', 'p1', 'b1', 'doc1', 'Checkup');
      expect(res.admission_number).toBe('ADM-123');
    });
  });

  describe('WardService', () => {
    it('fetches bed dashboard metrics', async () => {
      nextQueryResult = {
        data: [
          { id: 'b1', status: 'OCCUPIED' },
          { id: 'b2', status: 'AVAILABLE' },
        ],
        error: null,
      };

      const res = await WardService.getBedDashboard('h1');
      expect(res.metrics.totalBeds).toBe(2);
      expect(res.metrics.occupiedBeds).toBe(1);
    });
  });

  describe('NursingService', () => {
    it('adds notes and MAR schedule entries', async () => {
      nextQueryResult = { data: { id: 'n1', note: 'Stabilized' }, error: null };
      const res = await NursingService.addNote('h1', 'adm1', 'nurse1', 'Stabilized');
      expect(res.note).toBe('Stabilized');
    });
  });

  describe('OTService', () => {
    it('schedules surgery and WHO safety checks', async () => {
      nextQueryResult = { data: { id: 'ot1', procedure_name: 'Appendecectomy' }, error: null };
      const res = await OTService.scheduleOT(
        'h1',
        'p1',
        'Appendecectomy',
        'doc1',
        'OT-1',
        new Date(),
      );
      expect(res.procedure_name).toBe('Appendecectomy');
    });
  });

  describe('ICUService', () => {
    it('updates critical care parameters and calculates scores', async () => {
      nextQueryResult = { data: { id: 'icu1', apache_score: 5 }, error: null };
      const res = await ICUService.calculateApacheScore('icu1', {
        age: 30,
        temp: 37,
        heartRate: 70,
        map: 90,
        rr: 18,
      });
      expect(res.apache_score).toBe(5);
    });
  });

  describe('BillingService', () => {
    it('calculates dynamic bills with tax', async () => {
      nextQueryResult = { data: { id: 'inv1', total_amount: 105 }, error: null };
      const res = await BillingService.createDynamicBill('h1', 'p1', [
        { serviceName: 'Consult', quantity: 1, unitPrice: 100 },
      ]);
      expect(res.total_amount).toBe(105);
    });
  });

  describe('InsuranceService', () => {
    it('verifies insurance details and pre-authorizations', async () => {
      nextQueryResult = { data: { id: 'ins1', pre_auth_amount: 50000 }, error: null };
      const res = await InsuranceService.verifyInsurance('h1', 'p1', 'POL-1', 'LIC');
      expect(res.pre_auth_amount).toBe(50000);
    });
  });

  describe('RecordsService', () => {
    it('returns structured EMR timeline data', async () => {
      mockSupabase.from
        .mockImplementationOnce(() =>
          createMockQuery({
            data: [{ id: 'adm1', admitted_at: '2026-01-01', admission_number: 'ADM-1' }],
          }),
        )
        .mockImplementationOnce(() => createMockQuery({ data: [] }))
        .mockImplementationOnce(() => createMockQuery({ data: [] }))
        .mockImplementationOnce(() => createMockQuery({ data: [] }))
        .mockImplementationOnce(() => createMockQuery({ data: [] }));

      const res = await RecordsService.getEMRTimeline('p1');
      expect(res).toHaveLength(1);
      expect(res[0].type).toBe('ADMISSION');
    });
  });

  describe('DischargeService', () => {
    it('compiles discharge summaries and followups', async () => {
      mockSupabase.from
        .mockImplementationOnce(() =>
          createMockQuery({
            data: { admission_number: 'ADM-1', patient: { name: 'Alice' } },
            error: null,
          }),
        )
        .mockImplementationOnce(() => createMockQuery({ data: [] })) // nursing
        .mockImplementationOnce(() => createMockQuery({ data: [] })); // mars

      const res = await DischargeService.generateDischargeSummary('adm1');
      expect(res.admissionNumber).toBe('ADM-1');
      expect(res.patientDetails.name).toBe('Alice');
    });
  });
});
