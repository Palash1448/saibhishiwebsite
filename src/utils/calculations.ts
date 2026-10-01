import { CalculationMethod } from '../types/bhishi';
import { LoanCalculationMethod, LoanInstallment } from '../types/loan';

/**
 * Rounds a financial number to 2 decimal places to avoid floating point inaccuracies.
 */
export function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates Bhishi Maturity Amount and Total Interest Return.
 *
 * @param monthlyContribution Monthly installment (₹)
/**
 * Calculates Bhishi Maturity Amount and Total Interest Return.
 *
 * @param monthlyContribution Monthly installment (₹)
 * @param durationMonths Number of months
 * @param annualReturnRate Annual return percentage rate (e.g., 12 for 12%)
 * @param method Calculation method ('simple' | 'compounded_annual' | 'fixed_bonus' | 'flat_rate')
 */
export interface BhishiMaturityResult {
  totalPrincipal: number;
  totalInterest: number;
  maturityAmount: number;
  monthlyReturnRate: number; // % / month
  effectiveAnnualRate: number; // % p.a.
  monthlyAverageInterest: number;
}

export function calculateMaturityAmount(
  monthlyContribution: number,
  durationMonths: number,
  annualReturnRate: number,
  method: CalculationMethod = 'simple'
): BhishiMaturityResult {
  if (monthlyContribution <= 0 || durationMonths <= 0) {
    return {
      totalPrincipal: 0,
      totalInterest: 0,
      maturityAmount: 0,
      monthlyReturnRate: 0,
      effectiveAnnualRate: 0,
      monthlyAverageInterest: 0,
    };
  }

  const totalPrincipal = roundToTwo(monthlyContribution * durationMonths);
  const monthlyReturnRate = roundToTwo(annualReturnRate / 12);
  let totalInterest = 0;

  switch (method) {
    case 'simple': {
      // Monthly Recurring deposit formula:
      // Interest = Deposit * (n * (n + 1) / 2) * (monthlyRate / 100)
      const monthSum = (durationMonths * (durationMonths + 1)) / 2;
      totalInterest = monthlyContribution * monthSum * (monthlyReturnRate / 100);
      break;
    }

    case 'compounded_annual': {
      // Compounded quarterly / annually RD formula standard
      let balance = 0;
      const mRate = monthlyReturnRate / 100;
      for (let m = 1; m <= durationMonths; m++) {
        balance = (balance + monthlyContribution) * (1 + mRate);
      }
      totalInterest = balance - totalPrincipal;
      break;
    }

    case 'fixed_bonus': {
      // Direct percentage on total principal e.g., 10% flat bonus on completion
      totalInterest = totalPrincipal * (annualReturnRate / 100);
      break;
    }

    case 'flat_rate':
    default: {
      // Flat annual rate proportional to duration
      const durationYears = durationMonths / 12;
      totalInterest = totalPrincipal * (annualReturnRate / 100) * (durationYears / 2);
      break;
    }
  }

  totalInterest = roundToTwo(Math.max(0, totalInterest));
  const maturityAmount = roundToTwo(totalPrincipal + totalInterest);
  const monthlyAverageInterest = durationMonths > 0 ? roundToTwo(totalInterest / durationMonths) : 0;

  return {
    totalPrincipal,
    totalInterest,
    maturityAmount,
    monthlyReturnRate,
    effectiveAnnualRate: annualReturnRate,
    monthlyAverageInterest,
  };
}

/**
 * Calculates investment return for a completed period or annual distribution.
 */
export function calculateInvestmentReturn(
  principalAmount: number,
  annualRate: number,
  periodMonths: number = 12,
  method: CalculationMethod = 'simple'
): { interestAmount: number; totalReturn: number; monthlyRate: number } {
  if (principalAmount <= 0 || annualRate <= 0) {
    return { interestAmount: 0, totalReturn: principalAmount, monthlyRate: 0 };
  }

  const monthlyRate = roundToTwo(annualRate / 12);
  const years = periodMonths / 12;
  let interest = 0;

  if (method === 'compounded_annual') {
    interest = principalAmount * Math.pow(1 + annualRate / 100, years) - principalAmount;
  } else {
    // Monthly interest accumulation: Principal * (monthlyRate/100) * periodMonths
    interest = principalAmount * (monthlyRate / 100) * periodMonths;
  }

  interest = roundToTwo(interest);
  return {
    interestAmount: interest,
    totalReturn: roundToTwo(principalAmount + interest),
    monthlyRate,
  };
}

export interface DepositInterestBreakdown {
  collectionId: string;
  monthYearLabel: string;
  depositAmount: number;
  paymentDate: string;
  paymentDay: number;
  cutoffDay: number;
  isEligibleForMonth: boolean; // true if paymentDay <= cutoffDay
  monthlyRate: number; // % / month
  monthsEarned: number;
  earnedInterest: number;
  forfeitedInterestThisMonth: number;
}

export interface MemberCollectionsInterestResult {
  totalPrincipal: number;
  monthlyRate: number; // e.g. 1% / month
  annualRate: number; // e.g. 12% p.a.
  cutoffDay: number; // e.g. 10th
  totalEarnedInterest: number;
  totalForfeitedInterest: number;
  onTimeCount: number;
  lateCount: number;
  breakdown: DepositInterestBreakdown[];
}

/**
 * Evaluates monthly deposits against the cutoff date rule:
 * - If invested ON or BEFORE cutoffDay (e.g. <= 10th): Earns interest for that deposit month.
 * - If invested AFTER cutoffDay (e.g. > 10th): Does NOT earn interest for that month only (forfeited).
 */
export function calculateMemberCollectionsInterest(
  collections: Array<{
    id: string;
    paidAmount?: number;
    expectedAmount?: number;
    paymentDate?: string;
    dueDate?: string;
    monthYearLabel?: string;
    status?: string;
  }>,
  monthlyRate: number,
  cutoffDay: number = 10,
  totalPrincipalFallback: number = 0,
  periodMonths: number = 12
): MemberCollectionsInterestResult {
  const annualRate = roundToTwo(monthlyRate * 12);
  const paidCols = collections.filter((c) => c.status === 'paid' && (c.paidAmount || 0) > 0);

  if (paidCols.length === 0) {
    // If no collections recorded yet, use theoretical full principal
    const theoreticalInterest = roundToTwo(totalPrincipalFallback * (monthlyRate / 100) * (periodMonths / 2));
    return {
      totalPrincipal: totalPrincipalFallback,
      monthlyRate,
      annualRate,
      cutoffDay,
      totalEarnedInterest: theoreticalInterest,
      totalForfeitedInterest: 0,
      onTimeCount: 0,
      lateCount: 0,
      breakdown: [],
    };
  }

  const breakdown: DepositInterestBreakdown[] = [];
  let totalPrincipal = 0;
  let totalEarnedInterest = 0;
  let totalForfeitedInterest = 0;
  let onTimeCount = 0;
  let lateCount = 0;

  paidCols.forEach((col, idx) => {
    const depositAmount = col.paidAmount || col.expectedAmount || 0;
    totalPrincipal += depositAmount;

    const dateStr = col.paymentDate || col.dueDate || new Date().toISOString().slice(0, 10);
    const payDay = new Date(dateStr).getDate();
    const isEligibleForMonth = payDay <= cutoffDay;

    // Remaining months in scheme cycle (from current deposit to period end)
    const remainingMonths = Math.max(1, periodMonths - idx);
    const monthlyInterestOnDeposit = roundToTwo(depositAmount * (monthlyRate / 100));

    let monthsEarned = remainingMonths;
    let forfeitedThisMonth = 0;

    if (isEligibleForMonth) {
      onTimeCount++;
    } else {
      lateCount++;
      // Forfeits interest for the deposit month only
      monthsEarned = Math.max(0, remainingMonths - 1);
      forfeitedThisMonth = monthlyInterestOnDeposit;
      totalForfeitedInterest += forfeitedThisMonth;
    }

    const earned = roundToTwo(monthlyInterestOnDeposit * monthsEarned);
    totalEarnedInterest += earned;

    breakdown.push({
      collectionId: col.id,
      monthYearLabel: col.monthYearLabel || `Month ${idx + 1}`,
      depositAmount,
      paymentDate: dateStr,
      paymentDay: payDay,
      cutoffDay,
      isEligibleForMonth,
      monthlyRate,
      monthsEarned,
      earnedInterest: earned,
      forfeitedInterestThisMonth: forfeitedThisMonth,
    });
  });

  return {
    totalPrincipal: roundToTwo(totalPrincipal),
    monthlyRate,
    annualRate,
    cutoffDay,
    totalEarnedInterest: roundToTwo(totalEarnedInterest),
    totalForfeitedInterest: roundToTwo(totalForfeitedInterest),
    onTimeCount,
    lateCount,
    breakdown,
  };
}

/**
 * Calculates Loan Monthly Installment (EMI) and Total Interest.
 *
 * @param principal Loan principal amount (₹)
 * @param monthlyInterestRate Monthly interest rate in % (e.g., 2 for 2% per month)
 * @param durationMonths Loan tenure in months (e.g., 12)
 * @param method 'flat' | 'reducing_balance'
 * @param processingFeeRate Optional processing fee percentage (e.g. 1%)
 */
export interface LoanCalculationResult {
  principal: number;
  monthlyInterestRate: number;
  annualInterestRate: number;
  durationMonths: number;
  monthlyInstallment: number;
  totalInterest: number;
  processingFee: number;
  totalPayable: number;
  method: LoanCalculationMethod;
}

export function calculateEMI(
  principal: number,
  monthlyInterestRate: number,
  durationMonths: number,
  method: LoanCalculationMethod = 'flat',
  processingFeeRate: number = 0
): LoanCalculationResult {
  if (principal <= 0 || durationMonths <= 0) {
    return {
      principal: 0,
      monthlyInterestRate,
      annualInterestRate: monthlyInterestRate * 12,
      durationMonths: 0,
      monthlyInstallment: 0,
      totalInterest: 0,
      processingFee: 0,
      totalPayable: 0,
      method,
    };
  }

  const annualInterestRate = roundToTwo(monthlyInterestRate * 12);
  const processingFee = roundToTwo((principal * processingFeeRate) / 100);

  let totalInterest = 0;
  let monthlyInstallment = 0;

  if (method === 'flat') {
    // Flat Rate Interest: Total Interest = Principal * (Monthly Rate / 100) * Months
    totalInterest = roundToTwo(principal * (monthlyInterestRate / 100) * durationMonths);
    const totalPayableWithoutFee = principal + totalInterest;
    monthlyInstallment = roundToTwo(totalPayableWithoutFee / durationMonths);
  } else if (method === 'interest_only') {
    // Interest-Only: Monthly payment covers only monthly interest (Principal repaid at bullet/end)
    const monthlyInterest = roundToTwo(principal * (monthlyInterestRate / 100));
    totalInterest = roundToTwo(monthlyInterest * durationMonths);
    monthlyInstallment = monthlyInterest;
  } else {
    // Reducing Balance Method (standard Amortization formula)
    // EMI = [P x r x (1+r)^n] / [(1+r)^n - 1]
    const r = monthlyInterestRate / 100;
    const n = durationMonths;

    if (r === 0) {
      monthlyInstallment = roundToTwo(principal / n);
      totalInterest = 0;
    } else {
      const emiFactor = Math.pow(1 + r, n);
      monthlyInstallment = roundToTwo((principal * r * emiFactor) / (emiFactor - 1));
      totalInterest = roundToTwo((monthlyInstallment * n) - principal);
    }
  }

  const totalPayable = roundToTwo(principal + totalInterest + processingFee);

  return {
    principal: roundToTwo(principal),
    monthlyInterestRate,
    annualInterestRate,
    durationMonths,
    monthlyInstallment,
    totalInterest: Math.max(0, totalInterest),
    processingFee,
    totalPayable,
    method,
  };
}

/**
 * Generates exact repayment schedule and installment breakdown for a loan.
 */
export function generateRepaymentSchedule(
  principal: number,
  monthlyInterestRate: number,
  durationMonths: number,
  startDate: string, // YYYY-MM-DD
  method: LoanCalculationMethod = 'flat'
): LoanInstallment[] {
  if (principal <= 0 || durationMonths <= 0) return [];

  const installments: LoanInstallment[] = [];
  const baseDate = new Date(startDate || new Date().toISOString().slice(0, 10));

  if (method === 'interest_only') {
    const monthlyInterest = roundToTwo(principal * (monthlyInterestRate / 100));

    for (let i = 1; i <= durationMonths; i++) {
      const dueDate = new Date(baseDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      const isLast = i === durationMonths;
      const principalPart = isLast ? principal : 0;
      const totalEMI = roundToTwo(principalPart + monthlyInterest);

      installments.push({
        installmentNumber: i,
        dueDate: dueDate.toISOString().slice(0, 10),
        principalAmount: principalPart,
        interestAmount: monthlyInterest,
        totalInstallment: totalEMI,
        paidAmount: 0,
        remainingAmount: totalEMI,
        status: i === 1 ? 'due' : 'upcoming',
      });
    }
  } else if (method === 'flat') {
    const monthlyPrincipal = roundToTwo(principal / durationMonths);
    const monthlyInterest = roundToTwo(principal * (monthlyInterestRate / 100));
    const totalEMI = roundToTwo(monthlyPrincipal + monthlyInterest);

    for (let i = 1; i <= durationMonths; i++) {
      const dueDate = new Date(baseDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      // Adjust last installment for rounding discrepancies
      const isLast = i === durationMonths;
      const p = isLast
        ? roundToTwo(principal - (monthlyPrincipal * (durationMonths - 1)))
        : monthlyPrincipal;

      installments.push({
        installmentNumber: i,
        dueDate: dueDate.toISOString().slice(0, 10),
        principalAmount: p,
        interestAmount: monthlyInterest,
        totalInstallment: roundToTwo(p + monthlyInterest),
        paidAmount: 0,
        remainingAmount: roundToTwo(p + monthlyInterest),
        status: i === 1 ? 'due' : 'upcoming',
      });
    }
  } else {
    // Reducing Balance Schedule
    const r = monthlyInterestRate / 100;
    const n = durationMonths;
    const emiFactor = Math.pow(1 + r, n);
    const monthlyEMI = r > 0 ? roundToTwo((principal * r * emiFactor) / (emiFactor - 1)) : roundToTwo(principal / n);

    let currentBalance = principal;

    for (let i = 1; i <= durationMonths; i++) {
      const dueDate = new Date(baseDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      const interestPart = roundToTwo(currentBalance * r);
      let principalPart = roundToTwo(monthlyEMI - interestPart);

      if (i === durationMonths || principalPart > currentBalance) {
        principalPart = currentBalance;
      }

      currentBalance = roundToTwo(Math.max(0, currentBalance - principalPart));
      const totalAmount = roundToTwo(principalPart + interestPart);

      installments.push({
        installmentNumber: i,
        dueDate: dueDate.toISOString().slice(0, 10),
        principalAmount: principalPart,
        interestAmount: interestPart,
        totalInstallment: totalAmount,
        paidAmount: 0,
        remainingAmount: totalAmount,
        status: i === 1 ? 'due' : 'upcoming',
      });
    }
  }

  return installments;
}

/**
 * Helper to calculate outstanding balance from installments.
 */
export function calculateOutstandingBalance(installments: LoanInstallment[]): {
  outstandingPrincipal: number;
  outstandingInterest: number;
  outstandingTotal: number;
  totalPaid: number;
} {
  let outstandingPrincipal = 0;
  let outstandingInterest = 0;
  let totalPaid = 0;

  installments.forEach((inst) => {
    totalPaid += inst.paidAmount || 0;
    if (inst.status !== 'paid') {
      const unpaidRatio = inst.totalInstallment > 0
        ? Math.max(0, (inst.totalInstallment - (inst.paidAmount || 0)) / inst.totalInstallment)
        : 1;

      outstandingPrincipal += inst.principalAmount * unpaidRatio;
      outstandingInterest += inst.interestAmount * unpaidRatio;
    }
  });

  outstandingPrincipal = roundToTwo(outstandingPrincipal);
  outstandingInterest = roundToTwo(outstandingInterest);
  const outstandingTotal = roundToTwo(outstandingPrincipal + outstandingInterest);

  return {
    outstandingPrincipal,
    outstandingInterest,
    outstandingTotal,
    totalPaid: roundToTwo(totalPaid),
  };
}
