import { prisma } from '@/lib/prisma';

export interface StepStatus {
  id: string;
  complete: boolean;
  score: number; // 0-1
  warnings: string[];
  weight: number;
}

export interface SetupCompletion {
  totalWeightedScore: number; // 0-100
  criticalWarnings: string[];
  generalWarnings: string[];
  stepStatuses: Record<string, StepStatus>;
}

// ─── Individual Step Checkers ─────────────────────────────────────────────────

async function checkIdentityComplete(hospitalId: string): Promise<{ complete: boolean; score: number; warnings: string[] }> {
  const h = await prisma.hospitalsMaster.findUnique({
    where: { id: hospitalId },
    select: { 
      legalName: true, 
      displayName: true, 
      logoUrl: true, 
      gstNumber: true, 
      contactNumber: true,
      billingProfile: {
        select: { gstApplicable: true }
      }
    },
  });
  if (!h) return { complete: false, score: 0, warnings: ['Hospital not found'] };
  
  const mandatory = [
    !!h.legalName,
    !!h.displayName,
    !!h.contactNumber,
  ];

  const optional = [
    !!h.logoUrl,
    !!h.gstNumber,
  ];

  const score = (mandatory.filter(Boolean).length + optional.filter(Boolean).length) / (mandatory.length + optional.length);

  const warnings: string[] = [];
  if (!h.logoUrl) warnings.push('No hospital logo uploaded → affects patient trust');
  
  // Only warn about GST if it's either provided or marked as applicable in billing profile
  // If billing profile says it's NOT applicable, we don't warn.
  const isGstRequired = h.billingProfile?.gstApplicable ?? true; // Default to true for compliance safety
  if (isGstRequired && !h.gstNumber) {
    warnings.push('No GST number → compliance risk on invoices');
  }

  return {
    complete: mandatory.every(Boolean), 
    score,
    warnings,
  };
}

async function checkDepartmentsExist(hospitalId: string): Promise<{ complete: boolean; score: number; warnings: string[] }> {
  const count = await prisma.department.count({ where: { hospitalId, isActive: true } });
  return {
    complete: count >= 1,
    score: Math.min(count / 5, 1), // full score at 5+ departments
    warnings: count === 0 ? ['No departments configured → doctors cannot be assigned'] : [],
  };
}

async function checkStaffConfigured(hospitalId: string): Promise<{ complete: boolean; score: number; warnings: string[] }> {
  const [staffCount, adminCount] = await Promise.all([
    prisma.staff.count({ where: { hospitalId, isActive: true } }),
    prisma.staff.count({ where: { hospitalId, role: 'HOSPITAL_ADMIN' } }),
  ]);
  const score = (staffCount > 0 ? 0.5 : 0) + (adminCount > 0 ? 0.5 : 0);
  return {
    complete: staffCount > 0,
    score,
    warnings: [
      ...(staffCount === 0 ? ['No staff configured → system cannot operate'] : []),
    ],
  };
}

async function checkDoctorsConfigured(hospitalId: string): Promise<{ complete: boolean; score: number; warnings: string[] }> {
  const doctorCount = await prisma.doctorHospitalAffiliation.count({
    where: { hospitalId, isCurrent: true },
  });
  return {
    complete: doctorCount > 0,
    score: Math.min(doctorCount / 3, 1),
    warnings: doctorCount === 0 ? ['No doctors affiliated → OPD bookings will fail'] : [],
  };
}

async function checkOpdWorkflow(hospitalId: string): Promise<{ complete: boolean; score: number; warnings: string[] }> {
  const config = await prisma.opdConfig.findUnique({ where: { hospitalId } });
  return {
    complete: !!config,
    score: config ? 1 : 0,
    warnings: !config ? ['OPD workflow not configured → front desk operations impaired'] : [],
  };
}

async function checkIpdSetup(hospitalId: string): Promise<{ complete: boolean; score: number; warnings: string[] }> {
  const bedCount = await prisma.bed.count({ where: { hospitalId, isActive: true } });
  return {
    complete: bedCount > 0,
    score: Math.min(bedCount / 10, 1),
    warnings: bedCount === 0 ? ['No beds/wards configured → IPD admissions not possible'] : [],
  };
}

async function checkBillingConfigured(hospitalId: string): Promise<{ complete: boolean; score: number; warnings: string[] }> {
  const [catalogCount, gateway] = await Promise.all([
    prisma.serviceCatalog.count({ where: { hospitalId, isActive: true } }),
    prisma.paymentGateway.findFirst({ where: { hospitalId, isActive: true } }),
  ]);
  return {
    complete: catalogCount > 0 && gateway !== null,
    score: (catalogCount > 0 ? 0.5 : 0) + (gateway ? 0.5 : 0),
    warnings: [
      ...(catalogCount === 0 ? ['No services in billing catalog → cannot generate bills'] : []),
      ...(!gateway ? ['No payment gateway configured → revenue loss risk'] : []),
    ],
  };
}

async function checkPharmacySetup(hospitalId: string): Promise<{ complete: boolean; score: number; warnings: string[] }> {
  const drugCount = await prisma.drugStock.count({ where: { hospitalId } });
  return {
    complete: drugCount > 0,
    score: Math.min(drugCount / 20, 1),
    warnings: drugCount === 0 ? ['No pharmacy stock configured → in-house dispensing unavailable'] : [],
  };
}

async function checkDiagnosticsSetup(hospitalId: string): Promise<{ complete: boolean; score: number; warnings: string[] }> {
  const pricingCount = await prisma.hospitalDiagnosticPricing.count({ where: { hospitalId } });
  return {
    complete: pricingCount > 0,
    score: Math.min(pricingCount / 10, 1),
    warnings: pricingCount === 0 ? ['No diagnostic tests priced → lab revenue module inactive'] : [],
  };
}

async function checkNotifications(hospitalId: string): Promise<{ complete: boolean; score: number; warnings: string[] }> {
  const integration = await prisma.integrationConfig.findFirst({
    where: {
      hospitalId,
      isActive: true,
      provider: { in: ['WHATSAPP_META', 'WHATSAPP_TWILIO', 'WHATSAPP_WATI', 'WHATSAPP_INTERAKT', 'WHATSAPP_GUPSHUP', 'SMS_FAST2SMS', 'SMS_MSG91', 'SMS_TEXTLOCAL', 'SMS_2FACTOR'] },
    },
  });
  return {
    complete: !!integration,
    score: integration ? 1 : 0,
    warnings: !integration ? ['No messaging integration → patient notifications disabled'] : [],
  };
}

async function checkIntegrations(hospitalId: string): Promise<{ complete: boolean; score: number; warnings: string[] }> {
  const count = await prisma.integrationConfig.count({ where: { hospitalId, isActive: true } });
  return {
    complete: count > 0,
    score: Math.min(count / 3, 1),
    warnings: count === 0 ? ['No integrations configured → payment and messaging unavailable'] : [],
  };
}

async function checkRetentionEngine(hospitalId: string): Promise<{ complete: boolean; score: number; warnings: string[] }> {
  const ruleCount = await prisma.retentionRule.count({ where: { hospitalId, isActive: true } });
  return {
    complete: ruleCount > 0,
    score: Math.min(ruleCount / 3, 1),
    warnings: ruleCount === 0 ? ['No retention rules → patient recall revenue uncaptured'] : [],
  };
}

async function checkMarketplaceListing(hospitalId: string): Promise<{ complete: boolean; score: number; warnings: string[] }> {
  const hospital = await prisma.hospitalsMaster.findUnique({
    where: { id: hospitalId },
    select: { isListedOnMarketplace: true, marketplaceTagline: true, logoUrl: true },
  });
  const listed = hospital?.isListedOnMarketplace ?? false;
  return {
    complete: listed,
    score: listed ? (hospital?.marketplaceTagline ? 1 : 0.5) : 0,
    warnings: !listed ? ['Not listed on Haspataal.in marketplace → missing patient acquisition channel'] : [],
  };
}

async function checkActivation(hospitalId: string): Promise<{ complete: boolean; score: number; warnings: string[] }> {
  const hospital = await prisma.hospitalsMaster.findUnique({
    where: { id: hospitalId },
    select: { accountStatus: true },
  });
  const active = hospital?.accountStatus === 'active';
  return {
    complete: active,
    score: active ? 1 : 0,
    warnings: active ? [] : ['Hospital is not activated → production workflows remain gated'],
  };
}

async function checkBranchesConfigured(hospitalId: string): Promise<{ complete: boolean; score: number; warnings: string[] }> {
  const count = await prisma.branch.count({ where: { hospitalId, isActive: true } });
  return {
    complete: count >= 1,
    score: count > 0 ? 1 : 0,
    warnings: count === 0 ? ['No branches configured → main campus must be registered'] : [],
  };
}

// ─── Setup Steps Definition ────────────────────────────────────────────────────

const SETUP_STEPS: Array<{
  id: string;
  weight: number;
  check: (hospitalId: string) => Promise<{ complete: boolean; score: number; warnings: string[] }>;
}> = [
  { id: 'identity',      weight: 2, check: checkIdentityComplete },
  { id: 'branches',      weight: 0.5, check: checkBranchesConfigured },
  { id: 'departments',   weight: 1, check: checkDepartmentsExist },
  { id: 'staff',         weight: 2, check: checkStaffConfigured },
  { id: 'doctors',       weight: 2, check: checkDoctorsConfigured },
  { id: 'opd',           weight: 1, check: checkOpdWorkflow },
  { id: 'ipd',           weight: 1, check: checkIpdSetup },
  { id: 'billing',       weight: 2, check: checkBillingConfigured },
  { id: 'pharmacy',      weight: 1, check: checkPharmacySetup },
  { id: 'diagnostics',   weight: 1, check: checkDiagnosticsSetup },
  { id: 'notifications', weight: 1, check: checkNotifications },
  { id: 'integrations',  weight: 1, check: checkIntegrations },
  { id: 'retention',     weight: 0.5, check: checkRetentionEngine },
  { id: 'marketplace',   weight: 0.5, check: checkMarketplaceListing },
  { id: 'activation',    weight: 1, check: checkActivation },
];


// ─── Aggregate Function ────────────────────────────────────────────────────────

/**
 * Wait helper for staggering queries to avoid connection pool exhaustion
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Execute a step check with retry for transient DB failures
 */
async function checkStepWithRetry(step: typeof SETUP_STEPS[0], hospitalId: string, maxRetries = 2) {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await step.check(hospitalId);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      // Only retry on connection-related errors
      if (!lastError.message.includes('reach database') && 
          !lastError.message.includes('connection') &&
          !lastError.message.includes('pool')) {
        break; // Don't retry on logic errors
      }
      if (attempt < maxRetries) {
        await sleep(200 * (attempt + 1)); // Exponential backoff: 200ms, 400ms
      }
    }
  }
  
  throw lastError;
}

export async function computeSetupCompletion(hospitalId: string): Promise<SetupCompletion> {
  // Run checks with staggered timing to avoid connection pool exhaustion
  // Parallel queries + static generation can exceed Supabase's connection limit
  const results: Array<{ id: string; weight: number; complete: boolean; score: number; warnings: string[] }> = [];

  for (let i = 0; i < SETUP_STEPS.length; i++) {
    const step = SETUP_STEPS[i];
    try {
      const result = await checkStepWithRetry(step, hospitalId);
      results.push({
        id: step.id,
        weight: step.weight,
        ...result,
      });
    } catch (err) {
      console.error(`[setup/completion] Error checking step ${step.id}:`, err);
      results.push({
        id: step.id,
        weight: step.weight,
        complete: false,
        score: 0,
        warnings: [`Unable to verify completion: ${err instanceof Error ? err.message : 'Database unavailable'}`],
      });
    }

    // Stagger queries: ~150ms delay after every 4 queries to ease pool pressure
    // This gives Supabase time to recycle connections without slowing perceptibly (total < 1s)
    if ((i + 1) % 4 === 0 && i < SETUP_STEPS.length - 1) {
      await sleep(150);
    }
  }

  const totalWeight = SETUP_STEPS.reduce((sum, s) => sum + s.weight, 0);
  const weightedScore = results.reduce((sum, r) => sum + r.score * r.weight, 0);
  const totalWeightedScore = Math.round((weightedScore / totalWeight) * 100);

  const stepStatuses: Record<string, StepStatus> = {};
  for (const r of results) {
    stepStatuses[r.id] = {
      id: r.id,
      complete: r.complete,
      score: r.score,
      warnings: r.warnings,
      weight: r.weight,
    };
  }

  const criticalStepIds = SETUP_STEPS.filter((s) => s.weight >= 2).map((s) => s.id);
  const criticalWarnings: string[] = results
    .filter((r) => criticalStepIds.includes(r.id) && r.warnings.length > 0)
    .flatMap((r) => r.warnings);

  const generalWarnings: string[] = results
    .filter((r) => !criticalStepIds.includes(r.id) && r.warnings.length > 0)
    .flatMap((r) => r.warnings);

  return { totalWeightedScore, criticalWarnings, generalWarnings, stepStatuses };
}
