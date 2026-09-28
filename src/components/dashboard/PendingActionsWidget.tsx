import React from 'react';
import { MonthlyCollection } from '../../types/collection';
import { Loan } from '../../types/loan';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { AlertCircle, Clock, AlertTriangle, ArrowRight, CircleDollarSign, CreditCard } from 'lucide-react';
import { Button } from '../common/Button';

interface PendingActionsWidgetProps {
  collections: MonthlyCollection[];
  loans: Loan[];
  onRecordCollection: (col: MonthlyCollection) => void;
  onRecordRepayment: (loan: Loan) => void;
  onViewAllCollections: () => void;
  onViewAllLoans: () => void;
}

export const PendingActionsWidget: React.FC<PendingActionsWidgetProps> = ({
  collections,
  loans,
  onRecordCollection,
  onRecordRepayment,
  onViewAllCollections,
  onViewAllLoans,
}) => {
  const overdueCollections = collections
    .filter((c) => c.status === 'overdue' || (c.status === 'pending' && c.remainingAmount > 0))
    .slice(0, 3);

  const dueLoans = loans
    .filter((l) => l.status === 'active' && l.outstandingTotal > 0)
    .slice(0, 3);

  return (
    <div className="rounded-2xl bg-white p-5 md:p-6 border border-slate-100 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Pending Actions & Follow-ups</h3>
            <p className="text-xs text-slate-500">Uncollected installments, loan dues and pending followups</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Uncollected Monthly Bhishi Payments */}
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <CircleDollarSign className="w-4 h-4 text-amber-600" />
              <span>Pending Bhishi Dues</span>
            </h4>
            <button
              onClick={onViewAllCollections}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {overdueCollections.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">All monthly collections are up to date! 🎉</p>
          ) : (
            <div className="space-y-2.5">
              {overdueCollections.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200/70 shadow-2xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-slate-900 truncate">{c.memberName}</p>
                    <p className="text-[11px] text-slate-500">
                      {c.monthYearLabel} • Due: {formatDate(c.dueDate)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold font-mono text-amber-700">
                      {formatCurrency(c.remainingAmount)}
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onRecordCollection(c)}
                      className="py-1 px-2.5 text-[11px]"
                    >
                      Collect
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Loan Installments Due */}
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              <span>Loan Installments Due</span>
            </h4>
            <button
              onClick={onViewAllLoans}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {dueLoans.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">No active loans due for payment.</p>
          ) : (
            <div className="space-y-2.5">
              {dueLoans.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200/70 shadow-2xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-slate-900 truncate">{l.memberName}</p>
                    <p className="text-[11px] text-slate-500">
                      {l.loanNumber} • EMI: {formatCurrency(l.monthlyInstallment)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold font-mono text-slate-700">
                      Bal: {formatCurrency(l.outstandingTotal)}
                    </span>
                    <Button
                      variant="navy"
                      size="sm"
                      onClick={() => onRecordRepayment(l)}
                      className="py-1 px-2.5 text-[11px]"
                    >
                      Repay
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
