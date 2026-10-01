import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { Button } from '../../components/common/Button';
import { SearchInput } from '../../components/common/SearchInput';
import { Badge } from '../../components/common/Badge';
import { RecordRepaymentModal } from '../../components/loans/RecordRepaymentModal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportToCSV } from '../../utils/exportUtils';
import { Receipt, Download, Plus, CheckCircle2, ArrowRight } from 'lucide-react';

export const LoanRepaymentsPage: React.FC = () => {
  const { transactions } = useData();
  const { onShowReceipt } = useOutletContext<{ onShowReceipt: (data: any) => void }>();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter transactions of type 'Loan Repayment' and 'Loan Interest Payment'
  const repayments = transactions.filter(
    (t) =>
      (t.type === 'Loan Repayment' || t.type === 'Loan Interest Payment') &&
      (t.transactionNumber.toLowerCase().includes(search.toLowerCase()) ||
        (t.memberName && t.memberName.toLowerCase().includes(search.toLowerCase())) ||
        (t.receiptNumber && t.receiptNumber.toLowerCase().includes(search.toLowerCase())))
  );

  const handleExportCSV = () => {
    exportToCSV(
      'Loan_Repayments_Ledger',
      repayments.map((r) => ({
        'Receipt No': r.receiptNumber || '—',
        'Txn #': r.transactionNumber,
        'Member Name': r.memberName,
        'Date': r.date,
        'Amount Paid (₹)': r.amount,
        'Payment Mode': r.paymentMethod,
        'Reference No': r.referenceNumber || '—',
        'Description': r.description,
      }))
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-card">
        <div>
          <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight font-display">
            Loan Repayment Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Complete history of EMI collections, principal recovery, and interest inflows
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
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none justify-center"
          >
            + Record Repayment
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:max-w-md">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search repayment by member, receipt or UTR..."
          />
        </div>
        <span className="text-xs text-slate-500 font-medium self-start sm:self-center">
          Total Repayments: <strong className="text-slate-800">{repayments.length}</strong>
        </span>
      </div>

      {/* Content: Mobile Native Cards vs Desktop Table */}
      {repayments.length === 0 ? (
        <div className="bg-white p-10 text-center rounded-2xl border border-slate-100">
          <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No repayment records found.</p>
          <p className="text-xs text-slate-400 mt-1">Record a loan repayment to create a ledger entry.</p>
        </div>
      ) : (
        <>
          {/* Mobile Native Repayment Card Feed */}
          <div className="space-y-3 sm:hidden">
            {repayments.map((r) => (
              <div
                key={r.id}
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-sm truncate">{r.memberName || 'General'}</h3>
                      <p className="font-mono text-[11px] text-slate-500">#{r.transactionNumber} {r.memberCode ? `• ${r.memberCode}` : ''}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-extrabold font-mono text-emerald-700">+{formatCurrency(r.amount)}</p>
                    <span className="text-[10px] text-slate-400 block">{formatDate(r.date)}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span className="text-slate-400">Payment Mode:</span>
                    <span className="font-semibold text-slate-800">{r.paymentMethod}</span>
                  </div>
                  {r.receiptNumber && (
                    <div className="flex justify-between text-slate-600">
                      <span className="text-slate-400">Receipt No:</span>
                      <span className="font-mono font-bold text-emerald-800">{r.receiptNumber}</span>
                    </div>
                  )}
                  {r.referenceNumber && (
                    <div className="flex justify-between text-slate-600">
                      <span className="text-slate-400">UTR / Ref:</span>
                      <span className="font-mono text-slate-700">{r.referenceNumber}</span>
                    </div>
                  )}
                  {r.description && (
                    <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 leading-relaxed">
                      {r.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Repayments Table */}
          <div className="hidden sm:block bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-6">Txn & Receipt #</th>
                    <th className="py-3.5 px-4">Borrower Member</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Mode & Ref</th>
                    <th className="py-3.5 px-4">Particulars</th>
                    <th className="py-3.5 px-6 text-right">Repaid Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {repayments.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-mono font-bold text-slate-900">#{r.transactionNumber}</p>
                        {r.receiptNumber && (
                          <p className="font-mono text-[11px] text-emerald-700 font-semibold">{r.receiptNumber}</p>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-900">{r.memberName || 'General'}</p>
                        <p className="font-mono text-[11px] text-slate-500">{r.memberCode || ''}</p>
                      </td>

                      <td className="py-4 px-4 text-slate-600">{formatDate(r.date)}</td>

                      <td className="py-4 px-4">
                        <span className="font-semibold text-slate-800">{r.paymentMethod}</span>
                        {r.referenceNumber && (
                          <span className="block text-[10px] text-slate-400 font-mono">{r.referenceNumber}</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-slate-700 max-w-xs truncate">{r.description}</td>

                      <td className="py-4 px-6 text-right font-mono font-bold text-emerald-700 text-sm">
                        +{formatCurrency(r.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Record Repayment Modal */}
      {isModalOpen && (
        <RecordRepaymentModal
          isOpen={true}
          onClose={() => setIsModalOpen(false)}
          onSuccessReceipt={onShowReceipt}
        />
      )}
    </div>
  );
};

