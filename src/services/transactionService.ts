import { Transaction, TransactionFilterOptions, TransactionType, TransactionCategory } from '../types/transaction';
import { fetchCollection, fetchDocById, saveDoc } from '../firebase/firestore';
import { generateTransactionNumber } from '../utils/receiptGenerator';
import { logAuditEvent } from './settingsService';

const COLLECTION = 'transactions';

// In-memory idempotency check cache to block fast concurrent double-clicks
const activeIdempotencyKeys = new Set<string>();

export async function getAllTransactions(): Promise<Transaction[]> {
  const txns = await fetchCollection<Transaction>(COLLECTION);
  return txns.sort((a, b) => (b.date + (b.time || '')).localeCompare(a.date + (a.time || '')));
}

export async function getTransactionById(id: string): Promise<Transaction | null> {
  return await fetchDocById<Transaction>(COLLECTION, id);
}

export async function recordTransaction(
  data: Omit<Transaction, 'id' | 'transactionNumber' | 'createdAt' | 'updatedAt' | 'isReversed'>,
  idempotencyKey?: string
): Promise<Transaction> {
  const key = idempotencyKey || data.idempotencyKey || `${data.type}-${data.memberId || 'none'}-${data.amount}-${data.date}-${data.referenceNumber || ''}`;

  if (activeIdempotencyKeys.has(key)) {
    throw new Error('A transaction with this request is already processing. Duplicate submission blocked.');
  }

  activeIdempotencyKeys.add(key);

  try {
    // Check if an existing transaction with identical idempotency key or identical details was recorded in the last 2 minutes
    const existingTxns = await getAllTransactions();
    const isDuplicate = existingTxns.some(
      (t) =>
        t.idempotencyKey === key ||
        (!t.isReversed &&
          t.type === data.type &&
          t.memberId === data.memberId &&
          t.amount === data.amount &&
          t.date === data.date &&
          t.referenceNumber &&
          t.referenceNumber === data.referenceNumber)
    );

    if (isDuplicate) {
      const match = existingTxns.find((t) => t.idempotencyKey === key || t.referenceNumber === data.referenceNumber);
      if (match) {
        return match;
      }
      throw new Error('Duplicate transaction detected. This payment has already been recorded.');
    }

    const id = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const transactionNumber = generateTransactionNumber();

    const now = new Date();
    const newTxn: Transaction = {
      ...data,
      id,
      transactionNumber,
      idempotencyKey: key,
      time: now.toTimeString().slice(0, 8),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      isReversed: false,
    };

    await saveDoc(COLLECTION, newTxn);

    await logAuditEvent({
      action: `Record ${newTxn.type}`,
      module: 'transactions',
      details: `${newTxn.type} of ₹${newTxn.amount} recorded for ${newTxn.memberName || 'General'} (${newTxn.paymentMethod})`,
      entityId: newTxn.id,
      entityType: 'Transaction',
      performedBy: newTxn.createdBy || 'Admin',
      newData: newTxn,
    });

    return newTxn;
  } finally {
    // Remove from in-memory set after 3 seconds
    setTimeout(() => {
      activeIdempotencyKeys.delete(key);
    }, 3000);
  }
}

/**
 * Reverses a transaction safely with audit logging (never deletes historical record)
 */
export async function reverseTransaction(
  transactionId: string,
  reason: string,
  adminName = 'Admin'
): Promise<{ original: Transaction; reversal: Transaction }> {
  const original = await getTransactionById(transactionId);
  if (!original) throw new Error('Transaction not found');
  if (original.isReversed) throw new Error('This transaction is already reversed.');

  const now = new Date();
  const reversalId = `TXN-REV-${Date.now()}`;
  const reversalTxnNumber = generateTransactionNumber('REV');

  // Create offsetting reversal transaction
  const reversalTxn: Transaction = {
    id: reversalId,
    transactionNumber: reversalTxnNumber,
    type: 'Reversal',
    category: original.category === 'inflow' ? 'outflow' : 'inflow',
    amount: original.amount,
    date: now.toISOString().slice(0, 10),
    time: now.toTimeString().slice(0, 8),
    paymentMethod: original.paymentMethod,
    memberId: original.memberId,
    memberName: original.memberName,
    memberCode: original.memberCode,
    relatedEntityId: original.id,
    description: `Reversal of #${original.transactionNumber}: ${reason}`,
    notes: `Original Txn ID: ${original.id}. Reason: ${reason}`,
    createdBy: adminName,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    isReversed: false,
  };

  await saveDoc(COLLECTION, reversalTxn);

  // Mark original transaction as reversed
  const updatedOriginal: Transaction = {
    ...original,
    isReversed: true,
    reversedAt: now.toISOString(),
    reversedBy: adminName,
    reversalReason: reason,
    reversalTransactionId: reversalId,
    updatedAt: now.toISOString(),
  };

  await saveDoc(COLLECTION, updatedOriginal);

  await logAuditEvent({
    action: 'Reverse Transaction',
    module: 'transactions',
    details: `Reversed transaction #${original.transactionNumber} (₹${original.amount}). Reason: ${reason}`,
    entityId: original.id,
    entityType: 'Transaction',
    performedBy: adminName,
    previousData: original,
    newData: { original: updatedOriginal, reversal: reversalTxn },
  });

  return { original: updatedOriginal, reversal: reversalTxn };
}

export function filterTransactions(txns: Transaction[], options: TransactionFilterOptions): Transaction[] {
  let list = [...txns];

  if (options.searchQuery?.trim()) {
    const q = options.searchQuery.toLowerCase().trim();
    list = list.filter(
      (t) =>
        t.transactionNumber.toLowerCase().includes(q) ||
        (t.memberName && t.memberName.toLowerCase().includes(q)) ||
        (t.memberCode && t.memberCode.toLowerCase().includes(q)) ||
        (t.receiptNumber && t.receiptNumber.toLowerCase().includes(q)) ||
        (t.referenceNumber && t.referenceNumber.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q))
    );
  }

  if (options.startDate) {
    list = list.filter((t) => t.date >= options.startDate!);
  }

  if (options.endDate) {
    list = list.filter((t) => t.date <= options.endDate!);
  }

  if (options.type && options.type !== 'all') {
    list = list.filter((t) => t.type === options.type);
  }

  if (options.category && options.category !== 'all') {
    list = list.filter((t) => t.category === options.category);
  }

  if (options.memberId) {
    list = list.filter((t) => t.memberId === options.memberId);
  }

  if (options.paymentMethod && options.paymentMethod !== 'all') {
    list = list.filter((t) => t.paymentMethod === options.paymentMethod);
  }

  if (options.minAmount !== undefined && options.minAmount !== null) {
    list = list.filter((t) => t.amount >= options.minAmount!);
  }

  if (options.maxAmount !== undefined && options.maxAmount !== null) {
    list = list.filter((t) => t.amount <= options.maxAmount!);
  }

  return list;
}
