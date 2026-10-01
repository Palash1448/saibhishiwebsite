import React, { useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Badge, getStatusBadgeVariant } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { RecordRepaymentModal } from '../../components/loans/RecordRepaymentModal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportToCSV } from '../../utils/exportUtils';
import {
  CreditCard,
  Printer,
  Receipt,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const LoanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { loans } = useData();
  const { onShowReceipt } = useOutletContext<{ onShowReceipt: (data: any) => void }>();
  const navigate = useNavigate();

  const [isRepaymentModalOpen, setIsRepaymentModalOpen] = useState(false);

  const loan = loans.find((l) => l.id === id || l.loanNumber === id);

  if (!loan) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center max-w-lg mx-auto mt-12">
        <h3 className="text-base font-bold text-slate-900">Loan Account Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">Could not find the loan record in the system.</p>
        <Button variant="primary" size="sm" onClick={() => navigate('/loans')} className="mt-4">
          Back to Loan Book
        </Button>
      </div>
    );
  }

  const handlePrintSchedule = () => {
    window.print();
  };

  const handleExportScheduleCSV = () => {
    exportToCSV(
      `Loan_Schedule_${loan.loanNumber}`,
      loan.installments.map((inst) => ({
        'Installment #': `Month ${inst.installmentNumber}`,
        'Due Date': inst.dueDate,
        'Principal (₹)': inst.principalAmount,
        'Interest (₹)': inst.interestAmount,
        'Total EMI (₹)': inst.totalInstallment,
        'Paid Amount (₹)': inst.paidAmount,
        'Remaining (₹)': inst.remainingAmount,
        'Paid Date': inst.paidDate || '—',
        'Receipt No': inst.receiptNumber || '—',
        'Status': inst.status,
      }))
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-6">
      <div className="no-print">
        <Breadcrumb
          items={[
            { label: 'Loans', href: '/loans' },
            { label: `Loan Account #${loan.loanNumber}` },
          ]}
        />
      </div>

      {/* Loan Account Header Card */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight font-display">
                Loan #{loan.loanNumber}
              </h1>
              <Badge variant={getStatusBadgeVariant(loan.status)} size="md">
                {loan.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Borrower: <strong className="text-slate-900">{loan.memberName}</strong> ({loan.memberCode}) • Disbursed {formatDate(loan.issueDate)}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap no-print">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Printer className="w-4 h-4" />}
              onClick={handlePrintSchedule}
              className="flex-1 sm:flex-none justify-center"
            >
              Print
            </Button>

            {loan.status === 'active' && loan.outstandingTotal > 0 && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Receipt className="w-4 h-4" />}
                onClick={() => setIsRepaymentModalOpen(true)}
                className="flex-1 sm:flex-none justify-center"
              >
                + Record Repayment
              </Button>
            )}
          </div>
        </div>

        {/* Loan Financial Parameters Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4 mt-5 pt-5 border-t border-slate-100 text-center">
          <div className="bg-slate-50 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Sanctioned</span>
            <p className="text-sm sm:text-base font-bold font-mono text-slate-900 mt-0.5">
              {formatCurrency(loan.principalAmount)}
            </p>
          </div>

          <div className="bg-slate-50 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Monthly Rate</span>
            <p className="text-sm sm:text-base font-bold font-mono text-indigo-700 mt-0.5">
              {loan.monthlyInterestRate}% / mo
            </p>
          </div>

          <div className="bg-slate-50 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Monthly EMI</span>
            <p className="text-sm sm:text-base font-bold font-mono text-emerald-700 mt-0.5">
              {formatCurrency(loan.monthlyInstallment)}
            </p>
          </div>

          <div className="bg-slate-50 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Total Payable</span>
            <p className="text-sm sm:text-base font-bold font-mono text-slate-900 mt-0.5">
              {formatCurrency(loan.totalPayable)}
            </p>
          </div>

          <div className="bg-slate-50 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Total Repaid</span>
            <p className="text-sm sm:text-base font-bold font-mono text-emerald-600 mt-0.5">
              {formatCurrency(loan.totalAmountPaid)}
            </p>
          </div>

          <div className="bg-amber-50 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-amber-200/80">
            <span className="text-[10px] font-semibold text-amber-800 uppercase">Outstanding</span>
            <p className="text-sm sm:text-base font-extrabold font-mono text-amber-900 mt-0.5">
              {formatCurrency(loan.outstandingTotal)}
            </p>
          </div>
        </div>
      </div>

      {/* Complete Amortization Schedule: Mobile Cards + Desktop Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Installment Amortization Schedule</h3>
            <p className="text-xs text-slate-500 mt-0.5">Breakdown of monthly principal, interest, and payment status</p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleExportScheduleCSV}
            className="no-print self-start sm:self-auto"
          >
            Export Schedule
          </Button>
        </div>

        {/* Mobile Installment Cards */}
        <div className="divide-y divide-slate-100 sm:hidden">
          {loan.installments.map((inst) => (
            <div key={inst.installmentNumber} className="p-4 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-bold text-sm text-slate-900">Month {inst.installmentNumber}</span>
                  <span className="text-xs text-slate-500 block">Due: {formatDate(inst.dueDate)}</span>
                </div>
                <Badge variant={getStatusBadgeVariant(inst.status)} size="sm">
                  {inst.status}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Principal</span>
                  <span className="font-mono font-semibold text-slate-800">{formatCurrency(inst.principalAmount)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Interest</span>
                  <span className="font-mono text-slate-600">{formatCurrency(inst.interestAmount)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Total EMI</span>
                  <span className="font-mono font-bold text-slate-900">{formatCurrency(inst.totalInstallment)}</span>
                </div>
              </div>

              {inst.paidAmount > 0 && (
                <div className="flex items-center justify-between text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg">
                  <span>Paid: <strong className="font-mono">{formatCurrency(inst.paidAmount)}</strong></span>
                  {inst.receiptNumber && <span className="font-mono font-semibold">{inst.receiptNumber}</span>}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-6">Installment</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Principal Part</th>
                <th className="py-3 px-4 text-right">Interest Part</th>
                <th className="py-3 px-4 text-right">Total EMI (₹)</th>
                <th className="py-3 px-4 text-right">Paid Amount</th>
                <th className="py-3 px-4">Receipt / Date</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loan.installments.map((inst) => (
                <tr key={inst.installmentNumber} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-6 font-bold text-slate-900">
                    Month {inst.installmentNumber}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">{formatDate(inst.dueDate)}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-800">
                    {formatCurrency(inst.principalAmount)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                    {formatCurrency(inst.interestAmount)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                    {formatCurrency(inst.totalInstallment)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                    {formatCurrency(inst.paidAmount)}
                  </td>
                  <td className="py-3.5 px-4">
                    {inst.receiptNumber ? (
                      <span className="font-mono font-bold text-emerald-800">
                        {inst.receiptNumber} ({formatDate(inst.paidDate)})
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Badge variant={getStatusBadgeVariant(inst.status)} size="sm">
                      {inst.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Repayment Modal */}
      {isRepaymentModalOpen && (
        <RecordRepaymentModal
          isOpen={true}
          preselectedLoan={loan}
          onClose={() => setIsRepaymentModalOpen(false)}
          onSuccessReceipt={onShowReceipt}
        />
      )}
    </div>
  );
};
