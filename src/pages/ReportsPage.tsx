import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { ReportType, ReportDateRange } from '../types/report';
import { Button } from '../components/common/Button';
import { SearchInput } from '../components/common/SearchInput';
import { Badge, getStatusBadgeVariant } from '../components/common/Badge';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportToCSV, printDocument } from '../utils/exportUtils';
import { generateCashFlowStatement, generateMemberStatement } from '../services/reportService';
import {
  FileBarChart,
  Download,
  Printer,
  Calendar,
  Layers,
  CircleDollarSign,
  TrendingUp,
  Percent,
  CreditCard,
  Receipt,
  FileText,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { members, plans, collections, loans, transactions, expenses, stats, businessSettings } = useData();

  const [selectedReport, setSelectedReport] = useState<ReportType>('monthly_collection');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  const reportsList = [
    { id: 'monthly_collection' as ReportType, title: '1. Monthly Collection Report', desc: 'Bhishi installments collected vs pending' },
    { id: 'member_investment' as ReportType, title: '2. Member Investment Summary', desc: 'Cumulative principal & balances per member' },
    { id: 'yearly_interest' as ReportType, title: '3. Yearly Interest / Returns Report', desc: 'Annual interest dividends credited' },
    { id: 'loan_disbursement_recovery' as ReportType, title: '4. Loan Disbursement & Recovery', desc: 'Capital lent out vs EMI recovered' },
    { id: 'outstanding_loans' as ReportType, title: '5. Outstanding Loan Exposure', desc: 'Open loans, due interests and balances' },
    { id: 'transactions_ledger' as ReportType, title: '6. Master Transaction Ledger', desc: 'Consolidated inflows and outflows' },
    { id: 'cash_flow' as ReportType, title: '7. Cash Flow Statement', desc: 'Detailed net liquidity & inflows/outflows' },
    { id: 'profit_interest' as ReportType, title: '8. Profit & Interest Margin Report', desc: 'Loan interest earned vs bhishi payout' },
    { id: 'member_statement' as ReportType, title: '9. Comprehensive Member Statement', desc: 'Individual customer ledger & statement' },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (selectedReport === 'monthly_collection') {
      exportToCSV(
        'Monthly_Collection_Report',
        collections.map((c) => ({
          'Member Name': c.memberName,
          'Member ID': c.memberCode,
          'Month': c.monthYearLabel,
          'Expected (₹)': c.expectedAmount,
          'Paid (₹)': c.paidAmount,
          'Remaining (₹)': c.remainingAmount,
          'Due Date': c.dueDate,
          'Receipt': c.receiptNumber || '—',
          'Status': c.status,
        }))
      );
    } else if (selectedReport === 'member_investment') {
      exportToCSV(
        'Member_Investment_Report',
        members.map((m) => ({
          'Member Name': m.fullName,
          'Member ID': m.memberCode,
          'Plan': m.bhishiPlanName || '—',
          'Monthly (₹)': m.monthlyContribution,
          'Total Invested (₹)': m.totalInvested,
          'Total Returns (₹)': m.totalReturns,
          'Joining Date': m.joiningDate,
          'Status': m.status,
        }))
      );
    } else if (selectedReport === 'loan_disbursement_recovery') {
      exportToCSV(
        'Loan_Disbursement_Recovery_Report',
        loans.map((l) => ({
          'Loan #': l.loanNumber,
          'Borrower': l.memberName,
          'Principal (₹)': l.principalAmount,
          'Rate': `${l.monthlyInterestRate}%/mo`,
          'Total Payable (₹)': l.totalPayable,
          'Total Paid (₹)': l.totalAmountPaid,
          'Balance (₹)': l.outstandingTotal,
          'Status': l.status,
        }))
      );
    } else {
      exportToCSV(
        'Financial_Report_Ledger',
        transactions.map((t) => ({
          'Txn #': t.transactionNumber,
          'Date': t.date,
          'Type': t.type,
          'Category': t.category,
          'Amount (₹)': t.amount,
          'Member': t.memberName || 'General',
          'Description': t.description,
        }))
      );
    }
  };

  const cashflow = generateCashFlowStatement(transactions, expenses, startDate, endDate);
  const selectedMemberObj = members.find((m) => m.id === selectedMemberId) || members[0];
  const memberStatement = selectedMemberObj
    ? generateMemberStatement(selectedMemberObj, collections, loans, transactions)
    : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-card">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight font-display">
            Financial Statements & Reports Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Generate printable audit reports, cash flow summaries, profit statements, and customer financial history
          </p>
        </div>

        <div className="flex items-center gap-2.5 no-print">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Printer className="w-4 h-4" />}
            onClick={handlePrint}
          >
            Print Report
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Report Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Report Categories Navigation */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-card space-y-1.5 no-print">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Select Report Type
          </p>
          {reportsList.map((rep) => (
            <button
              key={rep.id}
              onClick={() => setSelectedReport(rep.id)}
              className={`w-full text-left p-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                selectedReport === rep.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <p className="font-bold text-sm tracking-tight">{rep.title}</p>
              <p className={`text-[11px] mt-0.5 ${selectedReport === rep.id ? 'text-emerald-100' : 'text-slate-400'}`}>
                {rep.desc}
              </p>
            </button>
          ))}
        </div>

        {/* Right Side: Report Canvas / Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Printable Report Canvas */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-card">
            {/* Header for print / official view */}
            <div className="border-b-2 border-slate-900 pb-4 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 uppercase font-display">
                    {businessSettings.businessName}
                  </h2>
                  <p className="text-xs text-slate-600 font-medium">
                    {reportsList.find((r) => r.id === selectedReport)?.title}
                  </p>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p>Generated: {formatDate(new Date().toISOString().slice(0, 10))}</p>
                  <p>Period: {formatDate(startDate)} to {formatDate(endDate)}</p>
                </div>
              </div>
            </div>

            {/* REPORT 1: Monthly Collection Report */}
            {selectedReport === 'monthly_collection' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl text-center text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">Expected Total</span>
                    <p className="text-base font-bold font-mono text-slate-900 mt-0.5">{formatCurrency(collections.reduce((a, b) => a + b.expectedAmount, 0))}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Collected Total</span>
                    <p className="text-base font-bold font-mono text-emerald-700 mt-0.5">{formatCurrency(collections.reduce((a, b) => a + (b.paidAmount || 0), 0))}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Uncollected Dues</span>
                    <p className="text-base font-bold font-mono text-amber-700 mt-0.5">{formatCurrency(collections.reduce((a, b) => a + (b.remainingAmount || 0), 0))}</p>
                  </div>
                </div>

                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b">
                    <tr>
                      <th className="py-2.5 px-3">Member</th>
                      <th className="py-2.5 px-3">Month</th>
                      <th className="py-2.5 px-3 text-right">Expected</th>
                      <th className="py-2.5 px-3 text-right">Paid</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {collections.slice(0, 15).map((c) => (
                      <tr key={c.id}>
                        <td className="py-2.5 px-3 font-semibold">{c.memberName}</td>
                        <td className="py-2.5 px-3">{c.monthYearLabel}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(c.expectedAmount)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">{formatCurrency(c.paidAmount)}</td>
                        <td className="py-2.5 px-3 text-center">
                          <Badge variant={getStatusBadgeVariant(c.status)} size="sm">{c.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* REPORT 2: Member Investment Summary */}
            {selectedReport === 'member_investment' && (
              <div className="space-y-4">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b">
                    <tr>
                      <th className="py-2.5 px-3">Member</th>
                      <th className="py-2.5 px-3">Plan</th>
                      <th className="py-2.5 px-3 text-right">Total Invested</th>
                      <th className="py-2.5 px-3 text-right">Returns Earned</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {members.map((m) => (
                      <tr key={m.id}>
                        <td className="py-2.5 px-3 font-bold">{m.fullName} ({m.memberCode})</td>
                        <td className="py-2.5 px-3">{m.bhishiPlanName || 'Standard'}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">{formatCurrency(m.totalInvested)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-purple-700">+{formatCurrency(m.totalReturns)}</td>
                        <td className="py-2.5 px-3 text-center">
                          <Badge variant={getStatusBadgeVariant(m.status)} size="sm">{m.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* REPORT 7: Cash Flow Statement */}
            {selectedReport === 'cash_flow' && (
              <div className="space-y-6 text-xs">
                {/* Inflow Section */}
                <div className="border border-emerald-200 rounded-2xl p-4 bg-emerald-50/40">
                  <h4 className="font-bold text-emerald-900 uppercase tracking-wider text-xs mb-3">
                    A. Cash Inflows (+)
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Monthly Bhishi Collections:</span>
                      <span className="font-mono font-bold">{formatCurrency(cashflow.inflow.bhishiCollections)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Loan Principal Recovery:</span>
                      <span className="font-mono font-bold">{formatCurrency(cashflow.inflow.loanPrincipalRecovered)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Loan Interest Collected:</span>
                      <span className="font-mono font-bold">{formatCurrency(cashflow.inflow.loanInterestCollected)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Loan Processing Fees:</span>
                      <span className="font-mono font-bold">{formatCurrency(cashflow.inflow.processingFees)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-emerald-300 font-bold text-emerald-950 text-sm">
                      <span>Total Operating Inflow:</span>
                      <span className="font-mono">{formatCurrency(cashflow.inflow.totalInflow)}</span>
                    </div>
                  </div>
                </div>

                {/* Outflow Section */}
                <div className="border border-rose-200 rounded-2xl p-4 bg-rose-50/40">
                  <h4 className="font-bold text-rose-900 uppercase tracking-wider text-xs mb-3">
                    B. Cash Outflows (-)
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Loan Disbursements:</span>
                      <span className="font-mono font-bold">{formatCurrency(cashflow.outflow.loanDisbursements)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bhishi Payouts & Withdrawals:</span>
                      <span className="font-mono font-bold">{formatCurrency(cashflow.outflow.bhishiMaturityPayouts)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Operating Expenses (Rent, Salary, Bills):</span>
                      <span className="font-mono font-bold">{formatCurrency(cashflow.outflow.operatingExpenses)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-rose-300 font-bold text-rose-950 text-sm">
                      <span>Total Cash Outflow:</span>
                      <span className="font-mono">{formatCurrency(cashflow.outflow.totalOutflow)}</span>
                    </div>
                  </div>
                </div>

                {/* Net Balance */}
                <div className="bg-slate-900 text-white p-4 rounded-2xl flex justify-between items-center text-sm font-bold">
                  <span>Net Cash Position (Inflow - Outflow):</span>
                  <span className="text-xl font-mono text-emerald-400 font-extrabold">{formatCurrency(cashflow.netCashFlow)}</span>
                </div>
              </div>
            )}

            {/* REPORT 9: Comprehensive Member Statement */}
            {selectedReport === 'member_statement' && (
              <div className="space-y-5">
                <div className="no-print mb-3">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Select Member for Statement
                  </label>
                  <select
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-900"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.fullName} ({m.memberCode}) — {m.villageCity || ''}
                      </option>
                    ))}
                  </select>
                </div>

                {memberStatement && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl text-center text-xs">
                      <div>
                        <span className="text-slate-400 font-semibold">Total Invested</span>
                        <p className="text-base font-bold font-mono text-emerald-700 mt-0.5">{formatCurrency(memberStatement.totalInvested)}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold">Interest Returns</span>
                        <p className="text-base font-bold font-mono text-purple-700 mt-0.5">+{formatCurrency(memberStatement.totalReturns)}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold">Loans Taken</span>
                        <p className="text-base font-bold font-mono text-slate-900 mt-0.5">{formatCurrency(memberStatement.totalLoansTaken)}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold">Outstanding Loan</span>
                        <p className="text-base font-bold font-mono text-amber-700 mt-0.5">{formatCurrency(memberStatement.currentOutstandingBalance)}</p>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 pt-2">
                      Transaction Ledger History
                    </h4>
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b">
                        <tr>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Txn #</th>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {memberStatement.transactions.map((t) => (
                          <tr key={t.id}>
                            <td className="py-2.5 px-3 text-slate-600">{formatDate(t.date)}</td>
                            <td className="py-2.5 px-3 font-mono font-bold">#{t.transactionNumber}</td>
                            <td className="py-2.5 px-3">{t.type}</td>
                            <td className={`py-2.5 px-3 text-right font-mono font-bold ${t.category === 'inflow' ? 'text-emerald-700' : 'text-rose-600'}`}>
                              {t.category === 'inflow' ? '+' : '-'}{formatCurrency(t.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Other generic reports display fallback */}
            {selectedReport !== 'monthly_collection' && selectedReport !== 'member_investment' && selectedReport !== 'cash_flow' && selectedReport !== 'member_statement' && (
              <div className="space-y-4">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b">
                    <tr>
                      <th className="py-2.5 px-3">Account / Txn #</th>
                      <th className="py-2.5 px-3">Member</th>
                      <th className="py-2.5 px-3">Particulars</th>
                      <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {transactions.slice(0, 12).map((t) => (
                      <tr key={t.id}>
                        <td className="py-2.5 px-3 font-mono font-bold">#{t.transactionNumber}</td>
                        <td className="py-2.5 px-3">{t.memberName || 'General'}</td>
                        <td className="py-2.5 px-3">{t.type}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold">{formatCurrency(t.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
