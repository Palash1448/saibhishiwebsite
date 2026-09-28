import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmationContext';
import type { Transaction, TransactionType, TransactionCategory } from '../types/transaction';
import type { PaymentMethod } from '../types/collection';
import { filterTransactions, reverseTransaction } from '../services/transactionService';
import { Button } from '../components/common/Button';
import { SearchInput } from '../components/common/SearchInput';
import { Badge, getStatusBadgeVariant } from '../components/common/Badge';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';
import { exportToCSV } from '../utils/exportUtils';
import { TRANSACTION_TYPES, PAYMENT_METHODS } from '../constants/categories';
import {
  Receipt,
  Download,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  Calendar,
  Layers,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const { transactions, refreshAll } = useData();
  const { success } = useToast();
  const { confirm } = useConfirm();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<TransactionCategory | 'all'>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<PaymentMethod | 'all'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filtered = filterTransactions(transactions, {
    searchQuery: search,
    type: typeFilter,
    category: categoryFilter,
    paymentMethod: paymentMethodFilter,
    startDate,
    endDate,
  });

  const handleReverse = (txn: Transaction) => {
    confirm({
      title: `Reverse Transaction #${txn.transactionNumber}?`,
      message: `This will create an offsetting reversal entry of ₹${txn.amount.toLocaleString('en-IN')} and mark the original transaction as reversed in the audit trail. Are you sure?`,
      confirmText: 'Yes, Reverse Entry',
      variant: 'danger',
      onConfirm: async () => {
        await reverseTransaction(txn.id, 'Administrative Correction / Void Request');
        await refreshAll();
        success('Transaction Reversed', `Offsetting entry created for #${txn.transactionNumber}`);
      },
    });
  };

  const handleExportCSV = () => {
    exportToCSV(
      'Transactions_Master_Ledger',
      filtered.map((t) => ({
        'Txn #': t.transactionNumber,
        'Date': t.date,
        'Time': t.time || '',
        'Type': t.type,
        'Flow': t.category,
        'Member Name': t.memberName || 'General',
        'Member ID': t.memberCode || '',
        'Amount (₹)': t.amount,
        'Payment Mode': t.paymentMethod,
        'Reference No': t.referenceNumber || '',
        'Receipt No': t.receiptNumber || '',
        'Description': t.description,
        'Reversed': t.isReversed ? 'YES' : 'NO',
        'Created By': t.createdBy,
      }))
    );
  };

  // Compute total Inflows & Outflows for filtered results
  let totalInflows = 0;
  let totalOutflows = 0;
  filtered.filter((t) => !t.isReversed).forEach((t) => {
    if (t.category === 'inflow') totalInflows += t.amount;
    if (t.category === 'outflow') totalOutflows += t.amount;
  });

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-card">
        <div>
          <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight font-display">
            Transactions Master Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Immutable audit record of all cash inflows and outflows ({transactions.length} entries)
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<Download className="w-4 h-4" />}
          onClick={handleExportCSV}
          className="justify-center"
        >
          Export Ledger
        </Button>
      </div>

      {/* Inflow vs Outflow Mini Stats */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        <div className="bg-emerald-950 text-emerald-100 p-3 sm:p-4 rounded-2xl border border-emerald-900 shadow-xs">
          <p className="text-[10px] sm:text-xs uppercase font-semibold text-emerald-300">Inflow (+)</p>
          <p className="text-base sm:text-2xl font-bold font-mono text-white mt-0.5">{formatCurrency(totalInflows)}</p>
        </div>

        <div className="bg-rose-950 text-rose-100 p-3 sm:p-4 rounded-2xl border border-rose-900 shadow-xs">
          <p className="text-[10px] sm:text-xs uppercase font-semibold text-rose-300">Outflow (-)</p>
          <p className="text-base sm:text-2xl font-bold font-mono text-white mt-0.5">{formatCurrency(totalOutflows)}</p>
        </div>

        <div className="bg-slate-900 text-white p-3 sm:p-4 rounded-2xl border border-slate-800 shadow-xs">
          <p className="text-[10px] sm:text-xs uppercase font-semibold text-slate-400">Net Flow</p>
          <p className="text-base sm:text-2xl font-bold font-mono text-white mt-0.5">{formatCurrency(totalInflows - totalOutflows)}</p>
        </div>
      </div>

      {/* Search & Native Horizontal Filter Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-100 shadow-xs space-y-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search txn #, member, receipt or UTR..."
        />

        {/* Native Horizontal Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              categoryFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Flows ({filtered.length})
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('inflow')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              categoryFilter === 'inflow'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Inflows (+)
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('outflow')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              categoryFilter === 'outflow'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Outflows (-)
          </button>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="bg-slate-100 border-none rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none shrink-0"
          >
            <option value="all">All Types</option>
            {TRANSACTION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Feed */}
      {filtered.length === 0 ? (
        <div className="bg-white p-10 text-center rounded-2xl border border-slate-100">
          <p className="text-sm font-semibold text-slate-700">No transactions match the selected filters.</p>
        </div>
      ) : (
        <>
          {/* Mobile Native Transaction Cards */}
          <div className="space-y-2.5 sm:hidden">
            {filtered.map((t) => {
              const isInflow = t.category === 'inflow';
              return (
                <div
                  key={t.id}
                  className={`bg-white p-3.5 rounded-2xl border border-slate-100 shadow-card flex items-center justify-between gap-3 ${
                    t.isReversed ? 'bg-rose-50/40 opacity-60' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        isInflow
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {isInflow ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-xs truncate">
                        {t.memberName || t.description}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                        #{t.transactionNumber} • {formatDate(t.date)} {t.time || ''}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          {t.paymentMethod}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">{t.type}</span>
                        {t.isReversed && (
                          <span className="text-[9px] font-bold text-rose-700 bg-rose-100 px-1 py-0.5 rounded">
                            REVERSED
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={`font-mono font-extrabold text-sm ${
                        isInflow ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isInflow ? '+' : '-'}
                      {formatCurrency(t.amount)}
                    </p>
                    {t.receiptNumber && (
                      <p className="font-mono text-[10px] text-emerald-800 font-semibold mt-0.5">
                        {t.receiptNumber}
                      </p>
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
                    <th className="py-3.5 px-6">Txn ID / Date</th>
                    <th className="py-3.5 px-4">Particulars / Member</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Payment Method</th>
                    <th className="py-3.5 px-4">Receipt / Ref #</th>
                    <th className="py-3.5 px-4 text-right">Amount (₹)</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((t) => {
                    const isInflow = t.category === 'inflow';
                    return (
                      <tr
                        key={t.id}
                        className={`hover:bg-slate-50/60 transition-colors ${
                          t.isReversed ? 'bg-rose-50/30 opacity-60' : ''
                        }`}
                      >
                        <td className="py-4 px-6">
                          <p className="font-mono font-bold text-slate-900">#{t.transactionNumber}</p>
                          <p className="text-[11px] text-slate-500">
                            {formatDate(t.date)} {t.time ? `• ${t.time}` : ''}
                          </p>
                        </td>

                        <td className="py-4 px-4">
                          {t.memberName ? (
                            <div>
                              <p className="font-bold text-slate-900">{t.memberName}</p>
                              <p className="font-mono text-[11px] text-slate-500">{t.memberCode}</p>
                            </div>
                          ) : (
                            <p className="font-medium text-slate-800 max-w-xs truncate">{t.description}</p>
                          )}
                          {t.isReversed && (
                            <span className="inline-block mt-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                              REVERSED
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4">
                          <Badge variant={getStatusBadgeVariant(t.type)} size="sm">
                            {t.type}
                          </Badge>
                        </td>

                        <td className="py-4 px-4 font-medium text-slate-800">
                          {t.paymentMethod}
                        </td>

                        <td className="py-4 px-4 font-mono">
                          {t.receiptNumber ? (
                            <span className="text-emerald-800 font-semibold">{t.receiptNumber}</span>
                          ) : t.referenceNumber ? (
                            <span className="text-slate-500 text-[11px]">{t.referenceNumber}</span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        <td className="py-4 px-4 text-right font-mono font-bold text-sm">
                          <span
                            className={`inline-flex items-center gap-1 ${
                              isInflow ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {isInflow ? '+' : '-'}
                            {formatCurrency(t.amount)}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right">
                          {!t.isReversed && t.type !== 'Reversal' && (
                            <button
                              onClick={() => handleReverse(t)}
                              title="Reverse transaction"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
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
    </div>
  );
};
