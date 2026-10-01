import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import type { Loan, LoanRepaymentType } from '../../types/loan';
import type { PaymentMethod } from '../../types/collection';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { recordLoanRepayment } from '../../services/loanService';
import { PAYMENT_METHODS } from '../../constants/categories';
import type { ReceiptData } from '../../utils/receiptGenerator';
import { numberToIndianWords, formatCurrency } from '../../utils/formatters';
import { Receipt, Percent, CircleDollarSign, Info, Sparkles, CheckCircle2 } from 'lucide-react';

interface RecordRepaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedLoan?: Loan | null;
  onSuccessReceipt?: (receipt: ReceiptData) => void;
}

export const RecordRepaymentModal: React.FC<RecordRepaymentModalProps> = ({
  isOpen,
  onClose,
  preselectedLoan,
  onSuccessReceipt,
}) => {
  const { loans, businessSettings, refreshAll } = useData();
  const { success, error } = useToast();

  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [repaymentType, setRepaymentType] = useState<LoanRepaymentType>('full_emi');
  const [amount, setAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const activeLoans = loans.filter((l) => l.status === 'active' || l.outstandingTotal > 0);
  const selectedLoan = loans.find((l) => l.id === selectedLoanId);

  // Calculate 1-month interest on current principal
  const calculatedMonthlyInterest = selectedLoan
    ? Math.round(selectedLoan.outstandingPrincipal * (selectedLoan.monthlyInterestRate / 100))
    : 0;

  useEffect(() => {
    let loanToUse: Loan | undefined;
    if (preselectedLoan) {
      setSelectedLoanId(preselectedLoan.id);
      loanToUse = preselectedLoan;
    } else if (activeLoans.length > 0) {
      setSelectedLoanId(activeLoans[0].id);
      loanToUse = activeLoans[0];
    }

    if (loanToUse) {
      const nextDue = loanToUse.installments.find((i) => i.status !== 'paid');
      setAmount(nextDue ? nextDue.remainingAmount : loanToUse.monthlyInstallment);
      setRepaymentType('full_emi');
    }

    setPaymentDate(new Date().toISOString().slice(0, 10));
    setPaymentMethod('UPI');
    setReferenceNumber('');
    setNotes('');
    setErrors({});
  }, [preselectedLoan, loans, isOpen]);

  const handleLoanChange = (lId: string) => {
    setSelectedLoanId(lId);
    const loan = loans.find((l) => l.id === lId);
    if (loan) {
      if (repaymentType === 'interest_only') {
        const monthlyInt = Math.round(loan.outstandingPrincipal * (loan.monthlyInterestRate / 100));
        setAmount(monthlyInt);
      } else {
        const nextDue = loan.installments.find((i) => i.status !== 'paid');
        setAmount(nextDue ? nextDue.remainingAmount : loan.monthlyInstallment);
      }
    }
  };

  const handleModeChange = (mode: LoanRepaymentType) => {
    setRepaymentType(mode);
    if (!selectedLoan) return;

    if (mode === 'interest_only') {
      const monthlyInt = Math.round(selectedLoan.outstandingPrincipal * (selectedLoan.monthlyInterestRate / 100));
      setAmount(monthlyInt > 0 ? monthlyInt : selectedLoan.outstandingInterest);
    } else if (mode === 'full_emi') {
      const nextDue = selectedLoan.installments.find((i) => i.status !== 'paid');
      setAmount(nextDue ? nextDue.remainingAmount : selectedLoan.monthlyInstallment);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!selectedLoanId) errs.loan = 'Please select a loan';
    if (!amount || amount <= 0) errs.amount = 'Repayment amount must be greater than ₹0';
    if (!paymentDate) errs.date = 'Payment date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!selectedLoan) return;

    setLoading(true);
    try {
      const result = await recordLoanRepayment(selectedLoan.id, {
        loanId: selectedLoan.id,
        amount,
        paymentType: repaymentType,
        paymentDate,
        paymentMethod,
        referenceNumber,
        notes: notes.trim() || (repaymentType === 'interest_only' ? 'Interest-only loan payment' : undefined),
      });

      await refreshAll();
      success(
        repaymentType === 'interest_only' ? 'Interest Payment Recorded' : 'Loan Repayment Recorded',
        `₹${amount.toLocaleString('en-IN')} ${repaymentType === 'interest_only' ? 'interest' : 'repayment'} recorded for Loan #${selectedLoan.loanNumber}`
      );

      if (onSuccessReceipt) {
        const receiptData: ReceiptData = {
          receiptNumber: result.receiptNumber,
          date: paymentDate,
          time: new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' }),
          memberId: selectedLoan.memberId,
          memberName: selectedLoan.memberName,
          memberCode: selectedLoan.memberCode,
          transactionType: repaymentType === 'interest_only' ? 'Loan Interest Payment' : 'Loan EMI Repayment',
          itemDescription: repaymentType === 'interest_only'
            ? `Monthly Loan Interest Paid (Loan #${selectedLoan.loanNumber})`
            : `Loan Installment Repayment (Loan #${selectedLoan.loanNumber})`,
          amount,
          amountInWords: numberToIndianWords(amount),
          paymentMethod,
          referenceNumber,
          loanNumber: selectedLoan.loanNumber,
          notes: notes || (repaymentType === 'interest_only' ? 'Monthly interest serviced; principal remains outstanding' : undefined),
          businessName: businessSettings.businessName,
          tagline: businessSettings.tagline,
          businessAddress: `${businessSettings.address}, ${businessSettings.cityStatePincode}`,
          businessPhone: businessSettings.phone,
          businessEmail: businessSettings.email,
          gstin: businessSettings.gstin,
          panNumber: businessSettings.panNumber,
          authorizedSignatoryTitle: businessSettings.authorizedSignatoryTitle,
        };
        onSuccessReceipt(receiptData);
      }

      onClose();
    } catch (err: any) {
      error('Repayment error', err.message || 'Failed to record repayment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Loan Repayment / Interest"
      subtitle="Collect Full EMI or Pay Only Interest on active loan account"
      size="lg"
      icon={<Receipt className="w-5 h-5 text-emerald-600" />}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            isLoading={loading}
            onClick={handleSubmit}
          >
            {repaymentType === 'interest_only' ? 'Record Interest Payment' : 'Record Repayment & Receipt'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Loan Selection */}
        <div>
          <Select
            label="Select Active Loan Account"
            required
            value={selectedLoanId}
            disabled={Boolean(preselectedLoan)}
            onChange={(e) => handleLoanChange(e.target.value)}
            options={[
              { value: '', label: '-- Choose Active Loan --' },
              ...activeLoans.map((l) => ({
                value: l.id,
                label: `${l.loanNumber} — ${l.memberName} (${l.memberCode}) • Principal: ₹${l.outstandingPrincipal.toLocaleString('en-IN')} • Rate: ${l.monthlyInterestRate}%/mo`,
              })),
            ]}
            error={errors.loan}
          />
        </div>

        {/* Selected Loan Snapshot Strip */}
        {selectedLoan && (
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-3 gap-3 text-center text-xs">
            <div>
              <p className="text-slate-400 uppercase font-semibold text-[10px]">Outstanding Principal</p>
              <p className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                {formatCurrency(selectedLoan.outstandingPrincipal)}
              </p>
            </div>
            <div>
              <p className="text-purple-600 uppercase font-semibold text-[10px]">Monthly Interest (@ {selectedLoan.monthlyInterestRate}%/mo)</p>
              <p className="text-sm font-bold font-mono text-purple-700 mt-0.5">
                {formatCurrency(calculatedMonthlyInterest)}/mo
              </p>
            </div>
            <div>
              <p className="text-amber-700 uppercase font-semibold text-[10px]">Total Balance Due</p>
              <p className="text-sm font-bold font-mono text-amber-700 mt-0.5">
                {formatCurrency(selectedLoan.outstandingTotal)}
              </p>
            </div>
          </div>
        )}

        {/* Repayment Option Switcher: Full EMI vs Pay Only Interest vs Custom */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Select Payment Option
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Option 1: Full EMI */}
            <button
              type="button"
              onClick={() => handleModeChange('full_emi')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                repaymentType === 'full_emi'
                  ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Full EMI</span>
                {repaymentType === 'full_emi' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Principal + Interest
              </p>
              {selectedLoan && (
                <p className="text-xs font-mono font-bold text-emerald-800 mt-2">
                  {formatCurrency(selectedLoan.monthlyInstallment)}
                </p>
              )}
            </button>

            {/* Option 2: Pay Only Interest */}
            <button
              type="button"
              onClick={() => handleModeChange('interest_only')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                repaymentType === 'interest_only'
                  ? 'border-purple-600 bg-purple-50/90 ring-2 ring-purple-500/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-950 flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-purple-600" /> Pay Only Interest
                </span>
                {repaymentType === 'interest_only' && (
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-purple-800 mt-1">
                100% Interest Only
              </p>
              {selectedLoan && (
                <p className="text-xs font-mono font-bold text-purple-700 mt-2">
                  {formatCurrency(calculatedMonthlyInterest)}/mo
                </p>
              )}
            </button>

            {/* Option 3: Custom Amount */}
            <button
              type="button"
              onClick={() => handleModeChange('custom')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                repaymentType === 'custom'
                  ? 'border-slate-800 bg-slate-100 ring-2 ring-slate-400/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Custom Amount</span>
                {repaymentType === 'custom' && (
                  <CheckCircle2 className="w-4 h-4 text-slate-700 shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Partial or Extra Part
              </p>
              <p className="text-xs font-mono font-bold text-slate-700 mt-2">
                Custom Entry
              </p>
            </button>
          </div>
        </div>

        {/* Quick Month Selector if Interest-Only is active */}
        {repaymentType === 'interest_only' && selectedLoan && (
          <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-purple-900 font-semibold text-xs">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Quick Interest Multipliers:</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-0.5">
              {[1, 2, 3, 6].map((months) => {
                const totalInt = calculatedMonthlyInterest * months;
                return (
                  <button
                    type="button"
                    key={months}
                    onClick={() => setAmount(totalInt)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      amount === totalInt
                        ? 'bg-purple-700 text-white shadow-xs'
                        : 'bg-white text-purple-800 hover:bg-purple-100 border border-purple-200'
                    }`}
                  >
                    {months} Mo Interest ({formatCurrency(totalInt)})
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-purple-800 leading-relaxed pt-1">
              💡 <strong>Interest-Only Mode:</strong> This payment covers the loan interest for the selected period. The principal loan balance of <strong>{formatCurrency(selectedLoan.outstandingPrincipal)}</strong> remains unchanged.
            </p>
          </div>
        )}

        {/* Amount & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label={
                repaymentType === 'interest_only'
                  ? 'Interest Amount to Pay (₹)'
                  : 'Repayment Amount (₹)'
              }
              type="number"
              prefixText="₹"
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              error={errors.amount}
            />
          </div>

          <div>
            <Input
              label="Payment Date"
              type="date"
              required
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              error={errors.date}
            />
          </div>

          <div>
            <Select
              label="Payment Method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              options={PAYMENT_METHODS.map((m) => ({ value: m, label: m }))}
            />
          </div>

          <div>
            <Input
              label="Reference / UTR / Cheque Number"
              placeholder="e.g. UPI Ref / Cheque No"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Input
            label="Remarks / Notes"
            placeholder={
              repaymentType === 'interest_only'
                ? 'e.g. Paid 1 month interest for October 2026'
                : 'e.g. Cleared installment #5 on time via UPI'
            }
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Summary Card */}
        <div
          className={`p-4 rounded-xl border flex items-center justify-between ${
            repaymentType === 'interest_only'
              ? 'bg-purple-50/80 border-purple-200 text-purple-950'
              : 'bg-emerald-50/70 border-emerald-200/80 text-emerald-950'
          }`}
        >
          <div>
            <p className="text-xs font-semibold">
              {repaymentType === 'interest_only'
                ? 'Total Interest Collected (Interest Only)'
                : 'Total EMI Repayment Collected'}
            </p>
            <p className="text-xs opacity-75 mt-0.5">{numberToIndianWords(amount)}</p>
          </div>
          <span className="text-xl font-bold font-mono">
            {formatCurrency(amount)}
          </span>
        </div>
      </form>
    </Modal>
  );
};
