import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import type { Loan, LoanStatus } from '../../types/loan';
import { Button } from '../../components/common/Button';
import { SearchInput } from '../../components/common/SearchInput';
import { Badge, getStatusBadgeVariant } from '../../components/common/Badge';
import { IssueLoanModal } from '../../components/loans/IssueLoanModal';
import { RecordRepaymentModal } from '../../components/loans/RecordRepaymentModal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportToCSV } from '../../utils/exportUtils';
import {
  CreditCard,
  Plus,
  Download,
  Eye,
  Receipt,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
} from 'lucide-react';

export const LoansListPage: React.FC = () => {
  const { loans, stats } = useData();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LoanStatus | 'all'>('all');

  // Modals
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [repayLoan, setRepayLoan] = useState<Loan | null>(null);

  const filtered = loans.filter((l) => {
    const matchSearch =
      l.loanNumber.toLowerCase().includes(search.toLowerCase()) ||
      l.memberName.toLowerCase().includes(search.toLowerCase()) ||
      l.memberCode.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === 'all' || l.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const handleExportCSV = () => {
    exportToCSV(
      'Loans_Master_Ledger',
      filtered.map((l) => ({
        'Loan ID': l.loanNumber,
        'Member Name': l.memberName,
        'Member Code': l.memberCode,
        'Sanctioned Principal (₹)': l.principalAmount,
        'Monthly Rate (%)': l.monthlyInterestRate,
        'Calculation Method': l.calculationMethod,
        'Duration (Months)': l.durationMonths,
        'Monthly EMI (₹)': l.monthlyInstallment,
        'Total Interest (₹)': l.totalInterest,
        'Total Payable (₹)': l.totalPayable,
        'Total Paid (₹)': l.totalAmountPaid,
        'Outstanding Principal (₹)': l.outstandingPrincipal,
        'Outstanding Balance (₹)': l.outstandingTotal,
        'Status': l.status,
        'Issue Date': l.issueDate,
        'First Due Date': l.firstDueDate || '—',
      }))
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-card">
        <div>
          <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight font-display">
            Loan Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Sanction loans, track reducing/flat EMIs, and monitor recovery ({loans.length} loans)
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
            variant="navy"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsIssueModalOpen(true)}
            className="flex-1 sm:flex-none justify-center"
          >
            + Issue Loan
          </Button>
        </div>
      </div>

      {/* 4 Loan KPI Metric Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase">Total Sanctioned</p>
          <p className="text-base sm:text-xl font-bold font-mono text-slate-900 mt-0.5">
            {formatCurrency(stats.totalLoansGiven)}
          </p>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-[10px] sm:text-xs font-semibold text-emerald-800 uppercase">Recovered</p>
          <p className="text-base sm:text-xl font-bold font-mono text-emerald-900 mt-0.5">
            {formatCurrency(stats.totalLoanRecovered)}
          </p>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-[10px] sm:text-xs font-semibold text-amber-800 uppercase">Outstanding</p>
          <p className="text-base sm:text-xl font-bold font-mono text-amber-900 mt-0.5">
            {formatCurrency(stats.outstandingLoanAmount)}
          </p>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-[10px] sm:text-xs font-semibold text-indigo-800 uppercase">Active Accounts</p>
          <p className="text-base sm:text-xl font-extrabold text-indigo-900 mt-0.5">
            {loans.filter((l) => l.status === 'active').length}
          </p>
        </div>
      </div>

      {/* Search and Native Horizontal Filter Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-100 shadow-xs space-y-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search loan # (LN-1001), member name or ID..."
        />

        {/* Native Horizontal Pill Filters */}
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
            All Loans ({loans.length})
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
            Active ({loans.filter((l) => l.status === 'active').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('closed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              statusFilter === 'closed'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Closed / Settled
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('defaulted')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              statusFilter === 'defaulted'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Defaulted
          </button>
        </div>
      </div>

      {/* Content Area: Mobile Native Cards vs Desktop Table */}
      {filtered.length === 0 ? (
        <div className="bg-white p-10 text-center rounded-2xl border border-slate-100">
          <p className="text-sm font-semibold text-slate-700">No loans match your search criteria.</p>
          <p className="text-xs text-slate-400 mt-1">Issue a new loan to create a ledger account.</p>
        </div>
      ) : (
        <>
          {/* Mobile Native Loan Card Feed */}
          <div className="space-y-3 sm:hidden">
            {filtered.map((l) => {
              const percentPaid = Math.min(100, Math.round((l.totalAmountPaid / (l.totalPayable || 1)) * 100));
              const nextInstallment = l.installments?.find((i) => i.status !== 'paid');
              const nextDueDate = nextInstallment ? nextInstallment.dueDate : l.firstDueDate;

              return (
                <div
                  key={l.id}
                  onClick={() => navigate(`/loans/${l.id}`)}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card space-y-3 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 text-sm truncate">{l.memberName}</h3>
                        <p className="font-mono text-[11px] text-slate-500">{l.loanNumber} • {l.memberCode}</p>
                      </div>
                    </div>
                    <Badge variant={getStatusBadgeVariant(l.status)} size="sm">
                      {l.status}
                    </Badge>
                  </div>

                  {/* Loan Amount & Rate details */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Principal</span>
                      <span className="font-extrabold font-mono text-slate-900 text-sm">
                        {formatCurrency(l.principalAmount)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Monthly EMI</span>
                      <span className="font-bold font-mono text-indigo-700 text-sm">
                        {formatCurrency(l.monthlyInstallment)}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar of repayment */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Paid: {formatCurrency(l.totalAmountPaid)}</span>
                      <span className="font-semibold text-slate-700">{percentPaid}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${percentPaid}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                      <span>Due Date: {nextDueDate ? formatDate(nextDueDate) : 'N/A'}</span>
                      <span className="font-bold text-amber-800">Due: {formatCurrency(l.outstandingTotal)}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(`/loans/${l.id}`)}
                      className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer text-center"
                    >
                      View Schedule
                    </button>
                    {l.status === 'active' && (
                      <button
                        onClick={() => setRepayLoan(l)}
                        className="flex-1 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer text-center shadow-xs"
                      >
                        Repay EMI
                      </button>
                    )}
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
                    <th className="py-3.5 px-6">Loan ID & Member</th>
                    <th className="py-3.5 px-4">Sanctioned Principal</th>
                    <th className="py-3.5 px-4">Rate & Tenure</th>
                    <th className="py-3.5 px-4 text-right">Monthly EMI</th>
                    <th className="py-3.5 px-4 text-right">Total Paid</th>
                    <th className="py-3.5 px-4 text-right">Outstanding</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((l) => (
                    <tr
                      key={l.id}
                      onClick={() => navigate(`/loans/${l.id}`)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900 text-sm">{l.memberName}</p>
                        <p className="font-mono text-[11px] text-indigo-700 font-semibold">{l.loanNumber}</p>
                      </td>

                      <td className="py-4 px-4 font-mono font-bold text-slate-900">
                        {formatCurrency(l.principalAmount)}
                      </td>

                      <td className="py-4 px-4">
                        <p className="font-semibold text-slate-800">{l.monthlyInterestRate}% / mo ({l.calculationMethod})</p>
                        <p className="text-[11px] text-slate-500">{l.durationMonths} Months ({l.numberOfInstallments} EMIs)</p>
                      </td>

                      <td className="py-4 px-4 text-right font-mono font-bold text-indigo-700">
                        {formatCurrency(l.monthlyInstallment)}
                      </td>

                      <td className="py-4 px-4 text-right font-mono font-bold text-emerald-700">
                        {formatCurrency(l.totalAmountPaid)}
                      </td>

                      <td className="py-4 px-4 text-right font-mono font-bold text-amber-700">
                        {formatCurrency(l.outstandingTotal)}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <Badge variant={getStatusBadgeVariant(l.status)} size="sm">
                          {l.status}
                        </Badge>
                      </td>

                      <td
                        className="py-4 px-6 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          {l.status === 'active' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => setRepayLoan(l)}
                            >
                              Repay
                            </Button>
                          )}
                          <button
                            onClick={() => navigate(`/loans/${l.id}`)}
                            title="View Loan Details"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
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

      {/* Issue Loan Modal */}
      {isIssueModalOpen && (
        <IssueLoanModal
          isOpen={true}
          onClose={() => setIsIssueModalOpen(false)}
        />
      )}

      {/* Record Repayment Modal */}
      {repayLoan && (
        <RecordRepaymentModal
          isOpen={true}
          onClose={() => setRepayLoan(null)}
          preselectedLoan={repayLoan}
        />
      )}
    </div>
  );
};
