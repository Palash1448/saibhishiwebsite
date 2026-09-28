export type BhishiPlanStatus = 'active' | 'upcoming' | 'completed' | 'cancelled';
export type CalculationMethod = 'simple' | 'compounded_annual' | 'fixed_bonus' | 'flat_rate';

export interface BhishiPlan {
  id: string; // e.g. "BP-101"
  planName: string; // e.g. "Royal Gold 2026 - ₹5,000/mo (20 Months)"
  planCode: string;
  monthlyContribution: number; // e.g. 5000
  durationMonths: number; // e.g. 20
  totalPrincipal: number; // monthlyContribution * durationMonths
  annualInterestRate: number; // e.g. 12 (%)
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
  monthlyContribution: number;
  totalMonths: number;
  monthsPaid: number;
  totalPaid: number;
  totalPending: number;
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
  annualRate: number;
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
