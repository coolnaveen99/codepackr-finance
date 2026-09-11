/**
 * House Rent Allowance (HRA) Exemption Engine
 * Implements statutory Section 10(13A) Rule 2A of the Indian Income Tax Act:
 * Exemption is least of:
 * 1. Actual HRA received
 * 2. Actual rent paid minus 10% of Basic Salary + DA
 * 3. 50% of Basic Salary (Metro) or 40% (Non-Metro)
 */

export interface HraInputs {
  basicSalary: number; // Basic + Dearness Allowance (Annual or Monthly)
  hraReceived: number; // Actual HRA allowance received
  rentPaid: number; // Actual rent paid to landlord
  isMetro: boolean; // Delhi, Mumbai, Kolkata, Chennai (50%) vs Non-metro (40%)
  frequency?: 'annual' | 'monthly';
  taxSlabRate?: number; // Marginal slab rate for tax savings estimate (%)
}

export interface HraResult {
  exemptHra: number;
  taxableHra: number;
  actualHra: number;
  rentExcessOverBasic: number;
  percentageBasicLimit: number;
  percentageUsed: number; // 50% or 40%
  annualTaxSavings: number;
  limitingCondition: string;
}

export function calculateHraExemption(inputs: HraInputs): HraResult {
  const {
    basicSalary,
    hraReceived,
    rentPaid,
    isMetro,
    frequency = 'annual',
    taxSlabRate = 30,
  } = inputs;

  const multiplier = frequency === 'monthly' ? 12 : 1;
  const basic = Math.max(0, basicSalary * multiplier);
  const hra = Math.max(0, hraReceived * multiplier);
  const rent = Math.max(0, rentPaid * multiplier);

  const pct = isMetro ? 0.5 : 0.4;
  const percentageBasicLimit = basic * pct;
  const rentExcessOverBasic = Math.max(0, rent - 0.1 * basic);

  // Least of the three
  let exemptHra = 0;
  let limitingCondition = '';

  if (rentExcessOverBasic <= 0) {
    exemptHra = 0;
    limitingCondition = 'Rent paid does not exceed 10% of Basic Salary';
  } else {
    const minVal = Math.min(hra, rentExcessOverBasic, percentageBasicLimit);
    exemptHra = minVal;

    if (minVal === hra) {
      limitingCondition = 'Actual HRA received from employer';
    } else if (minVal === rentExcessOverBasic) {
      limitingCondition = 'Rent paid in excess of 10% of Basic Salary';
    } else {
      limitingCondition = `${isMetro ? '50%' : '40%'} of Basic Salary limit`;
    }
  }

  const taxableHra = Math.max(0, hra - exemptHra);
  const annualTaxSavings = exemptHra * (Math.max(0, taxSlabRate) / 100);

  return {
    exemptHra,
    taxableHra,
    actualHra: hra,
    rentExcessOverBasic,
    percentageBasicLimit,
    percentageUsed: isMetro ? 50 : 40,
    annualTaxSavings,
    limitingCondition,
  };
}
