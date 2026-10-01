import { Member, MemberFilterOptions } from '../types/member';
import { fetchCollection, fetchDocById, saveDoc, removeDoc } from '../firebase/firestore';
import { logAuditEvent } from './settingsService';

const COLLECTION = 'members';

export async function getAllMembers(): Promise<Member[]> {
  const members = await fetchCollection<Member>(COLLECTION);
  return members.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

export async function getMemberById(id: string): Promise<Member | null> {
  return await fetchDocById<Member>(COLLECTION, id);
}

export async function createMember(data: Omit<Member, 'id' | 'createdAt' | 'updatedAt' | 'totalInvested' | 'totalReturns' | 'totalAmountReceived' | 'totalLoanTaken' | 'totalLoanRepaid' | 'outstandingLoan'>, adminName = 'Admin'): Promise<Member> {
  const all = await getAllMembers();
  const nextNumber = 1000 + all.length + 1;
  const id = `MEM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const memberCode = data.memberCode || `SB-${nextNumber}`;

  const newMember: Member = {
    ...data,
    id,
    memberCode,
    totalInvested: 0,
    totalReturns: 0,
    totalAmountReceived: 0,
    totalLoanTaken: 0,
    totalLoanRepaid: 0,
    outstandingLoan: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: adminName,
  };

  await saveDoc(COLLECTION, newMember);

  await logAuditEvent({
    action: 'Create Member',
    module: 'members',
    details: `Added new member ${newMember.fullName} (${newMember.memberCode}) with monthly plan ${newMember.bhishiPlanName || 'Standard'}`,
    entityId: newMember.id,
    entityType: 'Member',
    performedBy: adminName,
    newData: newMember,
  });

  return newMember;
}

export async function updateMember(id: string, updates: Partial<Member>, adminName = 'Admin'): Promise<Member> {
  const existing = await getMemberById(id);
  if (!existing) throw new Error('Member not found');

  const updated: Member = {
    ...existing,
    ...updates,
    id,
    updatedAt: new Date().toISOString(),
    updatedBy: adminName,
  };

  await saveDoc(COLLECTION, updated);

  await logAuditEvent({
    action: 'Update Member',
    module: 'members',
    details: `Updated details for ${updated.fullName} (${updated.memberCode})`,
    entityId: id,
    entityType: 'Member',
    performedBy: adminName,
    previousData: existing,
    newData: updated,
  });

  return updated;
}

export async function archiveMember(id: string, adminName = 'Admin'): Promise<void> {
  const existing = await getMemberById(id);
  if (!existing) return;

  await updateMember(id, { status: 'inactive' }, adminName);

  await logAuditEvent({
    action: 'Archive Member',
    module: 'members',
    details: `Archived/Inactivated member ${existing.fullName} (${existing.memberCode})`,
    entityId: id,
    entityType: 'Member',
    performedBy: adminName,
  });
}

export async function deleteMemberPermanently(id: string, adminName = 'Admin'): Promise<void> {
  const existing = await getMemberById(id);
  await removeDoc(COLLECTION, id);

  if (existing) {
    await logAuditEvent({
      action: 'Delete Member',
      module: 'members',
      details: `Permanently removed member ${existing.fullName} (${existing.memberCode})`,
      entityId: id,
      entityType: 'Member',
      performedBy: adminName,
    });
  }
}

/**
 * Filter and sort helper
 */
export function filterMembers(members: Member[], options: MemberFilterOptions): Member[] {
  let result = [...members];

  if (options.searchQuery?.trim()) {
    const q = options.searchQuery.toLowerCase().trim();
    result = result.filter(
      (m) =>
        m.fullName.toLowerCase().includes(q) ||
        m.memberCode.toLowerCase().includes(q) ||
        m.mobile.includes(q) ||
        (m.address && m.address.toLowerCase().includes(q)) ||
        (m.aadharNumber && m.aadharNumber.toLowerCase().includes(q)) ||
        (m.idProofRef && m.idProofRef.toLowerCase().includes(q))
    );
  }

  if (options.status && options.status !== 'all') {
    result = result.filter((m) => m.status === options.status);
  }

  if (options.bhishiPlanId && options.bhishiPlanId !== 'all') {
    result = result.filter((m) => m.bhishiPlanId === options.bhishiPlanId);
  }

  if (options.hasOutstandingLoan) {
    result = result.filter((m) => m.outstandingLoan > 0);
  }

  if (options.sortBy) {
    result.sort((a, b) => {
      let aVal: any = a[options.sortBy as keyof Member];
      let bVal: any = b[options.sortBy as keyof Member];
      if (options.sortBy === 'name') {
        aVal = a.fullName;
        bVal = b.fullName;
      }
      if (typeof aVal === 'string') {
        return options.sortOrder === 'desc' ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
      }
      return options.sortOrder === 'desc' ? (bVal || 0) - (aVal || 0) : (aVal || 0) - (bVal || 0);
    });
  }

  return result;
}
