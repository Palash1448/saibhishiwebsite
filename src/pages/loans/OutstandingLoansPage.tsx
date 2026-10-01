import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { Loan } from '../../types/loan';
import { Button } from '../../components/common/Button';
import { SearchInput } from '../../components/common/SearchInput';
import { Badge } from '../../components/common/Badge';
import { RecordRepaymentModal } from '../../components/loans/RecordRepaymentModal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportToCSV } from '../../utils/exportUtils';
import { AlertTriangle, Clock, Download, Phone, Receipt, CreditCard } from 'lucide-react';

export const OutstandingLoansPage: React.FC = () => {
  const { loans } = useData();
  const { onShowReceipt } = useOutletContext<{ onShowReceipt: (data: any) => void }>();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [repaymentLoan, setRepaymentLoan] = useState<Loan | null>(null);

  // Filter loans that have outstanding balances
  const outstandingLoans = loans.filter((l) => {
    const hasBalance = l.outstandingTotal > 0;
    const matchSearch =
      l.loanNumber.toLowerCase().includes(search.toLowerCase()) ||
      l.memberName.toLowerCase().includes(search.toLowerCase()) ||
      l.memberCode.toLowerCase().includes(search.toLowerCase());
    return hasBalance && matchSearch;
  });

  const totalOutstanding = outstandingLoans.reduce((acc, l) => acc + l.outstandingTotal, 0);

  const handleExportCSV = () => {
    exportToCSV(
      'Outstanding_Loans_Report',
      outstandingLoans.map((l) => ({
        'Loan ID': l.loanNumber,
        'Member ID': l.memberCode,
        'Borrower Name': l.memberName,
        'Principal (₹)': l.principalAmount,
        'Monthly EMI (₹)': l.monthlyInstallment,
        'Total Repaid (₹)': l.totalAmountPaid,
        'Outstanding Balance (₹)': l.outstandingTotal,
        'Outstanding Principal (₹)': l.outstandingPrincipal,
        'Outstanding Interest (₹)': l.outstandingInterest,
        'Guarantor': l.guarantorName || '—',
        'Guarantor Mobile': l.guarantorMobile || '—',
        'Issue Date': l.issueDate,
        'Status': l.status,
      }))
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-card">
        <div>
          <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight font-display">
            Outstanding Loans & Defaulters
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor open credit exposures, due interest receivables, and recovery followups
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<Download className="w-4 h-4" />}
          onClick={handleExportCSV}
          className="w-full sm:w-auto justify-center"
        >
          Export Report
        </Button>
      </div>

      {/* Summary Strip */}
      <div className="bg-amber-950 text-amber-100 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-amber-800 shadow-elevated flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-amber-300">Total Outstanding Loan Exposure</p>
          <h2 className="text-2xl sm:text-3xl font-black font-mono text-white mt-1">
            {formatCurrency(totalOutstanding)}
          </h2>
          <p className="text-xs text-amber-300/80 mt-1">
            Across {outstandingLoans.length} active borrower accounts
          </p>
        </div>

        <div className="bg-amber-900/60 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-amber-700/60 text-xs space-y-1">
          <p className="font-semibold text-white">Actionable Follow-up Summary:</p>
          <p className="text-amber-200">Total accounts with due balance: <strong>{outstandingLoans.length}</strong></p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:max-w-md">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search borrower by name, ID or loan #..."
          />
        </div>
        <span className="text-xs text-slate-500 font-medium self-start sm:self-center">
          Open Accounts: <strong className="text-amber-800">{outstandingLoans.length}</strong>
        </span>
      </div>

      {/* Outstanding Content: Mobile Native Cards vs Desktop Table */}
      {outstandingLoans.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-100">
          <AlertTriangle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">All loans are fully recovered and settled! 🎉</p>
          <p className="text-xs text-slate-400 mt-1">No outstanding dues or overdue installments pending.</p>
        </div>
      ) : (
        <>
          {/* Mobile Native Outstanding Loan Card Feed */}
          <div className="space-y-3 sm:hidden">
            {outstandingLoans.map((l) => (
              <div
                key={l.id}
                onClick={() => navigate(`/loans/${l.id}`)}
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card space-y-3 active:scale-[0.99] transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-sm truncate">{l.memberName}</h3>
                      <p className="font-mono text-[11px] text-slate-500">{l.loanNumber} • {l.memberCode}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-amber-800 uppercase font-semibold block">Total Due</span>
                    <p className="text-base font-extrabold font-mono text-amber-900">{formatCurrency(l.outstandingTotal)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Sanctioned</span>
                    <span className="font-bold font-mono text-slate-900">{formatCurrency(l.principalAmount)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Repaid</span>
                    <span className="font-bold font-mono text-emerald-700">{formatCurrency(l.totalAmountPaid)}</span>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => navigate(`/loans/${l.id}`)}
                    className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer text-center"
                  >
                    View Schedule
                  </button>
                  <button
                    onClick={() => setRepaymentLoan(l)}
                    className="flex-1 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer text-center shadow-xs"
                  >
                    Collect EMI
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Outstanding Table */}
          <div className="hidden sm:block bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-6">Borrower</th>
                    <th className="py-3.5 px-4">Loan Account</th>
                    <th className="py-3.5 px-4 text-right">Principal</th>
                    <th className="py-3.5 px-4 text-right">Total Repaid</th>
                    <th className="py-3.5 px-4 text-right">Outstanding Principal</th>
                    <th className="py-3.5 px-4 text-right">Total Due (₹)</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {outstandingLoans.map((l) => (
                    <tr
                      key={l.id}
                      className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                      onClick={() => navigate(`/loans/${l.id}`)}
                    >
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900 text-sm">{l.memberName}</p>
                        <p className="font-mono text-[11px] text-slate-500">{l.memberCode}</p>
                      </td>

                      <td className="py-4 px-4 font-mono font-bold text-slate-800">
                        {l.loanNumber}
                        <span className="block text-[10px] text-slate-400 font-sans font-normal">
                          EMI: {formatCurrency(l.monthlyInstallment)}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right font-mono text-slate-900">
                        {formatCurrency(l.principalAmount)}
                      </td>

                      <td className="py-4 px-4 text-right font-mono font-semibold text-emerald-700">
                        {formatCurrency(l.totalAmountPaid)}
                      </td>

                      <td className="py-4 px-4 text-right font-mono text-slate-700">
                        {formatCurrency(l.outstandingPrincipal)}
                      </td>

                      <td className="py-4 px-4 text-right font-mono font-bold text-amber-700 text-sm">
                        {formatCurrency(l.outstandingTotal)}
                      </td>

                      <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setRepaymentLoan(l)}
                          >
                            Collect EMI
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/loans/${l.id}`)}
                          >
                            Schedule
                          </Button>
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

      {/* Repayment Modal */}
      {repaymentLoan && (
        <RecordRepaymentModal
          isOpen={Boolean(repaymentLoan)}
          preselectedLoan={repaymentLoan}
          onClose={() => setRepaymentLoan(null)}
          onSuccessReceipt={onShowReceipt}
        />
      )}
    </div>
  );
};
