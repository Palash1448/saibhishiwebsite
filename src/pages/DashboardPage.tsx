import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { StatCard } from '../components/common/StatCard';
import { Button } from '../components/common/Button';
import { CollectionTrendChart } from '../components/dashboard/CollectionTrendChart';
import { InvestmentVsReturnChart } from '../components/dashboard/InvestmentVsReturnChart';
import { LoanDisbursementRecoveryChart } from '../components/dashboard/LoanDisbursementRecoveryChart';
import { MonthlyCashflowChart } from '../components/dashboard/MonthlyCashflowChart';
import { MemberGrowthChart } from '../components/dashboard/MemberGrowthChart';
import { PendingActionsWidget } from '../components/dashboard/PendingActionsWidget';
import { RecentTransactionsTable } from '../components/dashboard/RecentTransactionsTable';

import {
  Users,
  UserCheck,
  CircleDollarSign,
  TrendingUp,
  Percent,
  CreditCard,
  AlertCircle,
  Clock,
  Plus,
  ArrowUpRight,
  TrendingDown,
  Layers,
  Calendar,
  Sparkles,
  Receipt,
  UserPlus,
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export const DashboardPage: React.FC = () => {
  const { stats, members, loans, collections, transactions } = useData();
  const { onOpenQuickAction, onShowReceipt } = useOutletContext<{
    onOpenQuickAction: (type: string) => void;
    onShowReceipt: (data: any) => void;
  }>();
  const navigate = useNavigate();

  const [dateFilter, setDateFilter] = useState<'this_month' | 'last_month' | 'last_3_months' | 'last_6_months' | 'this_year'>('this_month');
  const [activeChartTab, setActiveChartTab] = useState<'collections' | 'investments' | 'loans' | 'cashflow' | 'growth'>('collections');

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-6">
      {/* Mobile Native Quick Actions Bar (Visible on mobile) */}
      <div className="sm:hidden grid grid-cols-4 gap-2 bg-white p-3 rounded-2xl border border-slate-100 shadow-card">
        <button
          type="button"
          onClick={() => onOpenQuickAction('record-collection')}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-50 text-emerald-800 active:scale-95 transition-transform"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-1 shadow-xs">
            <CircleDollarSign className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold">Collect</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenQuickAction('issue-loan')}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-indigo-50 text-indigo-800 active:scale-95 transition-transform"
        >
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center mb-1 shadow-xs">
            <CreditCard className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold">Loan</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenQuickAction('record-repayment')}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-teal-50 text-teal-800 active:scale-95 transition-transform"
        >
          <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center mb-1 shadow-xs">
            <Receipt className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold">Repay</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenQuickAction('add-member')}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-blue-50 text-blue-800 active:scale-95 transition-transform"
        >
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mb-1 shadow-xs">
            <UserPlus className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold">Member</span>
        </button>
      </div>

      {/* Desktop Top Banner & Quick Action Buttons */}
      <div className="hidden sm:flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-card">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight font-display">
            Financial Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time Bhishi collections, active loan books, interest distribution & cashflow ledger
          </p>
        </div>

        {/* Desktop Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => onOpenQuickAction('add-member')}
          >
            + Member
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<CircleDollarSign className="w-4 h-4" />}
            onClick={() => onOpenQuickAction('record-collection')}
          >
            + Collection
          </Button>

          <Button
            variant="navy"
            size="sm"
            leftIcon={<CreditCard className="w-4 h-4" />}
            onClick={() => onOpenQuickAction('issue-loan')}
          >
            + Loan
          </Button>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<TrendingDown className="w-4 h-4 text-rose-600" />}
            onClick={() => onOpenQuickAction('add-expense')}
          >
            + Expense
          </Button>
        </div>
      </div>

      {/* Primary Financial KPI Metrics (10 Top Statistics) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Total Members */}
        <StatCard
          title="Total Members"
          value={stats.totalMembers}
          subtitle={`${stats.activeMembers} Active Members`}
          icon={Users}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-700"
          trend={{ value: `${stats.activeMembers} active`, isPositive: true }}
          onClick={() => navigate('/members')}
        />

        {/* Monthly Collections */}
        <StatCard
          title="Monthly Collections"
          value={stats.totalMonthlyCollections}
          isCurrency
          subtitle="Collected this Month"
          icon={CircleDollarSign}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-700"
          trend={{ value: '+12.4% MoM', isPositive: true }}
          onClick={() => navigate('/bhishi/collections')}
        />

        {/* Total Principal In Pool */}
        <StatCard
          title="Total Principal"
          value={stats.totalInvestmentPrincipal}
          isCurrency
          subtitle="Cumulative Member Savings"
          icon={TrendingUp}
          iconBgColor="bg-teal-50"
          iconColor="text-teal-700"
          onClick={() => navigate('/bhishi/memberships')}
        />

        {/* Total Returns / Interest */}
        <StatCard
          title="Total Returns"
          value={stats.totalInterestReturns}
          isCurrency
          subtitle="Credited Returns to Date"
          icon={Percent}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-700"
          onClick={() => navigate('/bhishi/returns')}
        />

        {/* Total Loans Disbursed */}
        <StatCard
          title="Total Loans Given"
          value={stats.totalLoansGiven}
          isCurrency
          subtitle={`${loans.filter(l => l.status === 'active').length} Active Accounts`}
          icon={CreditCard}
          iconBgColor="bg-indigo-50"
          iconColor="text-indigo-700"
          onClick={() => navigate('/loans')}
        />

        {/* Outstanding Loan Balance */}
        <StatCard
          title="Outstanding Loans"
          value={stats.outstandingLoanAmount}
          isCurrency
          subtitle="Receivable Balance"
          icon={Clock}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-700"
          onClick={() => navigate('/loans/outstanding')}
        />

        {/* Loan Recovered */}
        <StatCard
          title="Loan Recovered"
          value={stats.totalLoanRecovered}
          isCurrency
          subtitle="Total EMI Collections"
          icon={UserCheck}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-700"
          onClick={() => navigate('/loans/repayments')}
        />

        {/* Overdue Loan / Payments */}
        <StatCard
          title="Overdue Dues"
          value={stats.pendingPaymentsAmount + stats.overdueLoansAmount}
          isCurrency
          subtitle={`${stats.pendingPaymentsCount} Dues • ${stats.overdueLoansCount} Default`}
          icon={AlertCircle}
          iconBgColor="bg-rose-50"
          iconColor="text-rose-700"
          trend={stats.overdueLoansCount > 0 ? { value: `${stats.overdueLoansCount} Overdue`, isPositive: false } : undefined}
          onClick={() => navigate('/loans/outstanding')}
        />
      </div>

      {/* Pending Actions Alert Box */}
      <PendingActionsWidget
        collections={collections}
        loans={loans}
        onRecordCollection={(col) => onOpenQuickAction('record-collection')}
        onRecordRepayment={(loan) => onOpenQuickAction('record-repayment')}
        onViewAllCollections={() => navigate('/bhishi/collections')}
        onViewAllLoans={() => navigate('/loans/outstanding')}
      />

      {/* Interactive Financial Analytics & Charts Section */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-100 shadow-xs">
          {/* Chart Tab Selectors */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setActiveChartTab('collections')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeChartTab === 'collections'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Collections
            </button>
            <button
              onClick={() => setActiveChartTab('investments')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeChartTab === 'investments'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Principal vs Returns
            </button>
            <button
              onClick={() => setActiveChartTab('loans')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeChartTab === 'loans'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Disbursement & Recovery
            </button>
            <button
              onClick={() => setActiveChartTab('cashflow')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeChartTab === 'cashflow'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Cashflow
            </button>
            <button
              onClick={() => setActiveChartTab('growth')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeChartTab === 'growth'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Growth
            </button>
          </div>

          {/* Date Range Filter Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
            >
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="last_3_months">Last 3 Months</option>
              <option value="last_6_months">Last 6 Months</option>
              <option value="this_year">This Fiscal Year</option>
            </select>
          </div>
        </div>

        {/* Selected Chart Component View */}
        <div className="bg-white p-3.5 sm:p-6 rounded-2xl border border-slate-100 shadow-card">
          {activeChartTab === 'collections' && <CollectionTrendChart collections={collections} />}
          {activeChartTab === 'investments' && <InvestmentVsReturnChart />}
          {activeChartTab === 'loans' && <LoanDisbursementRecoveryChart />}
          {activeChartTab === 'cashflow' && <MonthlyCashflowChart />}
          {activeChartTab === 'growth' && <MemberGrowthChart />}
        </div>
      </div>

      {/* Recent Ledger Activity Feed */}
      <RecentTransactionsTable
        transactions={transactions}
        onViewReceipt={(txn) => {
          if (txn.receiptNumber) {
            onShowReceipt({
              receiptNumber: txn.receiptNumber,
              date: txn.date,
              memberName: txn.memberName || 'General Customer',
              memberCode: txn.memberCode || 'MEM-1001',
              amount: txn.amount,
              amountInWords: 'Rupees ' + txn.amount.toLocaleString('en-IN') + ' Only',
              type: txn.type,
              paymentMethod: txn.paymentMethod,
              referenceNumber: txn.referenceNumber,
              businessName: 'SaiBhishi Finance Management',
            });
          }
        }}
      />
    </div>
  );
};
