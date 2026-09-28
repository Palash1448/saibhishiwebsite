import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Member } from '../../types/member';
import { Button } from '../../components/common/Button';
import { SearchInput } from '../../components/common/SearchInput';
import { Badge, getStatusBadgeVariant } from '../../components/common/Badge';
import { CreditInterestModal } from '../../components/returns/CreditInterestModal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportToCSV } from '../../utils/exportUtils';
import { Percent, Plus, Download, CheckCircle2, History, Calculator, ArrowRight } from 'lucide-react';

export const ReturnsInterestPage: React.FC = () => {
  const { members, interestRecords, financeSettings } = useData();
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'calculator' | 'history'>('calculator');

  const activeMembers = members.filter((m) =>
    m.fullName.toLowerCase().includes(search.toLowerCase()) ||
    m.memberCode.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenCredit = (m: Member) => {
    setSelectedMember(m);
    setIsModalOpen(true);
  };

  const handleExportCSV = () => {
    exportToCSV(
      'Interest_Credit_Ledger',
      interestRecords.map((r) => ({
        'Record ID': r.id,
        'Member ID': r.memberCode,
        'Member Name': r.memberName,
        'Period': r.calculationPeriod,
        'Principal (₹)': r.principalAmount,
        'Rate (% p.a.)': r.annualRate,
        'Interest (₹)': r.calculatedInterest,
        'Adjustment (₹)': r.adjustmentAmount,
        'Final Credited (₹)': r.finalInterestAmount,
        'Credited Date': r.creditedDate,
        'Status': r.status,
      }))
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-card">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight font-display">
            Interest & Yearly Return Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Calculate annual yields, preview interest dividends, approve adjustments, and credit ledger balances
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExportCSV}
          >
            Export History
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Percent className="w-4 h-4" />}
            onClick={() => {
              setSelectedMember(null);
              setIsModalOpen(true);
            }}
          >
            + Credit Return to Member
          </Button>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setViewMode('calculator')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            viewMode === 'calculator'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Active Members Interest Calculation
        </button>

        <button
          onClick={() => setViewMode('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            viewMode === 'history'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Interest Credit History Ledger ({interestRecords.length})
        </button>
      </div>

      {viewMode === 'calculator' ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="max-w-xs w-full">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search member name or ID..."
              />
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Default Scheme Rate: <strong className="text-emerald-700">{financeSettings.defaultAnnualReturnRate}% p.a.</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Member</th>
                  <th className="py-3.5 px-4">Bhishi Plan</th>
                  <th className="py-3.5 px-4 text-right">Invested Principal</th>
                  <th className="py-3.5 px-4 text-right">Annual Rate</th>
                  <th className="py-3.5 px-4 text-right">Estimated 1-Year Return</th>
                  <th className="py-3.5 px-4 text-right">Already Credited</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeMembers.map((m) => {
                  const estInterest = Math.round((m.totalInvested || 0) * ((financeSettings.defaultAnnualReturnRate || 12) / 100));
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900 text-sm">{m.fullName}</p>
                        <p className="font-mono text-[11px] text-slate-500">{m.memberCode}</p>
                      </td>

                      <td className="py-4 px-4 font-medium text-slate-800">
                        {m.bhishiPlanName || 'General Savings'}
                      </td>

                      <td className="py-4 px-4 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(m.totalInvested)}
                      </td>

                      <td className="py-4 px-4 text-right font-mono font-semibold text-purple-700">
                        {financeSettings.defaultAnnualReturnRate || 12}% p.a.
                      </td>

                      <td className="py-4 px-4 text-right font-mono font-bold text-emerald-700">
                        +{formatCurrency(estInterest)}
                      </td>

                      <td className="py-4 px-4 text-right font-mono text-slate-600">
                        {formatCurrency(m.totalReturns)}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenCredit(m)}
                        >
                          Preview & Credit
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
          {interestRecords.length === 0 ? (
            <p className="p-12 text-center text-slate-400 text-xs">No interest credits recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-6">Credit Date</th>
                    <th className="py-3.5 px-4">Member</th>
                    <th className="py-3.5 px-4">Period</th>
                    <th className="py-3.5 px-4 text-right">Principal</th>
                    <th className="py-3.5 px-4 text-right">Rate</th>
                    <th className="py-3.5 px-4 text-right">Adjustment</th>
                    <th className="py-3.5 px-4 text-right">Final Credited (₹)</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {interestRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6 font-mono font-medium text-slate-700">{formatDate(r.creditedDate)}</td>
                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-900">{r.memberName}</p>
                        <p className="font-mono text-[11px] text-slate-500">{r.memberCode}</p>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-800">{r.calculationPeriod}</td>
                      <td className="py-4 px-4 text-right font-mono">{formatCurrency(r.principalAmount)}</td>
                      <td className="py-4 px-4 text-right font-mono font-semibold">{r.annualRate}%</td>
                      <td className="py-4 px-4 text-right font-mono text-amber-700">
                        {r.adjustmentAmount !== 0 ? formatCurrency(r.adjustmentAmount) : '—'}
                      </td>
                      <td className="py-4 px-4 text-right font-mono font-bold text-emerald-700 text-sm">
                        +{formatCurrency(r.finalInterestAmount)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Badge variant="success" size="sm">
                          {r.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Credit Interest Modal */}
      {isModalOpen && (
        <CreditInterestModal
          isOpen={true}
          preselectedMember={selectedMember}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};
