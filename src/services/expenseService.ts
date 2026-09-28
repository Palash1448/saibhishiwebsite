import { Expense, ExpenseCategory, ExpenseSummary } from '../types/expense';
import { fetchCollection, fetchDocById, saveDoc, removeDoc } from '../firebase/firestore';
import { recordTransaction } from './transactionService';
import { logAuditEvent } from './settingsService';

const COLLECTION = 'expenses';

export async function getAllExpenses(): Promise<Expense[]> {
  const list = await fetchCollection<Expense>(COLLECTION);
  return list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

export async function createExpense(
  data: Omit<Expense, 'id' | 'expenseNumber' | 'createdAt' | 'updatedAt'>,
  adminName = 'Admin'
): Promise<Expense> {
  const all = await getAllExpenses();
  const nextNum = 100 + all.length + 1;
  const expenseNumber = `EXP-${new Date().getFullYear()}-${nextNum}`;
  const id = `EXP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // 1. Record Outflow in centralized transactions
  const txn = await recordTransaction({
    type: 'Expense',
    category: 'outflow',
    amount: data.amount,
    date: data.date,
    paymentMethod: data.paymentMethod,
    relatedEntityId: id,
    description: `[${data.category}] ${data.description}${data.recipientName ? ` (Paid to: ${data.recipientName})` : ''}`,
    notes: data.notes,
    createdBy: adminName,
  });

  const newExpense: Expense = {
    ...data,
    id,
    expenseNumber,
    transactionId: txn.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    recordedBy: adminName,
  };

  await saveDoc(COLLECTION, newExpense);

  await logAuditEvent({
    action: 'Add Expense',
    module: 'expenses',
    details: `Added ${data.category} expense of ₹${data.amount} (${data.description})`,
    entityId: newExpense.id,
    entityType: 'Expense',
    performedBy: adminName,
    newData: newExpense,
  });

  return newExpense;
}

export async function deleteExpense(id: string, adminName = 'Admin'): Promise<void> {
  const existing = await fetchDocById<Expense>(COLLECTION, id);
  await removeDoc(COLLECTION, id);

  if (existing) {
    await logAuditEvent({
      action: 'Delete Expense',
      module: 'expenses',
      details: `Deleted expense #${existing.expenseNumber} (₹${existing.amount})`,
      entityId: id,
      entityType: 'Expense',
      performedBy: adminName,
    });
  }
}

export function computeExpenseSummary(expenses: Expense[]): ExpenseSummary {
  let totalExpense = 0;
  const categoryMap = new Map<ExpenseCategory, number>();
  const currentMonthPrefix = new Date().toISOString().slice(0, 7);
  let currentMonthExpense = 0;

  expenses.forEach((e) => {
    totalExpense += e.amount;
    const current = categoryMap.get(e.category) || 0;
    categoryMap.set(e.category, current + e.amount);

    if (e.date.startsWith(currentMonthPrefix)) {
      currentMonthExpense += e.amount;
    }
  });

  const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, total]) => ({
    category,
    total,
    percentage: totalExpense > 0 ? Math.round((total / totalExpense) * 100) : 0,
  })).sort((a, b) => b.total - a.total);

  return {
    totalExpense,
    categoryBreakdown,
    currentMonthExpense,
  };
}
