export type PaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque' | 'Other';
export type CollectionStatus = 'paid' | 'pending' | 'partial' | 'overdue';

export interface MonthlyCollection {
  id: string; // e.g. "COL-202609-1001"
  memberId: string;
  memberName: string;
  memberCode: string;
  bhishiPlanId: string;
  bhishiPlanName: string;
  month: number; // 1 to 12
  year: number; // e.g. 2026
  monthYearLabel: string; // e.g. "September 2026"
  installmentNumber: number; // e.g. Month 5 of 20
  
  expectedAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string; // YYYY-MM-DD
  paymentDate?: string; // YYYY-MM-DD
  paymentMethod?: PaymentMethod;
  referenceNumber?: string; // UPI UTR or Cheque number
  receiptNumber?: string; // e.g. "REC-2026-0042"
  status: CollectionStatus;
  notes?: string;
  
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
  collectedBy?: string;
}

export interface CollectionSummary {
  expectedTotal: number;
  collectedTotal: number;
  pendingTotal: number;
  overdueTotal: number;
  collectionRate: number; // percentage (0 to 100)
  totalRecords: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
}
