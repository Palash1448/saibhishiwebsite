import { BhishiPlan, BhishiMembership } from '../types/bhishi';
import { fetchCollection, fetchDocById, saveDoc, removeDoc } from '../firebase/firestore';
import { calculateMaturityAmount } from '../utils/calculations';
import { logAuditEvent } from './settingsService';
import { getMemberById, updateMember } from './memberService';

const PLANS_COLLECTION = 'bhishiPlans';
const MEMBERSHIPS_COLLECTION = 'memberships';

export async function getAllBhishiPlans(): Promise<BhishiPlan[]> {
  const plans = await fetchCollection<BhishiPlan>(PLANS_COLLECTION);
  return plans.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

export async function getBhishiPlanById(id: string): Promise<BhishiPlan | null> {
  return await fetchDocById<BhishiPlan>(PLANS_COLLECTION, id);
}

export async function createBhishiPlan(
  data: Omit<BhishiPlan, 'id' | 'totalPrincipal' | 'estimatedMaturityAmount' | 'enrolledMembersCount' | 'createdAt' | 'updatedAt'>,
  adminName = 'Admin'
): Promise<BhishiPlan> {
  const all = await getAllBhishiPlans();
  const nextNum = 101 + all.length;
  const id = `BP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const planCode = data.planCode || `BP-${nextNum}`;

  const calc = calculateMaturityAmount(
    data.monthlyContribution,
    data.durationMonths,
    data.annualInterestRate,
    data.returnCalculationMethod
  );

  const newPlan: BhishiPlan = {
    ...data,
    id,
    planCode,
    totalPrincipal: calc.totalPrincipal,
    estimatedMaturityAmount: calc.maturityAmount,
    enrolledMembersCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: adminName,
  };

  await saveDoc(PLANS_COLLECTION, newPlan);

  await logAuditEvent({
    action: 'Create Bhishi Plan',
    module: 'bhishi',
    details: `Created new Bhishi plan: ${newPlan.planName} (Base ₹${newPlan.monthlyContribution}/mo for ${newPlan.durationMonths} months @ ${newPlan.annualInterestRate}% p.a. yearly return)`,
    entityId: newPlan.id,
    entityType: 'BhishiPlan',
    performedBy: adminName,
    newData: newPlan,
  });

  return newPlan;
}

export async function updateBhishiPlan(id: string, updates: Partial<BhishiPlan>, adminName = 'Admin'): Promise<BhishiPlan> {
  const existing = await getBhishiPlanById(id);
  if (!existing) throw new Error('Bhishi plan not found');

  const monthlyContribution = updates.monthlyContribution ?? existing.monthlyContribution;
  const durationMonths = updates.durationMonths ?? existing.durationMonths;
  const annualInterestRate = updates.annualInterestRate ?? existing.annualInterestRate;
  const returnCalculationMethod = updates.returnCalculationMethod ?? existing.returnCalculationMethod;

  const calc = calculateMaturityAmount(
    monthlyContribution,
    durationMonths,
    annualInterestRate,
    returnCalculationMethod
  );

  const updated: BhishiPlan = {
    ...existing,
    ...updates,
    id,
    totalPrincipal: calc.totalPrincipal,
    estimatedMaturityAmount: calc.maturityAmount,
    updatedAt: new Date().toISOString(),
  };

  await saveDoc(PLANS_COLLECTION, updated);

  await logAuditEvent({
    action: 'Update Bhishi Plan',
    module: 'bhishi',
    details: `Modified plan parameters for ${updated.planName}`,
    entityId: id,
    entityType: 'BhishiPlan',
    performedBy: adminName,
    previousData: existing,
    newData: updated,
  });

  return updated;
}

export async function deleteBhishiPlan(id: string, adminName = 'Admin'): Promise<void> {
  const existing = await getBhishiPlanById(id);
  await removeDoc(PLANS_COLLECTION, id);

  if (existing) {
    await logAuditEvent({
      action: 'Delete Bhishi Plan',
      module: 'bhishi',
      details: `Deleted Bhishi plan ${existing.planName}`,
      entityId: id,
      entityType: 'BhishiPlan',
      performedBy: adminName,
    });
  }
}

export async function getAllMemberships(): Promise<BhishiMembership[]> {
  const list = await fetchCollection<BhishiMembership>(MEMBERSHIPS_COLLECTION);
  return list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

export interface EnrollMemberParams {
  memberId: string;
  memberName: string;
  memberCode: string;
  planId?: string;
  planName?: string;
  monthlyContribution: number; // Member's chosen monthly investment amount (₹)
  monthlyReturnRate?: number; // Return rate % per month (e.g. 1% or 1.5%)
  annualReturnRate?: number; // Equivalent annual return rate (% p.a.)
  interestCutoffDay?: number; // Day of month cutoff (e.g. 10th)
  durationMonths: number; // Duration in months
  startDate: string; // YYYY-MM-DD
  paymentDueDay?: number; // 1 to 31
  notes?: string;
  adminName?: string;
}

export async function enrollMemberInInvestment(
  params: EnrollMemberParams
): Promise<BhishiMembership> {
  const adminName = params.adminName || 'Admin';
  const id = `MEMSHIP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const monthlyRate = params.monthlyReturnRate ?? (params.annualReturnRate ? params.annualReturnRate / 12 : 1);
  const annualRate = params.annualReturnRate ?? Math.round(monthlyRate * 12 * 10) / 10;
  const cutoffDay = params.interestCutoffDay ?? 10;

  const start = new Date(params.startDate);
  const end = new Date(start);
  end.setMonth(end.getMonth() + params.durationMonths);

  const calc = calculateMaturityAmount(
    params.monthlyContribution,
    params.durationMonths,
    annualRate,
    'simple'
  );

  const membership: BhishiMembership = {
    id,
    memberId: params.memberId,
    memberName: params.memberName,
    memberCode: params.memberCode,
    planId: params.planId || 'custom-plan',
    planName: params.planName || `Custom Plan (₹${params.monthlyContribution.toLocaleString('en-IN')}/mo @ ${monthlyRate}%/mo • Cutoff: ${cutoffDay}th)`,
    startDate: params.startDate,
    endDate: end.toISOString().slice(0, 10),
    monthlyContribution: params.monthlyContribution,
    monthlyReturnRate: monthlyRate,
    annualReturnRate: annualRate,
    interestCutoffDay: cutoffDay,
    totalMonths: params.durationMonths,
    monthsPaid: 0,
    totalPaid: 0,
    totalPending: calc.totalPrincipal,
    maturityAmount: calc.maturityAmount,
    paymentDueDay: params.paymentDueDay || cutoffDay,
    status: 'active',
    notes: params.notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Save to memberships collection
  await saveDoc(MEMBERSHIPS_COLLECTION, membership);

  // Sync member profile with their chosen investment and admin's monthly rate & cutoff day
  await updateMember(
    params.memberId,
    {
      bhishiPlanId: membership.planId,
      bhishiPlanName: membership.planName,
      monthlyContribution: params.monthlyContribution,
      monthlyReturnRate: monthlyRate,
      annualReturnRate: annualRate,
      interestCutoffDay: cutoffDay,
      durationMonths: params.durationMonths,
      maturityAmount: calc.maturityAmount,
      paymentDueDay: params.paymentDueDay || cutoffDay,
    },
    adminName
  );

  // If connected to a real Bhishi plan, increment enrolled count
  if (params.planId && params.planId !== 'custom-plan') {
    const plan = await getBhishiPlanById(params.planId);
    if (plan) {
      await updateBhishiPlan(
        plan.id,
        { enrolledMembersCount: (plan.enrolledMembersCount || 0) + 1 },
        adminName
      );
    }
  }

  await logAuditEvent({
    action: 'Enroll Member in Investment Scheme',
    module: 'bhishi',
    details: `Enrolled ${params.memberName} (${params.memberCode}) with monthly investment of ₹${params.monthlyContribution}, return rate of ${monthlyRate}%/mo (${annualRate}% p.a.), and interest cutoff on the ${cutoffDay}th`,
    entityId: membership.id,
    entityType: 'BhishiMembership',
    performedBy: adminName,
    newData: membership,
  });

  return membership;
}

// Backward-compatible wrapper
export async function enrollMemberInPlan(
  memberId: string,
  memberName: string,
  memberCode: string,
  plan: BhishiPlan,
  startDate: string,
  adminName = 'Admin'
): Promise<BhishiMembership> {
  return enrollMemberInInvestment({
    memberId,
    memberName,
    memberCode,
    planId: plan.id,
    planName: plan.planName,
    monthlyContribution: plan.monthlyContribution,
    annualReturnRate: plan.annualInterestRate,
    durationMonths: plan.durationMonths,
    startDate,
    paymentDueDay: plan.paymentDueDay || 10,
    adminName,
  });
}

export async function updateMembership(
  id: string,
  updates: Partial<BhishiMembership>,
  adminName = 'Admin'
): Promise<BhishiMembership> {
  const existing = await fetchDocById<BhishiMembership>(MEMBERSHIPS_COLLECTION, id);
  if (!existing) throw new Error('Membership not found');

  const updated: BhishiMembership = {
    ...existing,
    ...updates,
    id,
    updatedAt: new Date().toISOString(),
  };

  await saveDoc(MEMBERSHIPS_COLLECTION, updated);

  // Sync member profile if monthlyContribution, return rate or plan name updated
  if (
    updates.monthlyContribution !== undefined ||
    updates.annualReturnRate !== undefined ||
    updates.planName !== undefined
  ) {
    await updateMember(
      existing.memberId,
      {
        monthlyContribution: updated.monthlyContribution,
        annualReturnRate: updated.annualReturnRate,
        bhishiPlanName: updated.planName,
        paymentDueDay: updated.paymentDueDay,
      },
      adminName
    );
  }

  await logAuditEvent({
    action: 'Update Membership',
    module: 'bhishi',
    details: `Updated investment membership for ${updated.memberName}`,
    entityId: id,
    entityType: 'BhishiMembership',
    performedBy: adminName,
  });

  return updated;
}

export async function cancelMembership(id: string, adminName = 'Admin'): Promise<void> {
  const existing = await fetchDocById<BhishiMembership>(MEMBERSHIPS_COLLECTION, id);
  if (!existing) return;

  await updateMembership(id, { status: 'cancelled' }, adminName);

  await logAuditEvent({
    action: 'Cancel Membership',
    module: 'bhishi',
    details: `Cancelled membership for ${existing.memberName}`,
    entityId: id,
    entityType: 'BhishiMembership',
    performedBy: adminName,
  });
}
