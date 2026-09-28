import { PaymentMethod } from '../types/collection';
import { ExpenseCategory } from '../types/expense';
import { TransactionType } from '../types/transaction';

export const PAYMENT_METHODS: PaymentMethod[] = [
  'Cash',
  'UPI',
  'Bank Transfer',
  'Cheque',
  'Other',
];

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Office',
  'Salary',
  'Rent',
  'Electricity',
  'Travel',
  'Marketing',
  'Maintenance',
  'Software / Tech',
  'Tea & Refreshment',
  'Legal & Professional',
  'Other',
];

export const TRANSACTION_TYPES: TransactionType[] = [
  'Investment',
  'Monthly Collection',
  'Interest Credit',
  'Loan Disbursement',
  'Loan Repayment',
  'Processing Fee',
  'Expense',
  'Withdrawal',
  'Adjustment',
  'Reversal',
  'Other',
];

export const BHISHI_DURATIONS = [
  { months: 10, label: '10 Months' },
  { months: 12, label: '12 Months (1 Year)' },
  { months: 15, label: '15 Months' },
  { months: 20, label: '20 Months' },
  { months: 24, label: '24 Months (2 Years)' },
  { months: 36, label: '36 Months (3 Years)' },
];

export const POPULAR_MONTHLY_AMOUNTS = [
  1000, 2000, 2500, 3000, 5000, 10000, 15000, 20000, 25000, 50000
];
