import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { Button } from '../../components/common/Button';
import { SearchInput } from '../../components/common/SearchInput';
import { Badge, getStatusBadgeVariant } from '../../components/common/Badge';
import { EnrollInvestmentModal } from '../../components/bhishi/EnrollInvestmentModal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportToCSV } from '../../utils/exportUtils';
import type { Member } from '../../types/member';
import { Users, Layers, Download, Plus, ArrowRight, Edit2, TrendingUp, Percent, Coins } from 'lucide-react';

export const BhishiMembershipsPage: React.FC = () => {
  const { members, plans, financeSettings } = useData();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('all');
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedMemberForEnroll, setSelectedMemberForEnroll] = useState<Member | null>(null);

  let list = members.filter((m) => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(search.toLowerCase()) ||
      m.memberCode.toLowerCase().includes(search.toLowerCase()) ||
      m.mobile.includes(search);
    const matchesPlan = selectedPlanId === 'all' || m.bhishiPlanId === selectedPlanId;
    return matchesSearch && matchesPlan;
  });

  const handleOpenEnroll = (member?: Member) => {
    setSelectedMemberForEnroll(member || null);
    setIsEnrollModalOpen(true);
  };

  const handleExportCSV = () => {
    exportToCSV(
      'Bhishi_Memberships',
      list.map((m) => ({
        'Member ID': m.memberCode,
        'Member Name': m.fullName,
        'Plan Name': m.bhishiPlanName || 'Standard Plan',
        'Monthly Investment (₹)': m.monthlyContribution || 0,
        'Yearly Return Rate (% p.a.)': m.annualReturnRate || financeSettings.defaultAnnualReturnRate || 12,
        'Total Invested (₹)': m.totalInvested || 0,
        'Returns Earned (₹)': m.totalReturns || 0,
        'Due Day': `${m.paymentDueDay || 10}th of month`,
        'Enrolled Date': m.joiningDate,
        'Status': m.status,
      }))
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-card">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight font-display">
            Bhishi Scheme Enrollments & Investments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Members choose their monthly investment amount • Admin assigns custom yearly return rate (% p.a.)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
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
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => handleOpenEnroll()}
          >
            + Configure Investment
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:max-w-md">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search member by name, ID or mobile..."
          />
        </div>

        <select
          value={selectedPlanId}
          onChange={(e) => setSelectedPlanId(e.target.value)}
          className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
        >
          <option value="all">All Plans ({members.length} Members)</option>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.planName}
            </option>
          ))}
        </select>
      </div>

      {/* Content Area: Mobile Cards vs Desktop Table */}
      {list.length === 0 ? (
        <div className="bg-white p-10 text-center rounded-2xl border border-slate-100">
          <p className="text-sm font-semibold text-slate-700">No member schemes found.</p>
          <p className="text-xs text-slate-400 mt-1">Configure an investment scheme to enroll members.</p>
        </div>
      ) : (
        <>
          {/* Mobile Card Feed */}
          <div className="space-y-3 sm:hidden">
            {list.map((m) => {
              const monthlyAmt = m.monthlyContribution || 0;
              const mRate = m.monthlyReturnRate !== undefined ? m.monthlyReturnRate : (m.annualReturnRate ? m.annualReturnRate / 12 : 1);
              const yearlyRate = m.annualReturnRate || Math.round(mRate * 12 * 10) / 10;
              const cutoff = m.interestCutoffDay || m.paymentDueDay || 10;

              return (
                <div
                  key={m.id}
                  onClick={() => navigate(`/members/${m.id}`)}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card space-y-3 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{m.fullName}</h3>
                      <p className="font-mono text-[11px] text-slate-500">{m.memberCode} • 📱 {m.mobile}</p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(m.status)} size="sm">
                      {m.status}
                    </Badge>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl space-y-1 text-xs">
                    <p className="font-semibold text-slate-800 truncate">{m.bhishiPlanName || 'Flexible Savings Plan'}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Cutoff: <strong className="text-amber-800">{cutoff}th of month</strong></span>
                      <span>Return: <strong className="text-purple-700">{mRate}%/mo ({yearlyRate}% p.a.)</strong></span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-emerald-50/50 p-2.5 rounded-xl text-xs border border-emerald-100">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Monthly Deposit</span>
                      <p className="font-mono font-bold text-slate-900">{monthlyAmt > 0 ? formatCurrency(monthlyAmt) : '—'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Invested</span>
                      <p className="font-mono font-bold text-emerald-800">{formatCurrency(m.totalInvested || 0)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEnroll(m)}
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Configure
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/members/${m.id}`)}>
                      Statement
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-6">Member</th>
                    <th className="py-3.5 px-4">Investment Scheme</th>
                    <th className="py-3.5 px-4 text-right">Monthly Investment</th>
                    <th className="py-3.5 px-4 text-right">Monthly Return Rate</th>
                    <th className="py-3.5 px-4 text-center">Cutoff Day</th>
                    <th className="py-3.5 px-4 text-right">Total Invested</th>
                    <th className="py-3.5 px-4 text-right">Total Returns</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {list.map((m) => {
                    const monthlyAmt = m.monthlyContribution || 0;
                    const mRate = m.monthlyReturnRate !== undefined ? m.monthlyReturnRate : (m.annualReturnRate ? m.annualReturnRate / 12 : 1);
                    const yearlyRate = m.annualReturnRate || Math.round(mRate * 12 * 10) / 10;
                    const cutoff = m.interestCutoffDay || m.paymentDueDay || 10;

                    return (
                      <tr
                        key={m.id}
                        className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                        onClick={() => navigate(`/members/${m.id}`)}
                      >
                        <td className="py-4 px-6">
                          <p className="font-bold text-slate-900 text-sm">{m.fullName}</p>
                          <p className="font-mono text-[11px] text-slate-500">
                            {m.memberCode} • 📱 {m.mobile}
                          </p>
                        </td>

                        <td className="py-4 px-4">
                          <p className="font-semibold text-slate-900">{m.bhishiPlanName || 'Flexible Savings Plan'}</p>
                          <p className="text-[11px] text-slate-500">Cutoff: {cutoff}th of month</p>
                        </td>

                        <td className="py-4 px-4 text-right">
                          <span className="font-mono font-bold text-slate-900 text-sm">
                            {monthlyAmt > 0 ? formatCurrency(monthlyAmt) : '—'}
                          </span>
                          <span className="block text-[10px] text-emerald-700 font-semibold">
                            / month (Member Choice)
                          </span>
                        </td>

                        <td className="py-4 px-4 text-right">
                          <span className="inline-flex items-center gap-1 font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full text-xs border border-purple-200">
                            <Percent className="w-3 h-3 text-purple-600" />
                            {mRate}% / mo
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-0.5">({yearlyRate}% p.a.)</span>
                        </td>

                        <td className="py-4 px-4 text-center">
                          <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200 font-mono text-[11px] font-semibold">
                            {cutoff}th
                          </span>
                        </td>

                        <td className="py-4 px-4 text-right font-mono font-bold text-emerald-700">
                          {formatCurrency(m.totalInvested || 0)}
                        </td>

                        <td className="py-4 px-4 text-right font-mono font-semibold text-purple-700">
                          +{formatCurrency(m.totalReturns || 0)}
                        </td>

                        <td className="py-4 px-4 text-center">
                          <Badge variant={getStatusBadgeVariant(m.status)} size="sm">
                            {m.status}
                          </Badge>
                        </td>

                        <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenEnroll(m)}
                              title="Configure Monthly Investment & Return Rate"
                            >
                              <Edit2 className="w-3.5 h-3.5" /> Configure
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => navigate(`/members/${m.id}`)}>
                              Statement
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Enroll / Configure Investment Modal */}
      {isEnrollModalOpen && (
        <EnrollInvestmentModal
          isOpen={true}
          preselectedMember={selectedMemberForEnroll}
          onClose={() => {
            setIsEnrollModalOpen(false);
            setSelectedMemberForEnroll(null);
          }}
        />
      )}
    </div>
  );
};

