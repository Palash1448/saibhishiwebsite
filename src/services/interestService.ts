import { InterestRecord } from '../types/bhishi';
import { Member } from '../types/member';
import { MonthlyCollection } from '../types/collection';
import { fetchCollection, fetchDocById, saveDoc } from '../firebase/firestore';
import { calculateMemberCollectionsInterest, MemberCollectionsInterestResult } from '../utils/calculations';
import { recordTransaction } from './transactionService';
import { getMemberById, updateMember } from './memberService';
import { logAuditEvent } from './settingsService';

const COLLECTION = 'interestRecords';

export async function getAllInterestRecords(): Promise<InterestRecord[]> {
  const list = await fetchCollection<InterestRecord>(COLLECTION);
  return list.sort((a, b) => (b.creditedDate || '').localeCompare(a.creditedDate || ''));
}

export async function previewMemberInterest(
  member: Member,
  monthlyRate: number,
  cutoffDay: number = 10,
  periodLabel: string = 'FY 2025-2026 (Monthly Calculated)',
  adjustmentAmount: number = 0,
  memberCollections: MonthlyCollection[] = []
): Promise<{ record: InterestRecord; calculation: MemberCollectionsInterestResult }> {
  const calculation = calculateMemberCollectionsInterest(
    memberCollections,
    monthlyRate,
    cutoffDay,
    member.totalInvested || 0,
    12
  );

  const finalInterestAmount = Math.max(0, calculation.totalEarnedInterest + adjustmentAmount);

  const record: InterestRecord = {
    id: `INT-PREVIEW-${member.id}-${Date.now()}`,
    memberId: member.id,
    memberName: member.fullName,
    memberCode: member.memberCode,
    planId: member.bhishiPlanId,
    planName: member.bhishiPlanName,
    calculationPeriod: periodLabel,
    principalAmount: calculation.totalPrincipal,
    monthlyRate: calculation.monthlyRate,
    annualRate: calculation.annualRate,
    interestCutoffDay: cutoffDay,
    onTimeDepositsCount: calculation.onTimeCount,
    lateDepositsCount: calculation.lateCount,
    forfeitedInterestAmount: calculation.totalForfeitedInterest,
    calculatedInterest: calculation.totalEarnedInterest,
    adjustmentAmount,
    finalInterestAmount,
    creditedDate: new Date().toISOString().slice(0, 10),
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return { record, calculation };
}

export async function creditInterestToMember(
  record: Omit<InterestRecord, 'id' | 'status' | 'createdAt' | 'updatedAt'>,
  adminName = 'Admin'
): Promise<InterestRecord> {
  const id = `INT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // 1. Record transaction in centralized ledger
  const txn = await recordTransaction({
    memberId: record.memberId,
    memberName: record.memberName,
    memberCode: record.memberCode,
    type: 'Interest Credit',
    category: 'inflow', // Increases member's value
    amount: record.finalInterestAmount,
    date: record.creditedDate,
    paymentMethod: 'Bank Transfer',
    relatedEntityId: id,
    description: `Yearly Interest Credit for ${record.calculationPeriod} (${record.annualRate}% p.a.)`,
    notes: record.notes,
    createdBy: adminName,
  });

  const finalRecord: InterestRecord = {
    ...record,
    id,
    status: 'credited',
    transactionId: txn.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: adminName,
  };

  await saveDoc(COLLECTION, finalRecord);

  // 2. Update Member's total returns summary
  const member = await getMemberById(record.memberId);
  if (member) {
    await updateMember(record.memberId, {
      totalReturns: (member.totalReturns || 0) + record.finalInterestAmount,
    }, adminName);
  }

  await logAuditEvent({
    action: 'Credit Interest / Return',
    module: 'interest',
    details: `Credited ₹${record.finalInterestAmount} interest to ${record.memberName} (${record.memberCode}) for ${record.calculationPeriod}`,
    entityId: finalRecord.id,
    entityType: 'InterestRecord',
    performedBy: adminName,
    newData: finalRecord,
  });

  return finalRecord;
}
