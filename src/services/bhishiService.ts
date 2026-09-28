import { BhishiPlan, BhishiMembership } from '../types/bhishi';
import { fetchCollection, fetchDocById, saveDoc, removeDoc } from '../firebase/firestore';
import { calculateMaturityAmount } from '../utils/calculations';
import { logAuditEvent } from './settingsService';

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
    details: `Created new Bhishi plan: ${newPlan.planName} (₹${newPlan.monthlyContribution}/mo for ${newPlan.durationMonths} months @ ${newPlan.annualInterestRate}%)`,
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

export async function enrollMemberInPlan(
  memberId: string,
  memberName: string,
  memberCode: string,
  plan: BhishiPlan,
  startDate: string,
  adminName = 'Admin'
): Promise<BhishiMembership> {
  const id = `MEMSHIP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const start = new Date(startDate);
  const end = new Date(start);
  end.setMonth(end.getMonth() + plan.durationMonths);

  const membership: BhishiMembership = {
    id,
    memberId,
    memberName,
    memberCode,
    planId: plan.id,
    planName: plan.planName,
    startDate,
    endDate: end.toISOString().slice(0, 10),
    monthlyContribution: plan.monthlyContribution,
    totalMonths: plan.durationMonths,
    monthsPaid: 0,
    totalPaid: 0,
    totalPending: plan.totalPrincipal,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await saveDoc(MEMBERSHIPS_COLLECTION, membership);

  // Update plan enrolled count
  await updateBhishiPlan(plan.id, { enrolledMembersCount: (plan.enrolledMembersCount || 0) + 1 }, adminName);

  await logAuditEvent({
    action: 'Enroll Member in Bhishi',
    module: 'bhishi',
    details: `Enrolled ${memberName} (${memberCode}) in ${plan.planName}`,
    entityId: membership.id,
    entityType: 'BhishiMembership',
    performedBy: adminName,
  });

  return membership;
}
