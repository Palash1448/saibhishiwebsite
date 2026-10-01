export type BhishiPlanStatus = 'active' | 'upcoming' | 'completed' | 'cancelled';
export type CalculationMethod = 'simple' | 'compounded_annual' | 'fixed_bonus' | 'flat_rate';

export interface BhishiPlan {
  id: string; // e.g. "BP-101"
  planName: string; // e.g. "Royal Gold 2026 - ₹5,000/mo (20 Months)"
  planCode: string;
  monthlyContribution: number; // e.g. 5000 (Base or recommended installment)
  allowsCustomMonthlyAmount?: boolean; // True if member can choose their own custom monthly amount
  durationMonths: number; // e.g. 20
  totalPrincipal: number; // monthlyContribution * durationMonths
  monthlyReturnRate?: number; // e.g. 1 or 1.5 (% per month)
  annualInterestRate: number; // e.g. 12 (% per annum - yearly return rate)
  interestCutoffDay?: number; // e.g. 10th of every month (deposits after this day forfeit this month's interest)
  returnCalculationMethod: CalculationMethod;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  paymentDueDay: number; // e.g. 10th of every month
  status: BhishiPlanStatus;
  maxMembers?: number;
  enrolledMembersCount: number;
  estimatedMaturityAmount: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface BhishiMembership {
  id: string;
  memberId: string;
  memberName: string;
  memberCode: string;
  planId: string;
  planName: string;
  startDate: string;
  endDate: string;
  monthlyContribution: number; // Member's chosen monthly investment amount (₹)
  monthlyReturnRate?: number; // Return rate % per month (e.g. 1% or 1.5%)
  annualReturnRate: number; // Admin's assigned yearly return rate (% p.a.)
  interestCutoffDay?: number; // Cutoff date (e.g. 10th); deposits after this forfeit this month's interest
  totalMonths: number;
  monthsPaid: number;
  totalPaid: number;
  totalPending: number;
  maturityAmount?: number; // Projected maturity payout
  paymentDueDay?: number; // 1 to 31
  status: 'active' | 'matured' | 'cancelled' | 'defaulted';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterestRecord {
  id: string;
  memberId: string;
  memberName: string;
  memberCode: string;
  planId?: string;
  planName?: string;
  calculationPeriod: string; // e.g. "FY 2025-2026" or "Year 1"
  principalAmount: number;
  monthlyRate?: number; // % per month
  annualRate: number; // % p.a.
  interestCutoffDay?: number;
  onTimeDepositsCount?: number;
  lateDepositsCount?: number;
  forfeitedInterestAmount?: number; // Amount forfeited due to late deposits after cutoff
  calculatedInterest: number;
  adjustmentAmount: number; // manual bonus or penalty
  finalInterestAmount: number;
  creditedDate: string;
  status: 'draft' | 'approved' | 'credited' | 'cancelled';
  notes?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}
