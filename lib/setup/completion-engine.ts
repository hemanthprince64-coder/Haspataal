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
  verificationStatus: string;
}

// ─── Individual Step Checkers ─────────────────────────────────────────────────

async function checkIdentityComplete(
  hospitalId: string,
): Promise<{ complete: boolean; score: number; warnings: string[] }> {
  const h = await prisma.hospitalsMaster.findUnique({
    where: { id: hospitalId },
    select: {
      legalName: true,
      displayName: true,
      logoUrl: true,
      gstNumber: true,
      contactNumber: true,
      officialEmail: true,
      addressLine1: true,
      city: true,
      state: true,
      pincode: true,
      billingProfile: {
        select: { gstApplicable: true },
      },
    },
  });
  if (!h) return { complete: false, score: 0, warnings: ['Hospital not found'] };

  const mandatory = [
    !!h.legalName,
    !!h.displayName,
    !!h.contactNumber,
    !!h.officialEmail,
    !!h.addressLine1,
    !!h.city,
    !!h.state,
    !!h.pincode,
  ];

  const optional = [!!h.logoUrl, !!h.gstNumber];

  const score =
    (mandatory.filter(Boolean).length + optional.filter(Boolean).length) /
    (mandatory.length + optional.length);

  const warnings: string[] = [];
  if (!h.logoUrl) warnings.push('No hospital logo uploaded → affects patient trust');
  if (!h.officialEmail) warnings.push('Official email missing → required for formal communication');
  if (!h.addressLine1 || !h.city || !h.pincode)
    warnings.push('Incomplete hospital address → required for GST compliance and geolocation');

  const isGstRequired = h.billingProfile?.gstApplicable ?? true;
  if (isGstRequired && !h.gstNumber) {
    warnings.push('No GST number → compliance risk on invoices');
  }

  return {
    complete: mandatory.every(Boolean),
    score,
    warnings,
  };
}

async function checkDepartmentsExist(
  hospitalId: string,
): Promise<{ complete: boolean; score: number; warnings: string[] }> {
  const departments = await prisma.department.findMany({
    where: { hospitalId, isActive: true },
    select: { id: true, type: true, headDoctorId: true },
  });

  const count = departments.length;
  const warnings: string[] = [];

  if (count === 0) {
    warnings.push('No departments configured → clinical workflow cannot be established');
  } else {
    const ipdDepts = departments.filter((d) => d.type === 'IPD' || d.type === 'BOTH');
    const missingHead = ipdDepts.filter((d) => !d.headDoctorId);
    if (missingHead.length > 0) {
      warnings.push(`${missingHead.length} IPD departments missing Head Doctor assignment`);
    }

    const bedCount = await prisma.bed.count({ where: { hospitalId, isActive: true } });
    if (ipdDepts.length > 0 && bedCount === 0) {
      warnings.push('IPD departments active but no beds/wards configured');
    }
  }

  return {
    complete: count >= 1 && warnings.length === 0,
    score: Math.min(count / 5, 1),
    warnings,
  };
}

async function checkStaffConfigured(
  hospitalId: string,
): Promise<{ complete: boolean; score: number; warnings: string[] }> {
  const staff = await prisma.staff.findMany({
    where: { hospitalId, isActive: true },
    select: { role: true },
  });

  const adminCount = staff.filter((s) => s.role === 'HOSPITAL_ADMIN').length;
  const warnings: string[] = [];

  if (staff.length === 0) warnings.push('No staff configured → system cannot operate');
  if (adminCount === 0) warnings.push('No HOSPITAL_ADMIN role assigned → risk of lockout');

  return {
    complete: staff.length > 0 && adminCount > 0,
    score: (staff.length > 0 ? 0.5 : 0) + (adminCount > 0 ? 0.5 : 0),
    warnings,
  };
}

async function checkDoctorsConfigured(
  hospitalId: string,
): Promise<{ complete: boolean; score: number; warnings: string[] }> {
  const doctors = await prisma.doctorHospitalAffiliation.findMany({
    where: { hospitalId, isCurrent: true },
    select: { payload: true },
  });

  const count = doctors.length;
  const warnings: string[] = [];

  if (count === 0) {
    warnings.push('No doctors affiliated → OPD bookings will fail');
  } else {
    // Check if doctors have departments assigned in their payload (since we use payload for speciality/depts)
    const missingDept = doctors.filter((d) => {
      const p = d.payload as any;
      return !p?.departmentIds || p.departmentIds.length === 0;
    });
    if (missingDept.length > 0) {
      warnings.push(`${missingDept.length} doctors have no department assignment`);
    }
  }

  return {
    complete: count > 0 && warnings.length === 0,
    score: Math.min(count / 3, 1),
    warnings,
  };
}

async function checkOpdWorkflow(
  hospitalId: string,
): Promise<{ complete: boolean; score: number; warnings: string[] }> {
  const config = await prisma.opdConfig.findUnique({ where: { hospitalId } });
  return {
    complete: !!config,
    score: config ? 1 : 0,
    warnings: !config ? ['OPD workflow not configured → front desk operations impaired'] : [],
  };
}

async function checkBillingConfigured(
  hospitalId: string,
): Promise<{ complete: boolean; score: number; warnings: string[] }> {
  const [catalogCount, billingProfile, hospital] = await Promise.all([
    prisma.serviceCatalog.count({ where: { hospitalId, isActive: true } }),
    prisma.hospitalBillingProfile.findUnique({ where: { hospitalId } }),
    prisma.hospitalsMaster.findUnique({
      where: { id: hospitalId },
      select: { invoicePrefix: true },
    }),
  ]);

  const warnings: string[] = [];
  if (catalogCount === 0) warnings.push('No services in billing catalog → cannot generate bills');
  if (!billingProfile?.bankAccountNumber)
    warnings.push('No bank account details → payouts will be blocked');
  if (!hospital?.invoicePrefix) warnings.push('No invoice prefix defined → sequencing may collide');

  return {
    complete: catalogCount > 0 && !!billingProfile?.bankAccountNumber,
    score: (catalogCount > 0 ? 0.5 : 0) + (billingProfile?.bankAccountNumber ? 0.5 : 0),
    warnings,
  };
}

async function checkPharmacySetup(
  hospitalId: string,
): Promise<{ complete: boolean; score: number; warnings: string[] }> {
  const drugs = await prisma.drugStock.findMany({
    where: { hospitalId },
    select: { expiryDate: true },
  });

  const warnings: string[] = [];
  if (drugs.length === 0) {
    warnings.push('No pharmacy stock configured → in-house dispensing unavailable');
  } else {
    const expired = drugs.filter((d) => d.expiryDate && new Date(d.expiryDate) < new Date());
    if (expired.length > 0) {
      warnings.push(`${expired.length} drugs in stock have expired → critical clinical risk`);
    }
  }

  return {
    complete: drugs.length > 0 && warnings.length === 0,
    score: Math.min(drugs.length / 20, 1),
    warnings,
  };
}

async function checkDiagnosticsSetup(
  hospitalId: string,
): Promise<{ complete: boolean; score: number; warnings: string[] }> {
  const pricingCount = await prisma.hospitalDiagnosticPricing.count({ where: { hospitalId } });
  return {
    complete: pricingCount > 0,
    score: Math.min(pricingCount / 10, 1),
    warnings:
      pricingCount === 0 ? ['No diagnostic tests priced → lab revenue module inactive'] : [],
  };
}

async function checkIntegrations(
  hospitalId: string,
): Promise<{ complete: boolean; score: number; warnings: string[] }> {
  const [integrations, templates] = await Promise.all([
    prisma.integrationConfig.findMany({ where: { hospitalId, isActive: true } }),
    prisma.notificationTemplate.count({ where: { hospitalId } }),
  ]);

  const hasMessaging = integrations.some((i) =>
    ['WHATSAPP_META', 'SMS_MSG91', 'WHATSAPP_TWILIO', 'SMS_FAST2SMS'].includes(i.provider),
  );

  const warnings: string[] = [];
  if (integrations.length === 0)
    warnings.push('No integrations configured → payment and messaging unavailable');
  if (hasMessaging && templates === 0)
    warnings.push('Messaging active but no notification templates created');

  return {
    complete: integrations.length > 0,
    score: Math.min(integrations.length / 3, 1),
    warnings,
  };
}

async function checkRetentionEngine(
  hospitalId: string,
): Promise<{ complete: boolean; score: number; warnings: string[] }> {
  const ruleCount = await prisma.retentionRule.count({ where: { hospitalId, isActive: true } });
  return {
    complete: ruleCount > 0,
    score: Math.min(ruleCount / 3, 1),
    warnings: ruleCount === 0 ? ['No retention rules → patient recall revenue uncaptured'] : [],
  };
}

async function checkMarketplaceListing(
  hospitalId: string,
): Promise<{ complete: boolean; score: number; warnings: string[] }> {
  const hospital = await prisma.hospitalsMaster.findUnique({
    where: { id: hospitalId },
    select: {
      isListedOnMarketplace: true,
      marketplaceTagline: true,
      logoUrl: true,
      coverImageUrl: true,
    },
  });

  const servicesCount = await prisma.serviceCatalog.count({
    where: { hospitalId, isActive: true, packageId: null },
  });

  const listed = hospital?.isListedOnMarketplace ?? false;
  const warnings: string[] = [];

  if (!listed)
    warnings.push('Not listed on Haspataal marketplace → missing patient acquisition channel');
  if (listed && !hospital?.coverImageUrl)
    warnings.push('Marketplace active but no cover image uploaded');
  if (listed && servicesCount < 3)
    warnings.push('At least 3 services should be listed for marketplace visibility');

  return {
    complete: listed && servicesCount >= 3,
    score: listed ? (hospital?.marketplaceTagline ? 1 : 0.5) : 0,
    warnings,
  };
}

async function checkActivation(
  hospitalId: string,
): Promise<{ complete: boolean; score: number; warnings: string[] }> {
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

async function checkBranchesConfigured(
  hospitalId: string,
): Promise<{ complete: boolean; score: number; warnings: string[] }> {
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
  { id: 'identity', weight: 2, check: checkIdentityComplete },
  { id: 'branches', weight: 0.5, check: checkBranchesConfigured },
  { id: 'departments', weight: 1.5, check: checkDepartmentsExist },
  { id: 'staff', weight: 2, check: checkStaffConfigured },
  { id: 'doctors', weight: 2, check: checkDoctorsConfigured },
  { id: 'opd', weight: 1, check: checkOpdWorkflow },
  { id: 'billing', weight: 2, check: checkBillingConfigured },
  { id: 'pharmacy', weight: 1, check: checkPharmacySetup },
  { id: 'diagnostics', weight: 1, check: checkDiagnosticsSetup },
  { id: 'integrations', weight: 1.5, check: checkIntegrations },
  { id: 'retention', weight: 0.5, check: checkRetentionEngine },
  { id: 'marketplace', weight: 0.5, check: checkMarketplaceListing },
  { id: 'activation', weight: 1, check: checkActivation },
];

// ─── Aggregate Function ────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function checkStepWithRetry(
  step: (typeof SETUP_STEPS)[0],
  hospitalId: string,
  maxRetries = 2,
) {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await step.check(hospitalId);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (
        !lastError.message.includes('reach database') &&
        !lastError.message.includes('connection') &&
        !lastError.message.includes('pool')
      ) {
        break;
      }
      if (attempt < maxRetries) {
        await sleep(200 * (attempt + 1));
      }
    }
  }

  throw lastError;
}

export async function computeSetupCompletion(hospitalId: string): Promise<SetupCompletion> {
  const results: Array<{
    id: string;
    weight: number;
    complete: boolean;
    score: number;
    warnings: string[];
  }> = [];

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
        warnings: [
          `Unable to verify completion: ${err instanceof Error ? err.message : 'Database unavailable'}`,
        ],
      });
    }

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

  const hospital = await prisma.hospitalsMaster.findUnique({
    where: { id: hospitalId },
    select: { verificationStatus: true },
  });

  return {
    totalWeightedScore,
    criticalWarnings,
    generalWarnings,
    stepStatuses,
    verificationStatus: hospital?.verificationStatus || 'pending',
  };
}
