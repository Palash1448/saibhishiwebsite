import React, { useState } from 'react';
import {
  Menu,
  Search,
  Plus,
  RefreshCw,
  Database,
  Cloud,
  ChevronDown,
  UserPlus,
  CircleDollarSign,
  CreditCard,
  TrendingDown,
  Receipt,
  RotateCcw,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../common/Button';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenGlobalSearch: () => void;
  onOpenQuickAction: (actionType: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onOpenGlobalSearch,
  onOpenQuickAction,
}) => {
  const { user, isDemoMode } = useAuth();
  const { refreshAll, loading, resetToSampleData } = useData();
  const { success } = useToast();
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  const handleRefresh = async () => {
    await refreshAll();
    success('Data refreshed', 'All financial balances are up to date.');
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-3.5 sm:px-6 backdrop-blur-xl pt-safe">
      {/* Mobile Branding Bar (Visible only on mobile) */}
      <div className="flex items-center gap-2.5 lg:hidden min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="p-2 text-slate-700 hover:text-slate-950 rounded-xl hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-extrabold text-sm shadow-xs shrink-0">
            ₹
          </div>
          <div className="min-w-0">
            <h1 className="font-extrabold text-sm tracking-tight text-slate-900 truncate flex items-center gap-1.5">
              SaiBhishi
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            </h1>
            <p className="text-[10px] text-slate-500 font-medium truncate">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Desktop Search Bar (Hidden on Mobile) */}
      <div className="hidden lg:flex items-center gap-3 flex-1 min-w-0">
        <button
          type="button"
          onClick={onOpenGlobalSearch}
          className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-400 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/80 max-w-md w-full transition-colors cursor-pointer group"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          <span className="truncate text-xs text-slate-500">Quick search (Member, Loan ID, Receipt #, UTR)...</span>
          <kbd className="inline-block ml-auto text-[10px] font-semibold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right side: Search Icon for Mobile, Mode Badge, Refresh, Quick Actions */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Mobile Search Button */}
        <button
          type="button"
          onClick={onOpenGlobalSearch}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
          title="Search"
          aria-label="Global search"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Environment / Mode Badge (Desktop) */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border bg-slate-50 text-slate-600 border-slate-200">
          {isDemoMode ? (
            <>
              <Database className="w-3.5 h-3.5 text-amber-500" />
              <span>Sandbox Mode</span>
            </>
          ) : (
            <>
              <Cloud className="w-3.5 h-3.5 text-emerald-500" />
              <span>Firebase Live</span>
            </>
          )}
        </div>

        {/* Refresh button */}
        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          title="Refresh Financial Data"
          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl active:scale-95 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
        </button>

        {/* Desktop Quick Action Dropdown */}
        <div className="relative hidden sm:block">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            rightIcon={<ChevronDown className="w-3.5 h-3.5 ml-0.5" />}
            onClick={() => setShowQuickMenu(!showQuickMenu)}
          >
            Quick Action
          </Button>

          {showQuickMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowQuickMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-elevated border border-slate-100 py-2 z-50 animate-scale-in text-sm font-medium">
                <button
                  onClick={() => {
                    setShowQuickMenu(false);
                    onOpenQuickAction('add-member');
                  }}
                  className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 hover:text-emerald-700 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-emerald-600" />
                  <span>+ Add New Member</span>
                </button>

                <button
                  onClick={() => {
                    setShowQuickMenu(false);
                    onOpenQuickAction('record-collection');
                  }}
                  className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 hover:text-emerald-700 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <CircleDollarSign className="w-4 h-4 text-emerald-600" />
                  <span>+ Record Collection</span>
                </button>

                <button
                  onClick={() => {
                    setShowQuickMenu(false);
                    onOpenQuickAction('issue-loan');
                  }}
                  className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 hover:text-emerald-700 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <span>+ Issue Loan</span>
                </button>

                <button
                  onClick={() => {
                    setShowQuickMenu(false);
                    onOpenQuickAction('record-repayment');
                  }}
                  className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 hover:text-emerald-700 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  <span>+ Record Loan Repayment</span>
                </button>

                <button
                  onClick={() => {
                    setShowQuickMenu(false);
                    onOpenQuickAction('add-expense');
                  }}
                  className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 hover:text-rose-700 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <TrendingDown className="w-4 h-4 text-rose-600" />
                  <span>+ Add Expense</span>
                </button>

                <div className="border-t border-slate-100 my-1"></div>

                <button
                  onClick={() => {
                    setShowQuickMenu(false);
                    resetToSampleData();
                    success('Demo data reloaded', 'Sample members and transactions populated.');
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-500 hover:bg-amber-50 hover:text-amber-800 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                  <span>Reset Sample Demo Data</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
