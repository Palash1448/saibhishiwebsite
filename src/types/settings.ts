import { LoanCalculationMethod } from './loan';
import { CalculationMethod as BhishiCalculationMethod } from './bhishi';

export interface BusinessSettings {
  businessName: string;
  tagline: string;
  logoUrl: string;
  address: string;
  cityStatePincode: string;
  phone: string;
  alternatePhone?: string;
  email: string;
  gstin?: string;
  panNumber?: string;
  currencySymbol: string; // '₹'
  receiptPrefix: string; // 'REC'
  transactionPrefix: string; // 'TXN'
  loanPrefix: string; // 'LN'
  memberPrefix: string; // 'SB'
  authorizedSignatoryTitle: string; // e.g. "For SaiBhishi Finance"
}

export interface FinanceSettings {
  defaultMonthlyReturnRate: number; // e.g. 1% or 1.5% per month
  defaultAnnualReturnRate: number; // e.g. 12%
  defaultInterestCutoffDay: number; // e.g. 10th of every month (deposits after forfeit this month's interest)
  defaultBhishiCalculationMethod: BhishiCalculationMethod;
  defaultMonthlyLoanInterestRate: number; // e.g. 2%
  defaultLoanCalculationMethod: LoanCalculationMethod;
  defaultProcessingFeeRate: number; // e.g. 1%
  defaultGracePeriodDays: number; // e.g. 5 days
  latePaymentPenaltyRate: number; // e.g. 0%
  allowNegativeCashflowWarning: boolean;
}

export interface AuditLog {
  id: string;
  action: string;
  module: 'members' | 'bhishi' | 'collections' | 'loans' | 'transactions' | 'expenses' | 'interest' | 'settings' | 'auth';
  details: string;
  entityId?: string;
  entityType?: string;
  previousData?: any;
  newData?: any;
  performedBy: string;
  timestamp: string;
  ipAddress?: string;
}
