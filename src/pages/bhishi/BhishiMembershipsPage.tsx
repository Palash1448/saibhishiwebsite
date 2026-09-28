import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { Button } from '../../components/common/Button';
import { SearchInput } from '../../components/common/SearchInput';
import { Badge, getStatusBadgeVariant } from '../../components/common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportToCSV } from '../../utils/exportUtils';
import { Users, Layers, Download, Plus, ArrowRight } from 'lucide-react';

export const BhishiMembershipsPage: React.FC = () => {
  const { members, plans } = useData();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('all');

  let list = members.filter((m) => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(search.toLowerCase()) ||
      m.memberCode.toLowerCase().includes(search.toLowerCase()) ||
      m.mobile.includes(search);
    const matchesPlan = selectedPlanId === 'all' || m.bhishiPlanId === selectedPlanId;
    return matchesSearch && matchesPlan;
  });

  const handleExportCSV = () => {
    exportToCSV(
      'Bhishi_Memberships',
      list.map((m) => ({
        'Member ID': m.memberCode,
        'Member Name': m.fullName,
        'Plan Name': m.bhishiPlanName || 'Standard Plan',
        'Monthly Contribution (₹)': m.monthlyContribution,
        'Total Deposited (₹)': m.totalInvested,
        'Returns Earned (₹)': m.totalReturns,
        'Due Day': `${m.paymentDueDay}th of month`,
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
            Bhishi Scheme Enrollments & Memberships
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track active members enrolled in recurring Bhishi plans, installment schedules and payouts
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
            onClick={() => navigate('/members')}
          >
            + Enroll Member
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
          <option value="all">All Plans ({members.length})</option>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.planName}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-6">Member</th>
                <th className="py-3.5 px-4">Enrolled Plan</th>
                <th className="py-3.5 px-4 text-right">Monthly Installment</th>
                <th className="py-3.5 px-4 text-right">Total Invested</th>
                <th className="py-3.5 px-4 text-right">Interest Returns</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((m) => (
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
                    <p className="font-semibold text-slate-900">{m.bhishiPlanName || 'General Savings'}</p>
                    <p className="text-[11px] text-slate-500">Due day: {m.paymentDueDay}th of month</p>
                  </td>

                  <td className="py-4 px-4 text-right font-mono font-bold text-slate-900">
                    {formatCurrency(m.monthlyContribution)}
                  </td>

                  <td className="py-4 px-4 text-right font-mono font-bold text-emerald-700">
                    {formatCurrency(m.totalInvested)}
                  </td>

                  <td className="py-4 px-4 text-right font-mono font-semibold text-purple-700">
                    +{formatCurrency(m.totalReturns)}
                  </td>

                  <td className="py-4 px-4 text-center">
                    <Badge variant={getStatusBadgeVariant(m.status)} size="sm">
                      {m.status}
                    </Badge>
                  </td>

                  <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/members/${m.id}`)}>
                      View Statement
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
