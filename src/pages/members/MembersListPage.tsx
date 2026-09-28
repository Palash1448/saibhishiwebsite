import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmationContext';
import type { Member, MemberStatus } from '../../types/member';
import { filterMembers, archiveMember } from '../../services/memberService';
import { Button } from '../../components/common/Button';
import { SearchInput } from '../../components/common/SearchInput';
import { Badge, getStatusBadgeVariant } from '../../components/common/Badge';
import { MemberFormModal } from '../../components/members/MemberFormModal';
import { formatCurrency, formatDate, maskSensitiveId } from '../../utils/formatters';
import { exportToCSV } from '../../utils/exportUtils';
import {
  UserPlus,
  Download,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Phone,
  MapPin,
  CircleDollarSign,
  CreditCard,
  Layers,
  ArrowUpDown,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const MembersListPage: React.FC = () => {
  const { members, plans, refreshAll } = useData();
  const { success } = useToast();
  const { confirm } = useConfirm();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<MemberStatus | 'all'>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'code' | 'joiningDate' | 'totalInvested' | 'outstandingLoan'>('joiningDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);

  const filtered = filterMembers(members, {
    searchQuery,
    status: statusFilter,
    bhishiPlanId: planFilter,
    sortBy,
    sortOrder,
  });

  const handleArchive = (member: Member) => {
    confirm({
      title: 'Archive Member?',
      message: `Are you sure you want to mark ${member.fullName} (${member.memberCode}) as inactive? Existing transaction and loan history will remain intact.`,
      confirmText: 'Yes, Inactivate',
      variant: 'warning',
      onConfirm: async () => {
        await archiveMember(member.id);
        await refreshAll();
        success('Member Inactivated', `${member.fullName} marked as inactive.`);
      },
    });
  };

  const handleExportCSV = () => {
    exportToCSV(
      'SaiBhishi_Members_List',
      filtered.map((m) => ({
        'Member ID': m.memberCode,
        'Full Name': m.fullName,
        'Mobile Number': m.mobile,
        'Alternate Phone': m.alternateMobile || '',
        'Email': m.email || '',
        'City/Village': m.villageCity || '',
        'Plan': m.bhishiPlanName || 'None',
        'Monthly Due (₹)': m.monthlyContribution,
        'Total Invested (₹)': m.totalInvested,
        'Total Returns (₹)': m.totalReturns,
        'Active Loan Due (₹)': m.outstandingLoan,
        'Status': m.status,
        'Joining Date': m.joiningDate,
      }))
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-card">
        <div>
          <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight font-display">
            Member Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Customer KYC records, Bhishi memberships, and balances ({members.length} members)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none justify-center"
          >
            Export CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<UserPlus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 sm:flex-none justify-center"
          >
            + Add Member
          </Button>
        </div>
      </div>

      {/* Mobile-Friendly Search & Horizontal Filter Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-100 shadow-xs space-y-3">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, ID (MEM-1001), phone, city..."
        />

        {/* Native Horizontal Pill Filters on Mobile */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({members.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Active ({members.filter((m) => m.status === 'active').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('inactive')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              statusFilter === 'inactive'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Inactive
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              statusFilter === 'completed'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Completed
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('suspended')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              statusFilter === 'suspended'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Suspended
          </button>

          {/* Plan filter dropdown */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="bg-slate-100 border-none rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none shrink-0"
          >
            <option value="all">All Plans</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.planName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content Area: Mobile Native Cards vs Desktop Table */}
      {filtered.length === 0 ? (
        <div className="bg-white p-10 text-center rounded-2xl border border-slate-100">
          <p className="text-sm font-semibold text-slate-700">No members match your search or filter.</p>
          <p className="text-xs text-slate-400 mt-1">Try resetting search terms.</p>
        </div>
      ) : (
        <>
          {/* Mobile Native Fintech Card Feed */}
          <div className="space-y-3 sm:hidden">
            {filtered.map((m) => (
              <div
                key={m.id}
                onClick={() => navigate(`/members/${m.id}`)}
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card active:scale-[0.99] transition-all cursor-pointer space-y-3"
              >
                {/* Card Top: Avatar + Name + ID + Status */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-linear-to-tr from-emerald-600 to-teal-500 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                      {m.fullName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-sm truncate">{m.fullName}</h3>
                      <p className="font-mono text-[11px] text-slate-500">{m.memberCode} • {m.villageCity || 'India'}</p>
                    </div>
                  </div>
                  <Badge variant={getStatusBadgeVariant(m.status)} size="sm">
                    {m.status}
                  </Badge>
                </div>

                {/* Card Scheme & Monthly Contribution */}
                <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Scheme</span>
                    <span className="font-semibold text-slate-800">{m.bhishiPlanName || 'General'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Monthly Due</span>
                    <span className="font-bold text-emerald-700 font-mono">₹{m.monthlyContribution.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Card Balances: Invested vs Loan */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-100">
                    <span className="text-[10px] text-emerald-800 uppercase font-semibold block">Total Invested</span>
                    <p className="font-bold font-mono text-emerald-900 mt-0.5">{formatCurrency(m.totalInvested)}</p>
                  </div>

                  <div className="p-2 rounded-xl bg-amber-50/60 border border-amber-100">
                    <span className="text-[10px] text-amber-800 uppercase font-semibold block">Loan Outstanding</span>
                    <p className="font-bold font-mono text-amber-900 mt-0.5">
                      {m.outstandingLoan > 0 ? formatCurrency(m.outstandingLoan) : 'Nil'}
                    </p>
                  </div>
                </div>

                {/* Card Action Row */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                  <a
                    href={`tel:${m.mobile}`}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-600 p-1.5 rounded-lg"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{m.mobile}</span>
                  </a>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setMemberToEdit(m)}
                      className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => navigate(`/members/${m.id}`)}
                      className="px-3 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      Statement <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-6">Member Details</th>
                    <th className="py-3.5 px-4">Contact & Location</th>
                    <th className="py-3.5 px-4">Bhishi Plan</th>
                    <th className="py-3.5 px-4 text-right">Total Invested</th>
                    <th className="py-3.5 px-4 text-right">Loan Outstanding</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((m) => (
                    <tr
                      key={m.id}
                      onClick={() => navigate(`/members/${m.id}`)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm shrink-0">
                            {m.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{m.fullName}</p>
                            <p className="font-mono text-[11px] text-slate-500">{m.memberCode}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <p className="font-medium text-slate-800">{m.mobile}</p>
                        <p className="text-[11px] text-slate-500">{m.villageCity || 'Not specified'}</p>
                      </td>

                      <td className="py-4 px-4">
                        <p className="font-semibold text-slate-800">{m.bhishiPlanName || 'General Account'}</p>
                        <p className="text-[11px] text-emerald-700 font-mono">
                          ₹{m.monthlyContribution.toLocaleString('en-IN')}/mo
                        </p>
                      </td>

                      <td className="py-4 px-4 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(m.totalInvested)}
                      </td>

                      <td className="py-4 px-4 text-right font-mono font-bold">
                        {m.outstandingLoan > 0 ? (
                          <span className="text-amber-700">{formatCurrency(m.outstandingLoan)}</span>
                        ) : (
                          <span className="text-slate-400 font-mono text-xs">Nil</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <Badge variant={getStatusBadgeVariant(m.status)} size="sm">
                          {m.status}
                        </Badge>
                      </td>

                      <td
                        className="py-4 px-6 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/members/${m.id}`)}
                            title="View Profile & Statement"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setMemberToEdit(m)}
                            title="Edit Member"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleArchive(m)}
                            title="Archive"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <MemberFormModal
          isOpen={true}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      {/* Edit Member Modal */}
      {memberToEdit && (
        <MemberFormModal
          isOpen={true}
          onClose={() => setMemberToEdit(null)}
          memberToEdit={memberToEdit}
        />
      )}
    </div>
  );
};
