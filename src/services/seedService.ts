import { Member } from '../types/member';
import { BhishiPlan, InterestRecord } from '../types/bhishi';
import { MonthlyCollection } from '../types/collection';
import { Loan } from '../types/loan';
import { Transaction } from '../types/transaction';
import { Expense } from '../types/expense';
import { AuditLog } from '../types/settings';

/**
 * Returns empty database structure with no dummy/sample records.
 */
export function getInitialDemoData(): {
  members: Member[];
  plans: BhishiPlan[];
  collections: MonthlyCollection[];
  loans: Loan[];
  expenses: Expense[];
  transactions: Transaction[];
  interestRecords: InterestRecord[];
  auditLogs: AuditLog[];
} {
  return {
    members: [],
    plans: [],
    collections: [],
    loans: [],
    expenses: [],
    transactions: [],
    interestRecords: [],
    auditLogs: [],
  };
}

/**
 * Clean data initializer - does not populate dummy mock data
 */
export function seedInitialDataIfEmpty(): void {
  // No-op: Dummy data removed
}
