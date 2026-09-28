import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Coins,
  CreditCard,
  Receipt,
  TrendingDown,
  FileBarChart,
  Calculator,
  Settings,
  ShieldCheck,
  ChevronDown,
  LogOut,
  UserPlus,
  Layers,
  CircleDollarSign,
  Percent,
  PlusCircle,
  Clock,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  badge?: string | number;
  badgeVariant?: 'emerald' | 'amber' | 'rose';
  subItems?: { label: string; href: string; icon?: React.ReactNode }[];
}

export const Sidebar: React.FC<{ onCloseMobile?: () => void }> = ({ onCloseMobile }) => {
  const { user, logout, isDemoMode } = useAuth();
  const { businessSettings, stats } = useData();
  const location = useLocation();

  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    Members: location.pathname.startsWith('/members'),
    'Bhishi / Investments': location.pathname.startsWith('/bhishi'),
    Loans: location.pathname.startsWith('/loans'),
  });

  const toggleMenu = (title: string) => {
    setExpandedMenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: 'Members',
      icon: <Users className="w-5 h-5" />,
      badge: stats.totalMembers,
      subItems: [
        { label: 'All Members', href: '/members', icon: <Users className="w-4 h-4" /> },
        { label: 'Add Member', href: '/members/add', icon: <UserPlus className="w-4 h-4" /> },
      ],
    },
    {
      label: 'Bhishi / Investments',
      icon: <Coins className="w-5 h-5" />,
      subItems: [
        { label: 'Bhishi Plans', href: '/bhishi/plans', icon: <Layers className="w-4 h-4" /> },
        { label: 'Memberships', href: '/bhishi/memberships', icon: <Users className="w-4 h-4" /> },
        { label: 'Monthly Collections', href: '/bhishi/collections', icon: <CircleDollarSign className="w-4 h-4" /> },
        { label: 'Returns / Interest', href: '/bhishi/returns', icon: <Percent className="w-4 h-4" /> },
      ],
    },
    {
      label: 'Loans',
      icon: <CreditCard className="w-5 h-5" />,
      badge: stats.overdueLoansCount > 0 ? stats.overdueLoansCount : undefined,
      badgeVariant: 'rose',
      subItems: [
        { label: 'All Loans', href: '/loans', icon: <CreditCard className="w-4 h-4" /> },
        { label: 'Issue New Loan', href: '/loans/issue', icon: <PlusCircle className="w-4 h-4" /> },
        { label: 'Loan Repayments', href: '/loans/repayments', icon: <Clock className="w-4 h-4" /> },
        { label: 'Outstanding Loans', href: '/loans/outstanding', icon: <AlertCircle className="w-4 h-4" /> },
      ],
    },
    {
      label: 'Transactions',
      href: '/transactions',
      icon: <Receipt className="w-5 h-5" />,
    },
    {
      label: 'Expenses',
      href: '/expenses',
      icon: <TrendingDown className="w-5 h-5" />,
    },
    {
      label: 'Reports',
      href: '/reports',
      icon: <FileBarChart className="w-5 h-5" />,
    },
    {
      label: 'Calculators',
      href: '/calculators',
      icon: <Calculator className="w-5 h-5" />,
    },
    {
      label: 'Audit Logs',
      href: '/audit-logs',
      icon: <ShieldCheck className="w-5 h-5" />,
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const handleLinkClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="w-72 bg-slate-900 text-slate-200 flex flex-col h-full border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3.5 bg-slate-950/40">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-bold text-xl shadow-md shrink-0">
          ₹
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-extrabold text-white text-base tracking-tight truncate font-display">
            {businessSettings.businessName || 'SaiBhishi'}
          </h1>
          <p className="text-[11px] text-emerald-400 font-medium tracking-wide flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Finance Admin System
          </p>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 text-sm">
        {navItems.map((item) => {
          if (item.subItems) {
            const isExpanded = expandedMenus[item.label];
            const isSubActive = item.subItems.some((sub) => location.pathname === sub.href);

            return (
              <div key={item.label} className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleMenu(item.label)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 group cursor-pointer ${
                    isSubActive
                      ? 'bg-slate-800/90 text-white font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isSubActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-emerald-400'}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          item.badgeVariant === 'rose'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180 text-emerald-400' : ''
                      }`}
                    />
                  </div>
                </button>

                {isExpanded && (
                  <div className="pl-9 pr-2 py-1 space-y-1 border-l border-slate-800 ml-4">
                    {item.subItems.map((sub) => (
                      <NavLink
                        key={sub.href}
                        to={sub.href}
                        onClick={handleLinkClick}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
                            isActive
                              ? 'bg-emerald-500/15 text-emerald-400 font-semibold border-l-2 border-emerald-400'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                          }`
                        }
                      >
                        {sub.icon && <span className="shrink-0">{sub.icon}</span>}
                        <span className="truncate">{sub.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.href}
              to={item.href!}
              onClick={handleLinkClick}
              end={item.href === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 group ${
                  isActive
                    ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <span className="group-hover:text-emerald-300 transition-colors">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </div>
            </NavLink>
          );
        })}
      </div>

      {/* Admin User Footer */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {user?.displayName ? user.displayName.charAt(0) : 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.displayName || 'Admin'}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider truncate">
                {user?.role?.replace('_', ' ') || 'Admin'}
              </p>
            </div>
          </div>

          <button
            onClick={() => logout()}
            title="Logout"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
