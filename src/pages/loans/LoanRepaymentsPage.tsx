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

  // Filter transactions of type 'Loan Repayment'
  const repayments = transactions.filter(
    (t) =>
      t.type === 'Loan Repayment' &&
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-card">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight font-display">
            Loan Repayment Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete history of EMI collections, principal recovery, and interest inflows
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
            onClick={() => setIsModalOpen(true)}
          >
            + Record Loan Repayment
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:max-w-md">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search repayment by member, receipt or UTR..."
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Total Repayment Transactions: <strong>{repayments.length}</strong>
        </span>
      </div>

      {/* Repayments Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        {repayments.length === 0 ? (
          <p className="p-12 text-center text-slate-400 text-xs">No repayment records found.</p>
        ) : (
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
        )}
      </div>

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
