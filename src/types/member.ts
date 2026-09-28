export type MemberStatus = 'active' | 'inactive' | 'completed' | 'suspended';

export interface Member {
  id: string; // Document ID (e.g., MEM-001 or Firestore UUID)
  memberCode: string; // e.g. "SB-1001"
  fullName: string;
  profilePhoto?: string;
  mobile: string;
  alternateMobile?: string;
  email?: string;
  dob?: string;
  address: string;
  villageCity: string;
  pincode: string;
  idProofType?: 'Aadhaar' | 'PAN' | 'Voter ID' | 'Driving License';
  idProofRef?: string; // Masked / last 4 digits stored securely
  joiningDate: string; // YYYY-MM-DD
  bhishiPlanId?: string;
  bhishiPlanName?: string;
  monthlyContribution: number;
  paymentDueDay: number; // 1 to 31
  status: MemberStatus;
  notes?: string;

  // Calculated Financial Aggregates (kept in sync via atomic services)
  totalInvested: number;
  totalReturns: number;
  totalAmountReceived: number; // payouts / maturity collected
  totalLoanTaken: number;
  totalLoanRepaid: number;
  outstandingLoan: number;

  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface MemberFilterOptions {
  searchQuery?: string;
  status?: MemberStatus | 'all';
  bhishiPlanId?: string | 'all';
  hasOutstandingLoan?: boolean;
  sortBy?: 'name' | 'code' | 'joiningDate' | 'totalInvested' | 'outstandingLoan';
  sortOrder?: 'asc' | 'desc';
}
