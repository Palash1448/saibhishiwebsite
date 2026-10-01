export type MemberStatus = 'active' | 'inactive' | 'completed' | 'suspended';

export interface Member {
  id: string; // Document ID (e.g., MEM-001 or Firestore UUID)
  memberCode: string; // e.g. "SB-1001"
  fullName: string; // Member Name
  mobile: string; // Phone Number
  address: string; // Address
  aadharNumber?: string; // Aadhaar Number (12 digits)

  // Optional extended attributes
  profilePhoto?: string;
  alternateMobile?: string;
  email?: string;
  dob?: string;
  villageCity?: string;
  pincode?: string;
  idProofType?: 'Aadhaar' | 'PAN' | 'Voter ID' | 'Driving License';
  idProofRef?: string;
  joiningDate?: string; // YYYY-MM-DD
  bhishiPlanId?: string;
  bhishiPlanName?: string;
  monthlyContribution?: number; // Member's chosen monthly investment amount
  monthlyReturnRate?: number; // Return rate % per month (e.g. 1% or 1.5%)
  annualReturnRate?: number; // Admin's assigned yearly return rate (% p.a.)
  interestCutoffDay?: number; // Specific cutoff day of month for interest eligibility (e.g. 10th)
  durationMonths?: number; // Investment tenure in months
  maturityAmount?: number; // Projected maturity payout
  paymentDueDay?: number; // 1 to 31
  status: MemberStatus;
  notes?: string;

  // Calculated Financial Aggregates
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
