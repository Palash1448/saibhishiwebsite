import { PaymentMethod } from './collection';

export type LoanStatus = 'active' | 'closed' | 'defaulted' | 'settled';
export type LoanCalculationMethod = 'flat' | 'reducing_balance';
export type InstallmentStatus = 'upcoming' | 'due' | 'paid' | 'partial' | 'overdue';

export interface LoanInstallment {
  installmentNumber: number;
  dueDate: string; // YYYY-MM-DD
  principalAmount: number;
  interestAmount: number;
  totalInstallment: number; // EMI
  paidAmount: number;
  remainingAmount: number;
  paidDate?: string;
  status: InstallmentStatus;
  paymentMethod?: PaymentMethod;
  referenceNumber?: string;
  receiptNumber?: string;
  notes?: string;
}

export interface Loan {
  id: string; // e.g. "LN-2026-101"
  loanNumber: string;
  memberId: string;
  memberName: string;
  memberCode: string;
  
  principalAmount: number; // e.g. ₹1,00,000
  monthlyInterestRate: number; // e.g. 2 (%) - manually configurable per loan
  annualInterestRate: number; // monthlyInterestRate * 12
  calculationMethod: LoanCalculationMethod; // 'flat' | 'reducing_balance'
  durationMonths: number; // e.g. 12
  numberOfInstallments: number;
  
  monthlyInstallment: number; // calculated EMI
  processingFee: number;
  totalInterest: number;
  totalPayable: number; // principal + interest + processingFee
  
  issueDate: string; // YYYY-MM-DD
  firstDueDate: string; // YYYY-MM-DD
  disbursementPaymentMethod: PaymentMethod;
  disbursementRefNumber?: string;
  
  totalPrincipalPaid: number;
  totalInterestPaid: number;
  totalAmountPaid: number;
  outstandingPrincipal: number;
  outstandingInterest: number;
  outstandingTotal: number;
  
  status: LoanStatus;
  purpose?: string;
  guarantorName?: string;
  guarantorMobile?: string;
  notes?: string;
  
  installments: LoanInstallment[];
  
  createdAt: string;
  updatedAt: string;
  disbursedBy?: string;
}

export interface LoanRepaymentPayload {
  loanId: string;
  installmentNumbers: number[];
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
}
