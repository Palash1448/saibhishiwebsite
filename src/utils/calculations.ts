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
 * @param durationMonths Number of months
 * @param annualReturnRate Annual return percentage rate (e.g., 12 for 12%)
 * @param method Calculation method ('simple' | 'compounded_annual' | 'fixed_bonus' | 'flat_rate')
 */
export interface BhishiMaturityResult {
  totalPrincipal: number;
  totalInterest: number;
  maturityAmount: number;
  effectiveAnnualRate: number;
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
      effectiveAnnualRate: 0,
      monthlyAverageInterest: 0,
    };
  }

  const totalPrincipal = roundToTwo(monthlyContribution * durationMonths);
  let totalInterest = 0;

  switch (method) {
    case 'simple': {
      // Recurring deposit simple interest formula:
      // I = P * (n * (n + 1) / (2 * 12)) * (r / 100)
      // where P = monthly deposit, n = months, r = annual interest rate
      const monthSumMonths = (durationMonths * (durationMonths + 1)) / 24;
      totalInterest = (monthlyContribution * monthSumMonths * (annualReturnRate / 100));
      break;
    }

    case 'compounded_annual': {
      // Compounded quarterly / annually RD formula standard
      // Approximate iterative monthly accumulation with compounding
      let balance = 0;
      const monthlyRate = (annualReturnRate / 100) / 12;
      for (let m = 1; m <= durationMonths; m++) {
        balance = (balance + monthlyContribution) * (1 + monthlyRate);
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
): { interestAmount: number; totalReturn: number } {
  if (principalAmount <= 0 || annualRate <= 0) {
    return { interestAmount: 0, totalReturn: principalAmount };
  }

  const years = periodMonths / 12;
  let interest = 0;

  if (method === 'compounded_annual') {
    interest = principalAmount * Math.pow(1 + annualRate / 100, years) - principalAmount;
  } else {
    interest = principalAmount * (annualRate / 100) * years;
  }

  interest = roundToTwo(interest);
  return {
    interestAmount: interest,
    totalReturn: roundToTwo(principalAmount + interest),
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

  if (method === 'flat') {
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
