import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import type { MonthlyCollection, PaymentMethod, CollectionStatus } from '../../types/collection';
import { Button } from '../../components/common/Button';
import { SearchInput } from '../../components/common/SearchInput';
import { Badge, getStatusBadgeVariant } from '../../components/common/Badge';
import { RecordCollectionModal } from '../../components/collections/RecordCollectionModal';
import { formatCurrency, formatDate, formatMonthYear } from '../../utils/formatters';
import { exportToCSV } from '../../utils/exportUtils';
import {
  CircleDollarSign,
  Plus,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  Printer,
  Calendar,
  Layers,
  ChevronRight,
  Share2,
} from 'lucide-react';

export const MonthlyCollectionsPage: React.FC = () => {
  const { collections, plans, members, collectionSummary } = useData();
  const { onShowReceipt } = useOutletContext<{ onShowReceipt: (data: any) => void }>();

  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedPlanId, setSelectedPlanId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<CollectionStatus | 'all'>('all');

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [collectionToPay, setCollectionToPay] = useState<MonthlyCollection | null>(null);

  // Filter collections
  const filtered = collections.filter((c) => {
    const matchSearch =
      c.memberName.toLowerCase().includes(search.toLowerCase()) ||
      c.memberCode.toLowerCase().includes(search.toLowerCase()) ||
      (c.receiptNumber && c.receiptNumber.toLowerCase().includes(search.toLowerCase())) ||
      (c.referenceNumber && c.referenceNumber.toLowerCase().includes(search.toLowerCase()));

    const matchPlan = selectedPlanId === 'all' || c.bhishiPlanId === selectedPlanId;
    const matchStatus = selectedStatus === 'all' || c.status === selectedStatus;
    const matchMonth = !selectedMonth || c.month === Number(selectedMonth);
    const matchYear = !selectedYear || c.year === Number(selectedYear);

    return matchSearch && matchPlan && matchStatus && matchMonth && matchYear;
  });

  const handleOpenCollect = (col: MonthlyCollection) => {
    setCollectionToPay(col);
    setIsRecordModalOpen(true);
  };

  const handleExportCSV = () => {
    exportToCSV(
      `Collections_${selectedYear}_${selectedMonth}`,
      filtered.map((c) => ({
        'Receipt No': c.receiptNumber || '—',
        'Member ID': c.memberCode,
        'Member Name': c.memberName,
        'Month': c.monthYearLabel,
        'Plan': c.bhishiPlanName,
        'Expected (₹)': c.expectedAmount,
        'Paid (₹)': c.paidAmount,
        'Remaining (₹)': c.remainingAmount,
        'Due Date': c.dueDate,
        'Paid Date': c.paymentDate || '—',
        'Payment Mode': c.paymentMethod || '—',
        'Status': c.status,
      }))
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-card">
        <div>
          <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight font-display">
            Monthly Collections
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track deposits, record monthly savings, and print receipts
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
            onClick={() => {
              setCollectionToPay(null);
              setIsRecordModalOpen(true);
            }}
            className="flex-1 sm:flex-none justify-center"
          >
            + Record
          </Button>
        </div>
      </div>

      {/* Monthly Statistics KPI Mini Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase">Expected Pool</p>
          <p className="text-base sm:text-xl font-bold font-mono text-slate-900 mt-0.5">
            {formatCurrency(collectionSummary.expectedTotal)}
          </p>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-[10px] sm:text-xs font-semibold text-emerald-800 uppercase">Total Collected</p>
          <p className="text-base sm:text-xl font-bold font-mono text-emerald-900 mt-0.5">
            {formatCurrency(collectionSummary.collectedTotal)}
          </p>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-[10px] sm:text-xs font-semibold text-amber-800 uppercase">Pending Amount</p>
          <p className="text-base sm:text-xl font-bold font-mono text-amber-900 mt-0.5">
            {formatCurrency(collectionSummary.pendingTotal)}
          </p>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-[10px] sm:text-xs font-semibold text-indigo-800 uppercase">Recovery %</p>
          <p className="text-base sm:text-xl font-bold font-mono text-indigo-900 mt-0.5">
            {collectionSummary.collectionRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Filter and Month-Picker Toolbar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-100 shadow-xs space-y-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search member, receipt #, UTR..."
        />

        {/* Native Horizontal Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setSelectedStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              selectedStatus === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({collections.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus('paid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              selectedStatus === 'paid'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Paid ({collections.filter((c) => c.status === 'paid').length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              selectedStatus === 'pending'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Pending
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus('overdue')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              selectedStatus === 'overdue'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Overdue
          </button>

          {/* Month Selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-slate-100 border-none rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none shrink-0"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {new Date(2026, m - 1).toLocaleString('default', { month: 'short' })}
              </option>
            ))}
          </select>

          {/* Year Selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-slate-100 border-none rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none shrink-0"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content Area: Mobile Native Cards vs Desktop Table */}
      {filtered.length === 0 ? (
        <div className="bg-white p-10 text-center rounded-2xl border border-slate-100">
          <p className="text-sm font-semibold text-slate-700">No collection records found.</p>
          <p className="text-xs text-slate-400 mt-1">Record a new payment to update the ledger.</p>
        </div>
      ) : (
        <>
          {/* Mobile Native Collection Card Feed */}
          <div className="space-y-3 sm:hidden">
            {filtered.map((c) => {
              const isPaid = c.status === 'paid';
              return (
                <div
                  key={c.id}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {c.memberName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 text-sm truncate">{c.memberName}</h3>
                        <p className="font-mono text-[11px] text-slate-500">{c.memberCode} • {c.bhishiPlanName}</p>
                      </div>
                    </div>

                    <Badge variant={getStatusBadgeVariant(c.status)} size="sm">
                      {c.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Due Date</span>
                      <span className="font-semibold text-slate-800">{formatDate(c.dueDate)}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Contribution</span>
                      <span className="font-extrabold font-mono text-base text-slate-900">
                        {formatCurrency(c.expectedAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Payment Details if paid */}
                  {isPaid && (
                    <div className="flex items-center justify-between text-[11px] text-slate-600 px-1">
                      <span>Mode: <b>{c.paymentMethod || 'Cash'}</b></span>
                      <span className="font-mono font-semibold text-emerald-800">
                        Rec: #{c.receiptNumber || 'REC-XXXX'}
                      </span>
                    </div>
                  )}

                  {/* Bottom Action Button */}
                  <div className="pt-1">
                    {isPaid ? (
                      <button
                        onClick={() => {
                          onShowReceipt({
                            receiptNumber: c.receiptNumber || 'REC-2026-0001',
                            date: c.paymentDate || c.dueDate,
                            memberName: c.memberName,
                            memberCode: c.memberCode,
                            amount: c.paidAmount,
                            amountInWords: 'Rupees ' + c.paidAmount.toLocaleString('en-IN') + ' Only',
                            type: 'Monthly Bhishi Contribution',
                            paymentMethod: c.paymentMethod || 'Cash',
                            referenceNumber: c.referenceNumber,
                            businessName: 'SaiBhishi Finance Management',
                          });
                        }}
                        className="w-full py-2.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Receipt className="w-4 h-4" /> View / Print Receipt
                      </button>
                    ) : (
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => handleOpenCollect(c)}
                        className="w-full justify-center text-xs py-2.5 rounded-xl font-bold"
                      >
                        Collect {formatCurrency(c.expectedAmount)}
                      </Button>
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
                    <th className="py-3.5 px-6">Member Details</th>
                    <th className="py-3.5 px-4">Plan & Due Date</th>
                    <th className="py-3.5 px-4 text-right">Expected</th>
                    <th className="py-3.5 px-4 text-right">Paid Amount</th>
                    <th className="py-3.5 px-4">Payment Method</th>
                    <th className="py-3.5 px-4">Receipt #</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900 text-sm">{c.memberName}</p>
                        <p className="font-mono text-[11px] text-slate-500">{c.memberCode}</p>
                      </td>

                      <td className="py-4 px-4">
                        <p className="font-semibold text-slate-800">{c.bhishiPlanName}</p>
                        <p className="text-[11px] text-slate-500">Due: {formatDate(c.dueDate)}</p>
                      </td>

                      <td className="py-4 px-4 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(c.expectedAmount)}
                      </td>

                      <td className="py-4 px-4 text-right font-mono font-bold text-emerald-700">
                        {formatCurrency(c.paidAmount)}
                      </td>

                      <td className="py-4 px-4">
                        <p className="font-medium text-slate-800">{c.paymentMethod || '—'}</p>
                        {c.referenceNumber && (
                          <p className="font-mono text-[10px] text-slate-400 truncate max-w-[120px]">
                            {c.referenceNumber}
                          </p>
                        )}
                      </td>

                      <td className="py-4 px-4 font-mono font-bold text-slate-800 text-xs">
                        {c.receiptNumber || '—'}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <Badge variant={getStatusBadgeVariant(c.status)} size="sm">
                          {c.status}
                        </Badge>
                      </td>

                      <td className="py-4 px-6 text-right">
                        {c.status === 'paid' ? (
                          <button
                            onClick={() => {
                              onShowReceipt({
                                receiptNumber: c.receiptNumber || 'REC-2026-0001',
                                date: c.paymentDate || c.dueDate,
                                memberName: c.memberName,
                                memberCode: c.memberCode,
                                amount: c.paidAmount,
                                amountInWords: 'Rupees ' + c.paidAmount.toLocaleString('en-IN') + ' Only',
                                type: 'Monthly Bhishi Contribution',
                                paymentMethod: c.paymentMethod || 'Cash',
                                referenceNumber: c.referenceNumber,
                                businessName: 'SaiBhishi Finance Management',
                              });
                            }}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            <Receipt className="w-3.5 h-3.5" /> Receipt
                          </button>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleOpenCollect(c)}
                          >
                            Collect
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Record Collection Modal */}
      {isRecordModalOpen && (
        <RecordCollectionModal
          isOpen={true}
          onClose={() => {
            setIsRecordModalOpen(false);
            setCollectionToPay(null);
          }}
          preselectedCollection={collectionToPay}
          onSuccessReceipt={(receipt) => {
            setIsRecordModalOpen(false);
            onShowReceipt(receipt);
          }}
        />
      )}
    </div>
  );
};
