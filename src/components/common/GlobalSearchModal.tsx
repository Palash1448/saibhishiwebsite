import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, CreditCard, Receipt, ArrowRight, X, ArrowUpRight } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const { members, loans, transactions, collections } = useData();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle search
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchingMembers = q
    ? members.filter(
        (m) =>
          m.fullName.toLowerCase().includes(q) ||
          m.memberCode.toLowerCase().includes(q) ||
          m.mobile.includes(q) ||
          (m.villageCity && m.villageCity.toLowerCase().includes(q))
      ).slice(0, 4)
    : [];

  const matchingLoans = q
    ? loans.filter(
        (l) =>
          l.loanNumber.toLowerCase().includes(q) ||
          l.memberName.toLowerCase().includes(q) ||
          l.memberCode.toLowerCase().includes(q)
      ).slice(0, 4)
    : [];

  const matchingTxns = q
    ? transactions.filter(
        (t) =>
          t.transactionNumber.toLowerCase().includes(q) ||
          (t.receiptNumber && t.receiptNumber.toLowerCase().includes(q)) ||
          (t.memberName && t.memberName.toLowerCase().includes(q)) ||
          (t.referenceNumber && t.referenceNumber.toLowerCase().includes(q))
      ).slice(0, 4)
    : [];

  const handleSelectMember = (id: string) => {
    navigate(`/members/${id}`);
    onClose();
  };

  const handleSelectLoan = (id: string) => {
    navigate(`/loans`);
    onClose();
  };

  const handleSelectTxn = () => {
    navigate(`/transactions`);
    onClose();
  };

  const hasResults = matchingMembers.length > 0 || matchingLoans.length > 0 || matchingTxns.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-elevated border border-slate-100 overflow-hidden animate-scale-in flex flex-col">
        {/* Search Bar Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 bg-slate-50/70">
          <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search member, phone, loan number, receipt or UTR..."
            autoFocus
            className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 text-base focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/60 mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold text-slate-500 bg-slate-200/80 rounded border border-slate-300">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
          {!q ? (
            <div className="py-8 text-center text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40 text-emerald-600" />
              <p className="text-sm font-medium text-slate-600">Global Financial Search</p>
              <p className="text-xs text-slate-400 mt-1">
                Type Member Name, ID (e.g. SB-1001), Phone, Loan #, or Receipt Number
              </p>
            </div>
          ) : !hasResults ? (
            <div className="py-8 text-center text-slate-500">
              <p className="text-sm font-medium">No financial records found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-400 mt-1">Try checking for typos or searching by mobile number</p>
            </div>
          ) : (
            <>
              {/* Matching Members */}
              {matchingMembers.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">
                    Members ({matchingMembers.length})
                  </h4>
                  <div className="space-y-1">
                    {matchingMembers.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => handleSelectMember(m.id)}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-emerald-50/70 transition-colors cursor-pointer border border-transparent hover:border-emerald-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                            {m.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{m.fullName}</p>
                            <p className="text-xs text-slate-500">
                              {m.memberCode} • 📱 {m.mobile} • {m.villageCity}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold text-emerald-700">
                            Inv: {formatCurrency(m.totalInvested)}
                          </p>
                          <ArrowRight className="w-4 h-4 text-slate-400 inline-block ml-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matching Loans */}
              {matchingLoans.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">
                    Loans ({matchingLoans.length})
                  </h4>
                  <div className="space-y-1">
                    {matchingLoans.map((l) => (
                      <div
                        key={l.id}
                        onClick={() => handleSelectLoan(l.id)}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-slate-100"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {l.loanNumber} — {l.memberName}
                            </p>
                            <p className="text-xs text-slate-500">
                              Principal: {formatCurrency(l.principalAmount)} • {l.monthlyInterestRate}%/mo
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-amber-700">
                          Due: {formatCurrency(l.outstandingTotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matching Transactions & Receipts */}
              {matchingTxns.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">
                    Transactions & Receipts ({matchingTxns.length})
                  </h4>
                  <div className="space-y-1">
                    {matchingTxns.map((t) => (
                      <div
                        key={t.id}
                        onClick={handleSelectTxn}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-slate-100"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                            <Receipt className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              #{t.transactionNumber} {t.receiptNumber ? `(${t.receiptNumber})` : ''}
                            </p>
                            <p className="text-xs text-slate-500">
                              {t.type} • {t.memberName || 'General'} • {formatDate(t.date)}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-xs font-bold ${
                            t.category === 'inflow' ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {t.category === 'inflow' ? '+' : '-'}
                          {formatCurrency(t.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Tip: Search by Member ID or Mobile Number</span>
          <button onClick={onClose} className="hover:text-slate-700">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
