import { MonthlyCollection, CollectionSummary, PaymentMethod, CollectionStatus } from '../types/collection';
import { fetchCollection, fetchDocById, saveDoc } from '../firebase/firestore';
import { generateReceiptNumber } from '../utils/receiptGenerator';
import { recordTransaction } from './transactionService';
import { getMemberById, updateMember } from './memberService';
import { logAuditEvent } from './settingsService';

const COLLECTION = 'monthlyCollections';

export async function getAllCollections(): Promise<MonthlyCollection[]> {
  const list = await fetchCollection<MonthlyCollection>(COLLECTION);
  return list.sort((a, b) => (b.dueDate + (b.paymentDate || '')).localeCompare(a.dueDate + (a.paymentDate || '')));
}

export async function getCollectionById(id: string): Promise<MonthlyCollection | null> {
  return await fetchDocById<MonthlyCollection>(COLLECTION, id);
}

export async function recordMonthlyPayment(
  collectionId: string,
  paymentDetails: {
    paidAmount: number;
    paymentDate: string;
    paymentMethod: PaymentMethod;
    referenceNumber?: string;
    notes?: string;
    receiptPrefix?: string;
  },
  adminName = 'Admin'
): Promise<{ collection: MonthlyCollection; receiptNumber: string }> {
  const col = await getCollectionById(collectionId);
  if (!col) throw new Error('Collection entry not found');

  const receiptNumber = col.receiptNumber || generateReceiptNumber(paymentDetails.receiptPrefix || 'REC');
  const nowPaid = (col.paidAmount || 0) + paymentDetails.paidAmount;
  const remaining = Math.max(0, col.expectedAmount - nowPaid);

  let newStatus: CollectionStatus = 'paid';
  if (remaining > 0) {
    newStatus = 'partial';
  }

  // 1. Record centralized transaction in ledger
  const txn = await recordTransaction({
    memberId: col.memberId,
    memberName: col.memberName,
    memberCode: col.memberCode,
    type: 'Monthly Collection',
    category: 'inflow',
    amount: paymentDetails.paidAmount,
    date: paymentDetails.paymentDate,
    paymentMethod: paymentDetails.paymentMethod,
    referenceNumber: paymentDetails.referenceNumber,
    receiptNumber: receiptNumber,
    relatedEntityId: col.id,
    description: `Monthly Bhishi installment for ${col.monthYearLabel} (${col.bhishiPlanName})`,
    notes: paymentDetails.notes,
    createdBy: adminName,
  });

  // 2. Update collection doc
  const updatedCol: MonthlyCollection = {
    ...col,
    paidAmount: nowPaid,
    remainingAmount: remaining,
    paymentDate: paymentDetails.paymentDate,
    paymentMethod: paymentDetails.paymentMethod,
    referenceNumber: paymentDetails.referenceNumber,
    receiptNumber,
    status: newStatus,
    notes: paymentDetails.notes || col.notes,
    transactionId: txn.id,
    updatedAt: new Date().toISOString(),
    collectedBy: adminName,
  };

  await saveDoc(COLLECTION, updatedCol);

  // 3. Update member's totalInvested balance
  const member = await getMemberById(col.memberId);
  if (member) {
    await updateMember(col.memberId, {
      totalInvested: (member.totalInvested || 0) + paymentDetails.paidAmount,
    }, adminName);
  }

  await logAuditEvent({
    action: 'Record Monthly Collection',
    module: 'collections',
    details: `Collected ₹${paymentDetails.paidAmount} from ${col.memberName} (${col.memberCode}) for ${col.monthYearLabel}. Receipt: ${receiptNumber}`,
    entityId: updatedCol.id,
    entityType: 'MonthlyCollection',
    performedBy: adminName,
    newData: updatedCol,
  });

  return { collection: updatedCol, receiptNumber };
}

export async function createCollectionScheduleEntry(
  data: Omit<MonthlyCollection, 'id' | 'paidAmount' | 'remainingAmount' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<MonthlyCollection> {
  const id = `COL-${data.year}${String(data.month).padStart(2, '0')}-${data.memberCode}-${Math.floor(Math.random() * 1000)}`;

  const entry: MonthlyCollection = {
    ...data,
    id,
    paidAmount: 0,
    remainingAmount: data.expectedAmount,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await saveDoc(COLLECTION, entry);
  return entry;
}

export function computeCollectionSummary(collections: MonthlyCollection[]): CollectionSummary {
  let expectedTotal = 0;
  let collectedTotal = 0;
  let pendingTotal = 0;
  let overdueTotal = 0;
  let paidCount = 0;
  let pendingCount = 0;
  let overdueCount = 0;

  const todayStr = new Date().toISOString().slice(0, 10);

  collections.forEach((c) => {
    expectedTotal += c.expectedAmount || 0;
    collectedTotal += c.paidAmount || 0;

    const remaining = c.remainingAmount || 0;
    if (c.status === 'paid') {
      paidCount++;
    } else if (c.status === 'overdue' || (remaining > 0 && c.dueDate < todayStr)) {
      overdueTotal += remaining;
      overdueCount++;
    } else {
      pendingTotal += remaining;
      pendingCount++;
    }
  });

  const collectionRate = expectedTotal > 0 ? Math.round((collectedTotal / expectedTotal) * 100) : 0;

  return {
    expectedTotal,
    collectedTotal,
    pendingTotal,
    overdueTotal,
    collectionRate,
    totalRecords: collections.length,
    paidCount,
    pendingCount,
    overdueCount,
  };
}
