/* ------------------------------------------------------------------ */
/*  JSY / PMMVY Government Scheme Tracker                              */
/* ------------------------------------------------------------------ */

export interface SchemeEligibility {
  jsy: {
    eligible: boolean;
    reason?: string;
    installments: { name: string; amount: number; status: string }[];
  };
  pmmvy: {
    eligible: boolean;
    reason?: string;
    installments: { name: string; amount: number; status: string }[];
  };
}

const JSY_AMOUNTS = {
  REGISTRATION: 600,
  DELIVERY: 1400,
  POSTNATAL: 600,
};

const PMMVY_AMOUNTS = {
  EARLY_REGISTRATION: 3000,
  FIRST_ANC: 2000,
  CHILDBIRTH: 2000,
};

export function checkSchemeEligibility(profile: {
  gravida: number;
  para: number;
  bplCard?: boolean;
  aadhaarLinked?: boolean;
  bankAccountLinked?: boolean;
  registeredAt?: Date;
  schemeEnrolled?: string[];
  ancVisits?: number;
  institutionaldelivery?: boolean;
  deliveryDate?: Date;
}): SchemeEligibility {
  const jsyEligible = profile.bplCard && profile.aadhaarLinked && profile.bankAccountLinked;
  const pmmvyEligible = profile.aadhaarLinked && profile.bankAccountLinked && profile.gravida >= 1;

  const jsyInstallments = [
    {
      name: 'Registration + 1st ANC',
      amount: JSY_AMOUNTS.REGISTRATION,
      status: jsyEligible && profile.ancVisits && profile.ancVisits >= 1 ? 'PAID' : 'PENDING',
    },
    {
      name: 'Institutional Delivery',
      amount: JSY_AMOUNTS.DELIVERY,
      status: profile.institutionaldelivery ? 'PAID' : 'PENDING',
    },
    {
      name: 'Postnatal (Day 42)',
      amount: JSY_AMOUNTS.POSTNATAL,
      status: 'PENDING',
    },
  ];

  const earlyRegistration = profile.registeredAt
    ? Math.floor((new Date(profile.registeredAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) < 150
    : false;

  const pmmvyInstallments = [
    {
      name: 'Early Registration',
      amount: PMMVY_AMOUNTS.EARLY_REGISTRATION,
      status: earlyRegistration && pmmvyEligible ? 'PAID' : 'PENDING',
    },
    {
      name: 'First ANC Visit',
      amount: PMMVY_AMOUNTS.FIRST_ANC,
      status: pmmvyEligible && profile.ancVisits && profile.ancVisits >= 1 ? 'PAID' : 'PENDING',
    },
    {
      name: 'Childbirth + Institutional Delivery',
      amount: PMMVY_AMOUNTS.CHILDBIRTH,
      status: profile.institutionaldelivery ? 'PAID' : 'PENDING',
    },
  ];

  return {
    jsy: {
      eligible: !!jsyEligible,
      reason: !jsyEligible
        ? 'Requires BPL card + Aadhaar + linked bank account'
        : undefined,
      installments: jsyInstallments,
    },
    pmmvy: {
      eligible: !!pmmvyEligible,
      reason: !pmmvyEligible
        ? 'Requires Aadhaar + linked bank account + at least 1 pregnancy'
        : undefined,
      installments: pmmvyInstallments,
    },
  };
}

export function getTotalSchemeBenefit(eligibility: SchemeEligibility): number {
  let total = 0;
  if (eligibility.jsy.eligible) {
    eligibility.jsy.installments.forEach((i) => {
      if (i.status === 'PAID') total += i.amount;
    });
  }
  if (eligibility.pmmvy.eligible) {
    eligibility.pmmvy.installments.forEach((i) => {
      if (i.status === 'PAID') total += i.amount;
    });
  }
  return total;
}
