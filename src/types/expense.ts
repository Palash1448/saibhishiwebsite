import { PaymentMethod } from './collection';

export type ExpenseCategory =
  | 'Office'
  | 'Salary'
  | 'Rent'
  | 'Electricity'
  | 'Travel'
  | 'Marketing'
  | 'Maintenance'
  | 'Software / Tech'
  | 'Tea & Refreshment'
  | 'Legal & Professional'
  | 'Other';

export interface Expense {
  id: string; // e.g. "EXP-2026-101"
  expenseNumber: string;
  date: string; // YYYY-MM-DD
  category: ExpenseCategory;
  amount: number;
  paymentMethod: PaymentMethod;
  recipientName?: string;
  description: string;
  receiptNumber?: string;
  notes?: string;
  
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
  recordedBy: string;
}

export interface ExpenseSummary {
  totalExpense: number;
  categoryBreakdown: { category: ExpenseCategory; total: number; percentage: number }[];
  currentMonthExpense: number;
}
