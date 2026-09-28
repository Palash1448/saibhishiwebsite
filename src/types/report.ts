import { Member } from './member';
import { Transaction } from './transaction';
import { MonthlyCollection } from './collection';
import { Loan } from './loan';
import { Expense } from './expense';

export type ReportType =
  | 'monthly_collection'
  | 'member_investment'
  | 'yearly_interest'
  | 'loan_disbursement_recovery'
  | 'outstanding_loans'
  | 'transactions_ledger'
  | 'cash_flow'
  | 'profit_interest'
  | 'defaulters_overdue'
  | 'member_statement';

export interface ReportDateRange {
  startDate: string;
  endDate: string;
  preset: 'this_month' | 'last_month' | 'last_3_months' | 'last_6_months' | 'this_year' | 'all' | 'custom';
}

export interface CashFlowStatement {
  inflow: {
    bhishiCollections: number;
    loanPrincipalRecovered: number;
    loanInterestCollected: number;
    processingFees: number;
    otherInflows: number;
    totalInflow: number;
  };
  outflow: {
    loanDisbursements: number;
    bhishiMaturityPayouts: number;
    interestCreditsPaid: number;
    operatingExpenses: number;
    otherOutflows: number;
    totalOutflow: number;
  };
  netCashFlow: number;
}

export interface MemberDetailedStatement {
  member: Member;
  collections: MonthlyCollection[];
  loans: Loan[];
  transactions: Transaction[];
  totalInvested: number;
  totalReturns: number;
  totalLoansTaken: number;
  totalLoansRepaid: number;
  currentOutstandingBalance: number;
}
