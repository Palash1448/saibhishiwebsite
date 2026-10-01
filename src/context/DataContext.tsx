import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Member } from '../types/member';
import { BhishiPlan, InterestRecord } from '../types/bhishi';
import { MonthlyCollection, CollectionSummary } from '../types/collection';
import { Loan } from '../types/loan';
import { Transaction } from '../types/transaction';
import { Expense, ExpenseSummary } from '../types/expense';
import { BusinessSettings, FinanceSettings, AuditLog } from '../types/settings';

import { getAllMembers } from '../services/memberService';
import { getAllBhishiPlans } from '../services/bhishiService';
import { getAllCollections, computeCollectionSummary } from '../services/collectionService';
import { getAllLoans } from '../services/loanService';
import { getAllTransactions } from '../services/transactionService';
import { getAllExpenses, computeExpenseSummary } from '../services/expenseService';
import { getAllInterestRecords } from '../services/interestService';
import { getBusinessSettings, getFinanceSettings, getAuditLogs } from '../services/settingsService';
import { DEFAULT_BUSINESS_SETTINGS, DEFAULT_FINANCE_SETTINGS } from '../constants/defaultSettings';

export interface FinancialStats {
  totalMembers: number;
  activeMembers: number;
  totalMonthlyCollections: number;
  totalInvestmentPrincipal: number;
  totalInterestReturns: number;
  totalLoansGiven: number;
  outstandingLoanAmount: number;
  totalLoanRecovered: number;
  pendingPaymentsCount: number;
  pendingPaymentsAmount: number;
  overdueLoansCount: number;
  overdueLoansAmount: number;
  totalExpenses: number;
  netCashBalance: number;
}

interface DataContextType {
  members: Member[];
  plans: BhishiPlan[];
  collections: MonthlyCollection[];
  loans: Loan[];
  transactions: Transaction[];
  expenses: Expense[];
  interestRecords: InterestRecord[];
  businessSettings: BusinessSettings;
  financeSettings: FinanceSettings;
  auditLogs: AuditLog[];

  stats: FinancialStats;
  collectionSummary: CollectionSummary;
  expenseSummary: ExpenseSummary;

  loading: boolean;
  refreshAll: () => Promise<void>;
  resetToSampleData: () => void;
  updateLocalBusinessSettings: (settings: BusinessSettings) => void;
  updateLocalFinanceSettings: (settings: FinanceSettings) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<BhishiPlan[]>([]);
  const [collections, setCollections] = useState<MonthlyCollection[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [interestRecords, setInterestRecords] = useState<InterestRecord[]>([]);
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>(DEFAULT_BUSINESS_SETTINGS);
  const [financeSettings, setFinanceSettings] = useState<FinanceSettings>(DEFAULT_FINANCE_SETTINGS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const [loading, setLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        membersData,
        plansData,
        collectionsData,
        loansData,
        transactionsData,
        expensesData,
        interestData,
        bizData,
        finData,
        logsData,
      ] = await Promise.all([
        getAllMembers(),
        getAllBhishiPlans(),
        getAllCollections(),
        getAllLoans(),
        getAllTransactions(),
        getAllExpenses(),
        getAllInterestRecords(),
        getBusinessSettings(),
        getFinanceSettings(),
        getAuditLogs(),
      ]);

      setMembers(membersData);
      setPlans(plansData);
      setCollections(collectionsData);
      setLoans(loansData);
      setTransactions(transactionsData);
      setExpenses(expensesData);
      setInterestRecords(interestData);
      setBusinessSettings(bizData);
      setFinanceSettings(finData);
      setAuditLogs(logsData);
    } catch (err) {
      console.error('Error loading Firestore database state:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetToSampleData = () => {
    // Clear all local caches and reload cleanly from Firestore
    localStorage.removeItem('saibhishi_members');
    localStorage.removeItem('saibhishi_bhishiPlans');
    localStorage.removeItem('saibhishi_monthlyCollections');
    localStorage.removeItem('saibhishi_loans');
    localStorage.removeItem('saibhishi_expenses');
    localStorage.removeItem('saibhishi_transactions');
    localStorage.removeItem('saibhishi_interestRecords');
    localStorage.removeItem('saibhishi_auditLogs');
    loadData();
  };

  const updateLocalBusinessSettings = (settings: BusinessSettings) => {
    setBusinessSettings(settings);
  };

  const updateLocalFinanceSettings = (settings: FinanceSettings) => {
    setFinanceSettings(settings);
  };

  // Compute Financial Aggregates
  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.status === 'active').length;

  let totalMonthlyCollections = 0;
  let totalInvestmentPrincipal = 0;
  let totalInterestReturns = 0;

  members.forEach((m) => {
    totalInvestmentPrincipal += m.totalInvested || 0;
    totalInterestReturns += m.totalReturns || 0;
  });

  collections.forEach((c) => {
    totalMonthlyCollections += c.paidAmount || 0;
  });

  let totalLoansGiven = 0;
  let outstandingLoanAmount = 0;
  let totalLoanRecovered = 0;
  let overdueLoansCount = 0;
  let overdueLoansAmount = 0;

  loans.forEach((l) => {
    totalLoansGiven += l.principalAmount || 0;
    outstandingLoanAmount += l.outstandingTotal || 0;
    totalLoanRecovered += l.totalAmountPaid || 0;

    if (l.status === 'defaulted' || (l.status === 'active' && l.installments.some((i) => i.status === 'overdue'))) {
      overdueLoansCount++;
      overdueLoansAmount += l.outstandingTotal || 0;
    }
  });

  const collectionSummary = computeCollectionSummary(collections);
  const expenseSummary = computeExpenseSummary(expenses);

  // Inflows minus Outflows calculation
  let totalInflow = 0;
  let totalOutflow = 0;
  transactions.filter((t) => !t.isReversed).forEach((t) => {
    if (t.category === 'inflow') totalInflow += t.amount;
    if (t.category === 'outflow') totalOutflow += t.amount;
  });

  const netCashBalance = totalInflow - totalOutflow;

  const stats: FinancialStats = {
    totalMembers,
    activeMembers,
    totalMonthlyCollections,
    totalInvestmentPrincipal,
    totalInterestReturns,
    totalLoansGiven,
    outstandingLoanAmount,
    totalLoanRecovered,
    pendingPaymentsCount: collectionSummary.pendingCount,
    pendingPaymentsAmount: collectionSummary.pendingTotal,
    overdueLoansCount,
    overdueLoansAmount,
    totalExpenses: expenseSummary.totalExpense,
    netCashBalance,
  };

  return (
    <DataContext.Provider
      value={{
        members,
        plans,
        collections,
        loans,
        transactions,
        expenses,
        interestRecords,
        businessSettings,
        financeSettings,
        auditLogs,
        stats,
        collectionSummary,
        expenseSummary,
        loading,
        refreshAll: loadData,
        resetToSampleData,
        updateLocalBusinessSettings,
        updateLocalFinanceSettings,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
