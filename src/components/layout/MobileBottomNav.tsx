import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CircleDollarSign,
  CreditCard,
  Menu,
  Plus,
  X,
  UserPlus,
  Receipt,
  TrendingDown,
  Sparkles,
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenMore: () => void;
  onOpenQuickAction: (actionType: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenMore,
  onOpenQuickAction,
}) => {
  const [actionSheetOpen, setActionSheetOpen] = useState(false);

  const handleActionClick = (type: string) => {
    setActionSheetOpen(false);
    onOpenQuickAction(type);
  };

  return (
    <>
      {/* Native Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 lg:hidden px-3 pt-1.5 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.06)] select-none">
        <div className="flex items-center justify-between max-w-md mx-auto relative">
          {/* Tab 1: Dashboard */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1 transition-all ${
                isActive ? 'text-emerald-600 scale-105' : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-emerald-50 text-emerald-600' : ''}`}>
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
                  Home
                </span>
              </>
            )}
          </NavLink>

          {/* Tab 2: Members */}
          <NavLink
            to="/members"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1 transition-all ${
                isActive ? 'text-emerald-600 scale-105' : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-emerald-50 text-emerald-600' : ''}`}>
                  <Users className="w-5 h-5" />
                </div>
                <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
                  Members
                </span>
              </>
            )}
          </NavLink>

          {/* Center Elevated Floating Action Button (+) */}
          <div className="flex flex-col items-center justify-center flex-1 -mt-6">
            <button
              type="button"
              onClick={() => setActionSheetOpen(true)}
              className="w-13 h-13 rounded-full bg-linear-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-[0_6px_20px_rgba(16,185,129,0.4)] active:scale-95 transition-transform cursor-pointer border-3 border-white ring-2 ring-emerald-500/20"
              aria-label="Quick Action Menu"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
            <span className="text-[9px] font-semibold text-slate-500 mt-1">Action</span>
          </div>

          {/* Tab 4: Collections */}
          <NavLink
            to="/bhishi/collections"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1 transition-all ${
                isActive ? 'text-emerald-600 scale-105' : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-emerald-50 text-emerald-600' : ''}`}>
                  <CircleDollarSign className="w-5 h-5" />
                </div>
                <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
                  Collection
                </span>
              </>
            )}
          </NavLink>

          {/* Tab 5: Menu / Hub */}
          <button
            type="button"
            onClick={onOpenMore}
            className="flex flex-col items-center justify-center flex-1 py-1 text-slate-500 hover:text-slate-800 cursor-pointer active:scale-95 transition-all"
          >
            <div className="p-1 rounded-xl">
              <Menu className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium tracking-tight mt-0.5">Menu</span>
          </button>
        </div>
      </nav>

      {/* Mobile Native Quick Actions Bottom Sheet */}
      {actionSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 backdrop-blur-xs animate-fade-in lg:hidden">
          <div
            className="fixed inset-0"
            onClick={() => setActionSheetOpen(false)}
          />

          <div className="relative z-10 w-full bg-white rounded-t-3xl shadow-2xl p-5 pb-safe animate-slide-up-sheet border-t border-slate-100 max-h-[85vh] overflow-y-auto">
            {/* Sheet Handle */}
            <div className="w-10 h-1.5 bg-slate-300 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Quick Finance Actions</h3>
                  <p className="text-xs text-slate-500">Select an operation to perform</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActionSheetOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 my-2">
              <button
                type="button"
                onClick={() => handleActionClick('record-collection')}
                className="flex flex-col items-start p-3.5 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-100 text-left transition-all active:scale-95 cursor-pointer"
              >
                <div className="p-2.5 rounded-xl bg-emerald-600 text-white mb-2 shadow-xs">
                  <CircleDollarSign className="w-5 h-5" />
                </div>
                <span className="font-bold text-xs text-emerald-950">Record Collection</span>
                <span className="text-[10px] text-emerald-700/80 mt-0.5">Bhishi installment</span>
              </button>

              <button
                type="button"
                onClick={() => handleActionClick('issue-loan')}
                className="flex flex-col items-start p-3.5 rounded-2xl bg-indigo-50/70 hover:bg-indigo-100/70 border border-indigo-100 text-left transition-all active:scale-95 cursor-pointer"
              >
                <div className="p-2.5 rounded-xl bg-indigo-600 text-white mb-2 shadow-xs">
                  <CreditCard className="w-5 h-5" />
                </div>
                <span className="font-bold text-xs text-indigo-950">Issue New Loan</span>
                <span className="text-[10px] text-indigo-700/80 mt-0.5">Disburse with EMI</span>
              </button>

              <button
                type="button"
                onClick={() => handleActionClick('record-repayment')}
                className="flex flex-col items-start p-3.5 rounded-2xl bg-teal-50/70 hover:bg-teal-100/70 border border-teal-100 text-left transition-all active:scale-95 cursor-pointer"
              >
                <div className="p-2.5 rounded-xl bg-teal-600 text-white mb-2 shadow-xs">
                  <Receipt className="w-5 h-5" />
                </div>
                <span className="font-bold text-xs text-teal-950">Loan Repayment</span>
                <span className="text-[10px] text-teal-700/80 mt-0.5">Collect loan EMI</span>
              </button>

              <button
                type="button"
                onClick={() => handleActionClick('add-member')}
                className="flex flex-col items-start p-3.5 rounded-2xl bg-blue-50/70 hover:bg-blue-100/70 border border-blue-100 text-left transition-all active:scale-95 cursor-pointer"
              >
                <div className="p-2.5 rounded-xl bg-blue-600 text-white mb-2 shadow-xs">
                  <UserPlus className="w-5 h-5" />
                </div>
                <span className="font-bold text-xs text-blue-950">Add Member</span>
                <span className="text-[10px] text-blue-700/80 mt-0.5">KYC & enroll scheme</span>
              </button>

              <button
                type="button"
                onClick={() => handleActionClick('add-expense')}
                className="col-span-2 flex items-center gap-3 p-3.5 rounded-2xl bg-rose-50/70 hover:bg-rose-100/70 border border-rose-100 text-left transition-all active:scale-95 cursor-pointer"
              >
                <div className="p-2.5 rounded-xl bg-rose-600 text-white shadow-xs">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-xs text-rose-950 block">Log Office Expense</span>
                  <span className="text-[10px] text-rose-700/80">Rent, salary, travel, office</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
