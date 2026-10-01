import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
  X,
  Sparkles,
  Smartphone,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface NavSubItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  badge?: string | number;
  badgeVariant?: 'emerald' | 'amber' | 'rose';
  subItems?: NavSubItem[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<{
  onCloseMobile?: () => void;
  isMobile?: boolean;
}> = ({ onCloseMobile, isMobile = false }) => {
  const { user, logout, isDemoMode } = useAuth();
  const { businessSettings, stats } = useData();
  const location = useLocation();
  const navigate = useNavigate();

  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    Members: location.pathname.startsWith('/members'),
    'Bhishi / Investments': location.pathname.startsWith('/bhishi'),
    Loans: location.pathname.startsWith('/loans'),
  });

  const toggleMenu = (title: string) => {
    setExpandedMenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const navSections: NavSection[] = [
    {
      title: 'Main Navigation',
      items: [
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
            { label: 'Returns & Interest', href: '/bhishi/returns', icon: <Percent className="w-4 h-4" /> },
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
      ],
    },
    {
      title: 'Accounts & Finance',
      items: [
        {
          label: 'Ledger Transactions',
          href: '/transactions',
          icon: <Receipt className="w-5 h-5" />,
        },
        {
          label: 'Office Expenses',
          href: '/expenses',
          icon: <TrendingDown className="w-5 h-5" />,
        },
        {
          label: 'Reports & Statements',
          href: '/reports',
          icon: <FileBarChart className="w-5 h-5" />,
        },
        {
          label: 'EMI Calculators',
          href: '/calculators',
          icon: <Calculator className="w-5 h-5" />,
        },
      ],
    },
    {
      title: 'System & Security',
      items: [
        {
          label: 'Audit Trail Logs',
          href: '/audit-logs',
          icon: <ShieldCheck className="w-5 h-5" />,
        },
        {
          label: 'App Settings',
          href: '/settings',
          icon: <Settings className="w-5 h-5" />,
        },
      ],
    },
  ];

  const handleLinkClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  const handleLogout = async () => {
    if (onCloseMobile) onCloseMobile();
    await logout();
    navigate('/login');
  };

  return (
    <aside className="w-full h-full bg-slate-900 text-slate-200 flex flex-col select-none overflow-hidden font-sans">
      {/* 1. Android Material 3 Account Profile Header */}
      <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-5 border-b border-slate-800 shrink-0">
        {/* Android Close Button on Mobile */}
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 text-slate-300 hover:text-white transition-all cursor-pointer"
            aria-label="Close Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* User Profile Info & Logo */}
        <div className="flex items-center gap-3.5 pt-1">
          <div className="relative shrink-0">
            <img
              src="/logo.png"
              alt="साई भिषी मंडळ"
              className="w-13 h-13 rounded-2xl object-cover shadow-lg ring-2 ring-emerald-400/40 bg-slate-900"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-slate-900 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </span>
          </div>

          <div className="min-w-0 flex-1 pr-6">
            <p className="font-extrabold text-white text-base tracking-tight truncate font-display">
              साई भिषी मंडळ
            </p>
            <p className="text-xs text-emerald-400 font-medium truncate mt-0.5">
              {user?.displayName || 'Admin'} ({user?.email || 'admin@saibhishi.in'})
            </p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {user?.role?.replace('_', ' ') || 'Super Admin'}
              </span>
              <span className="text-[10px] text-slate-400 font-medium truncate">
                • {businessSettings.businessName || 'SaiBhishi'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Grouped Android Navigation Items List */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-4 text-sm no-scrollbar">
        {navSections.map((section, sIdx) => (
          <div key={section.title || sIdx} className="space-y-1">
            {/* Android Category Subheader */}
            <div className="px-3 pt-2 pb-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              {section.title}
            </div>

            {section.items.map((item) => {
              if (item.subItems) {
                const isExpanded = expandedMenus[item.label];
                const isSubActive = item.subItems.some((sub) => location.pathname === sub.href);

                return (
                  <div key={item.label} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => toggleMenu(item.label)}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all duration-150 group cursor-pointer active:scale-[0.98] ${
                        isSubActive
                          ? 'bg-slate-800 text-white font-semibold shadow-xs'
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <span
                          className={`transition-colors ${
                            isSubActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-emerald-400'
                          }`}
                        >
                          {item.icon}
                        </span>
                        <span className="truncate font-medium">{item.label}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.badge !== undefined && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
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

                    {/* Submenu Pills */}
                    {isExpanded && (
                      <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-emerald-500/20 ml-5">
                        {item.subItems.map((sub) => (
                          <NavLink
                            key={sub.href}
                            to={sub.href}
                            onClick={handleLinkClick}
                            className={({ isActive }) =>
                              `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs transition-all duration-150 active:scale-[0.98] ${
                                isActive
                                  ? 'bg-emerald-500/20 text-emerald-300 font-bold border-l-2 border-emerald-400 pl-2.5'
                                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40 font-medium'
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
                    `flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all duration-150 group active:scale-[0.98] ${
                      isActive
                        ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-900/30'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white font-medium'
                    }`
                  }
                >
                  <div className="flex items-center gap-3.5">
                    <span className="group-hover:text-emerald-300 transition-colors">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* 3. Android Material Footer Status & Logout Strip */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950/70 shrink-0 space-y-2 pb-safe">
        {/* Sync info banner */}
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {isDemoMode ? 'Sandbox Mode' : 'Live Cloud'}
          </span>
          <span className="text-[10px] font-mono text-slate-500">v2.4 Android PWA</span>
        </div>

        {/* User Signout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:text-white hover:bg-rose-600/20 active:scale-95 transition-all border border-rose-500/20 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Account</span>
        </button>
      </div>
    </aside>
  );
};

