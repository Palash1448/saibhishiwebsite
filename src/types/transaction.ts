import { PaymentMethod } from './collection';

export type TransactionType =
  | 'Investment'
  | 'Monthly Collection'
  | 'Interest Credit'
  | 'Loan Disbursement'
  | 'Loan Repayment'
  | 'Loan Interest Payment'
  | 'Processing Fee'
  | 'Expense'
  | 'Withdrawal'
  | 'Adjustment'
  | 'Reversal'
  | 'Other';

export type TransactionCategory = 'inflow' | 'outflow' | 'neutral';

export interface Transaction {
  id: string; // e.g. "TXN-20260928-1001"
  transactionNumber: string;
  idempotencyKey?: string; // unique hash/key to prevent double-clicks & duplicates
  
  memberId?: string;
  memberName?: string;
  memberCode?: string;
  
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm:ss
  type: TransactionType;
  category: TransactionCategory; // inflow (+) or outflow (-)
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string; // UPI UTR / Cheque / Bank Ref
  receiptNumber?: string;
  
  relatedEntityId?: string; // Loan ID, Bhishi Plan ID, Expense ID, etc.
  description: string;
  notes?: string;
  
  isReversed?: boolean;
  reversedAt?: string;
  reversedBy?: string;
  reversalReason?: string;
  reversalTransactionId?: string;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFilterOptions {
  startDate?: string;
  endDate?: string;
  type?: TransactionType | 'all';
  category?: TransactionCategory | 'all';
  memberId?: string;
  paymentMethod?: PaymentMethod | 'all';
  minAmount?: number;
  maxAmount?: number;
  searchQuery?: string;
}
