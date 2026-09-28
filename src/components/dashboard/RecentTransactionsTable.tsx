import React from 'react';
import type { Transaction } from '../../types/transaction';
import { Badge, getStatusBadgeVariant } from '../common/Badge';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import { ArrowUpRight, ArrowDownLeft, Receipt, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RecentTransactionsTableProps {
  transactions: Transaction[];
  onViewReceipt?: (txn: Transaction) => void;
}

export const RecentTransactionsTable: React.FC<RecentTransactionsTableProps> = ({
  transactions,
  onViewReceipt,
}) => {
  const recent = transactions.slice(0, 7);

  return (
    <div className="rounded-2xl bg-white p-4 sm:p-6 border border-slate-100 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Recent Transactions</h3>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Real-time ledger entries</p>
        </div>
        <Link
          to="/transactions"
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {recent.length === 0 ? (
        <p className="text-xs text-slate-400 py-8 text-center">No transactions recorded yet.</p>
      ) : (
        <>
          {/* Mobile Native Card View */}
          <div className="space-y-2.5 sm:hidden">
            {recent.map((t) => {
              const isInflow = t.category === 'inflow';
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 gap-2.5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isInflow
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {isInflow ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-xs truncate">
                        {t.memberName || t.description}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {formatDate(t.date)} • {t.paymentMethod}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={`font-mono font-extrabold text-xs ${
                        isInflow ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isInflow ? '+' : '-'}
                      {formatCurrency(t.amount)}
                    </p>
                    <span className="text-[9px] text-slate-400 block">{t.type}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto -mx-5 md:-mx-6">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-y border-slate-100">
                <tr>
                  <th className="py-3 px-5 md:px-6">Txn ID / Date</th>
                  <th className="py-3 px-4">Member / Particulars</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-5 md:px-6 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recent.map((t) => {
                  const isInflow = t.category === 'inflow';
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-5 md:px-6">
                        <div className="font-mono font-semibold text-slate-900">
                          #{t.transactionNumber}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {formatDate(t.date)} {t.time ? `• ${t.time}` : ''}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {t.memberName ? (
                          <div>
                            <p className="font-semibold text-slate-900">{t.memberName}</p>
                            <p className="text-[11px] text-slate-500">{t.memberCode || ''}</p>
                          </div>
                        ) : (
                          <p className="font-medium text-slate-700 truncate max-w-xs">{t.description}</p>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge variant={getStatusBadgeVariant(t.type)} size="sm">
                          {t.type}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-slate-600 font-medium">{t.paymentMethod}</span>
                      </td>

                      <td className="py-3.5 px-5 md:px-6 text-right font-mono font-bold text-sm">
                        <span
                          className={`inline-flex items-center gap-1 ${
                            isInflow ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {isInflow ? (
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          )}
                          {formatCurrency(t.amount)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
