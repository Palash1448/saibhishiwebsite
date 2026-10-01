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
import { formatCurrency } from '../../utils/formatters';
import { exportToCSV } from '../../utils/exportUtils';
import {
  UserPlus,
  Download,
  Eye,
  Edit2,
  Phone,
  MapPin,
  CreditCard,
  ChevronRight,
} from 'lucide-react';

export const MembersListPage: React.FC = () => {
  const { members, refreshAll } = useData();
  const { success } = useToast();
  const { confirm } = useConfirm();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<MemberStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'code' | 'joiningDate' | 'totalInvested' | 'outstandingLoan'>('joiningDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);

  const filtered = filterMembers(members, {
    searchQuery,
    status: statusFilter,
    sortBy,
    sortOrder,
  });

  const handleArchive = (member: Member) => {
    confirm({
      title: 'Archive Member?',
      message: `Are you sure you want to mark ${member.fullName} (${member.memberCode}) as inactive?`,
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
        'Phone Number': m.mobile,
        'Address': m.address,
        'Aadhaar Number': m.aadharNumber || m.idProofRef || '',
        'Total Invested (₹)': m.totalInvested || 0,
        'Active Loan Due (₹)': m.outstandingLoan || 0,
        'Status': m.status,
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
            Registered members directory ({members.length} members)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<UserPlus className="w-4 h-4" />}
            onClick={() => {
              setMemberToEdit(null);
              setIsAddModalOpen(true);
            }}
          >
            Register Member
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-100 shadow-card flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="w-full sm:max-w-md">
          <SearchInput
            placeholder="Search by name, phone, address, or Aadhaar..."
            value={searchQuery}
            onChange={(val) => setSearchQuery(val)}
          />
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
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
        </div>
      </div>

      {/* Content Area: Mobile Cards vs Desktop Table */}
      {filtered.length === 0 ? (
        <div className="bg-white p-10 text-center rounded-2xl border border-slate-100">
          <p className="text-sm font-semibold text-slate-700">No members match your search or filter.</p>
          <p className="text-xs text-slate-400 mt-1">Try resetting search terms or click &quot;Register Member&quot; to add one.</p>
        </div>
      ) : (
        <>
          {/* Mobile Native Card Feed */}
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
                      <p className="font-mono text-[11px] text-slate-500">{m.memberCode}</p>
                    </div>
                  </div>
                  <Badge variant={getStatusBadgeVariant(m.status)} size="sm">
                    {m.status}
                  </Badge>
                </div>

                {/* Card Contact & Address */}
                <div className="space-y-1.5 text-xs bg-slate-50 p-2.5 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-semibold">{m.mobile}</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="truncate">{m.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <CreditCard className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="font-mono font-medium">Aadhaar: {m.aadharNumber || m.idProofRef || '—'}</span>
                  </div>
                </div>

                {/* Card Bottom Actions */}
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
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
                    Details <ChevronRight className="w-3 h-3" />
                  </button>
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
                    <th className="py-3.5 px-6">Member Name</th>
                    <th className="py-3.5 px-4">Phone Number</th>
                    <th className="py-3.5 px-4">Address</th>
                    <th className="py-3.5 px-4">Aadhaar Number</th>
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
                        <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{m.mobile}</span>
                        </p>
                      </td>

                      <td className="py-4 px-4 max-w-xs">
                        <p className="text-slate-700 truncate" title={m.address}>
                          {m.address}
                        </p>
                      </td>

                      <td className="py-4 px-4 font-mono font-medium text-slate-800">
                        {m.aadharNumber || m.idProofRef || '—'}
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
                            title="View Profile"
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

      {/* Member Form Modal (Add / Edit) */}
      {(isAddModalOpen || memberToEdit) && (
        <MemberFormModal
          isOpen={Boolean(isAddModalOpen || memberToEdit)}
          onClose={() => {
            setIsAddModalOpen(false);
            setMemberToEdit(null);
          }}
          memberToEdit={memberToEdit}
        />
      )}
    </div>
  );
};
