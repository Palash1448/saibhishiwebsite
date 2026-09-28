import { BusinessSettings, FinanceSettings } from '../types/settings';

export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  businessName: 'SaiBhishi Finance & Investment Co.',
  tagline: 'Trusted Community Savings, Bhishi & Microfinance Solutions',
  logoUrl: '',
  address: 'Plot No. 42, Sai Complex, Main Market Road',
  cityStatePincode: 'Nagpur, Maharashtra - 440010',
  phone: '+91 98765 43210',
  alternatePhone: '+91 87654 32109',
  email: 'admin@saibhishi.com',
  gstin: '27AAAAA0000A1Z5',
  panNumber: 'ABCDE1234F',
  currencySymbol: '₹',
  receiptPrefix: 'REC',
  transactionPrefix: 'TXN',
  loanPrefix: 'LN',
  memberPrefix: 'SB',
  authorizedSignatoryTitle: 'Authorized Signatory (SaiBhishi)',
};

export const DEFAULT_FINANCE_SETTINGS: FinanceSettings = {
  defaultAnnualReturnRate: 12, // 12% p.a.
  defaultBhishiCalculationMethod: 'simple',
  defaultMonthlyLoanInterestRate: 2, // 2% per month
  defaultLoanCalculationMethod: 'flat',
  defaultProcessingFeeRate: 1, // 1%
  defaultGracePeriodDays: 5,
  latePaymentPenaltyRate: 0,
  allowNegativeCashflowWarning: true,
};
