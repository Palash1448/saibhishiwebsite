import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import type { LoanCalculationMethod } from '../../types/loan';
import type { PaymentMethod } from '../../types/collection';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { issueLoan } from '../../services/loanService';
import { calculateEMI } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';
import { PAYMENT_METHODS } from '../../constants/categories';
import { CreditCard, Calculator, Info } from 'lucide-react';

interface IssueLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedMemberId?: string;
  onSuccess?: () => void;
}

export const IssueLoanModal: React.FC<IssueLoanModalProps> = ({
  isOpen,
  onClose,
  preselectedMemberId,
  onSuccess,
}) => {
  const { members, financeSettings, refreshAll } = useData();
  const { success, error } = useToast();

  const [memberId, setMemberId] = useState(preselectedMemberId || '');
  const [principalAmount, setPrincipalAmount] = useState<number>(100000);
  const [monthlyInterestRate, setMonthlyInterestRate] = useState<number>(
    financeSettings.defaultMonthlyLoanInterestRate || 2
  );
  const [durationMonths, setDurationMonths] = useState<number>(12);
  const [calculationMethod, setCalculationMethod] = useState<LoanCalculationMethod>(
    financeSettings.defaultLoanCalculationMethod || 'flat'
  );
  const [processingFeeRate, setProcessingFeeRate] = useState<number>(
    financeSettings.defaultProcessingFeeRate || 1
  );
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [firstDueDate, setFirstDueDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [purpose, setPurpose] = useState('');
  const [guarantorName, setGuarantorName] = useState('');
  const [guarantorMobile, setGuarantorMobile] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (preselectedMemberId) {
      setMemberId(preselectedMemberId);
    } else if (members.length > 0 && !memberId) {
      setMemberId(members[0].id);
    }

    // Default first due date 1 month after issue date
    const d = new Date(issueDate);
    d.setMonth(d.getMonth() + 1);
    setFirstDueDate(d.toISOString().slice(0, 10));
  }, [preselectedMemberId, members, issueDate, isOpen]);

  // Live EMI calculation
  const emiCalc = calculateEMI(
    principalAmount,
    monthlyInterestRate,
    durationMonths,
    calculationMethod,
    processingFeeRate
  );

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!memberId) errs.member = 'Please select a member';
    if (!principalAmount || principalAmount <= 0) errs.principal = 'Loan amount must be greater than ₹0';
    if (monthlyInterestRate < 0) errs.rate = 'Interest rate cannot be negative';
    if (!durationMonths || durationMonths <= 0) errs.duration = 'Duration must be at least 1 month';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const selectedMember = members.find((m) => m.id === memberId);
      if (!selectedMember) throw new Error('Selected member was not found');

      await issueLoan({
        memberId: selectedMember.id,
        memberName: selectedMember.fullName,
        memberCode: selectedMember.memberCode,
        principalAmount,
        monthlyInterestRate,
        durationMonths,
        calculationMethod,
        processingFeeRate,
        issueDate,
        firstDueDate,
        paymentMethod,
        referenceNumber,
        purpose,
        guarantorName,
        guarantorMobile,
        notes,
      });

      await refreshAll();
      success('Loan Disbursed', `₹${principalAmount} loan sanctioned to ${selectedMember.fullName}.`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      error('Loan sanction error', err.message || 'Failed to issue loan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sanction & Issue Loan"
      subtitle="Configure principal, custom monthly interest rate, and schedule"
      size="xl"
      icon={<CreditCard className="w-5 h-5" />}
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
            Disburse Loan
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Member Selection */}
        <div>
          <Select
            label="Borrower / Member"
            required
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            options={[
              { value: '', label: '-- Choose Borrower Member --' },
              ...members.map((m) => ({
                value: m.id,
                label: `${m.fullName} (${m.memberCode}) — Outstanding Loan: ₹${m.outstandingLoan || 0}`,
              })),
            ]}
            error={errors.member}
          />
        </div>

        {/* Step 2: Loan Financial Parameters */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 pb-1 border-b border-slate-100">
            Loan Configuration & Rate Setup
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Input
                label="Principal Amount (₹)"
                type="number"
                prefixText="₹"
                required
                value={principalAmount}
                onChange={(e) => setPrincipalAmount(Number(e.target.value))}
                error={errors.principal}
              />
            </div>

            <div>
              <Input
                label="Monthly Interest Rate (%)"
                type="number"
                step="0.01"
                suffixText="% / month"
                required
                value={monthlyInterestRate}
                onChange={(e) => setMonthlyInterestRate(Number(e.target.value))}
                helperText={`Annual Equivalent: ${(monthlyInterestRate * 12).toFixed(2)}% p.a.`}
                error={errors.rate}
              />
            </div>

            <div>
              <Input
                label="Tenure / Duration"
                type="number"
                min={1}
                max={60}
                suffixText="Months"
                required
                value={durationMonths}
                onChange={(e) => setDurationMonths(Number(e.target.value))}
                error={errors.duration}
              />
            </div>

            <div>
              <Select
                label="Calculation Method"
                value={calculationMethod}
                onChange={(e) => setCalculationMethod(e.target.value as LoanCalculationMethod)}
                options={[
                  { value: 'flat', label: 'Flat Rate Interest (Simple EMI)' },
                  { value: 'reducing_balance', label: 'Reducing Balance (Standard Bank EMI)' },
                  { value: 'interest_only', label: 'Interest-Only (Monthly Interest • Principal at End)' },
                ]}
              />
            </div>

            <div>
              <Input
                label="Processing Fee (%)"
                type="number"
                step="0.1"
                suffixText="%"
                value={processingFeeRate}
                onChange={(e) => setProcessingFeeRate(Number(e.target.value))}
                helperText={`Fee: ${formatCurrency(emiCalc.processingFee)}`}
              />
            </div>

            <div>
              <Input
                label="Disbursement Date"
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Live EMI Breakdown Preview Card */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-navy-950 p-5 text-white shadow-elevated border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Live Repayment Breakdown ({calculationMethod === 'flat' ? 'Flat Interest' : 'Reducing Balance'})
              </span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {monthlyInterestRate}% / mo
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
              <p className="text-[11px] text-slate-400 uppercase font-medium">Monthly EMI</p>
              <p className="text-lg sm:text-xl font-bold font-mono text-emerald-400 mt-1">
                {formatCurrency(emiCalc.monthlyInstallment)}
              </p>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
              <p className="text-[11px] text-slate-400 uppercase font-medium">Total Interest</p>
              <p className="text-lg sm:text-xl font-bold font-mono text-amber-300 mt-1">
                {formatCurrency(emiCalc.totalInterest)}
              </p>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
              <p className="text-[11px] text-slate-400 uppercase font-medium">Processing Fee</p>
              <p className="text-lg sm:text-xl font-bold font-mono text-slate-300 mt-1">
                {formatCurrency(emiCalc.processingFee)}
              </p>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
              <p className="text-[11px] text-slate-400 uppercase font-medium">Total Payable</p>
              <p className="text-lg sm:text-xl font-bold font-mono text-white mt-1">
                {formatCurrency(emiCalc.totalPayable)}
              </p>
            </div>
          </div>
        </div>

        {/* Step 3: Disbursement & Guarantor Info */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 pb-1 border-b border-slate-100">
            Disbursement & Guarantor Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Select
                label="Disbursement Mode"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                options={PAYMENT_METHODS.map((m) => ({ value: m, label: m }))}
              />
            </div>

            <div>
              <Input
                label="Reference / Cheque / UTR"
                placeholder="e.g. NEFT123456 / Cheque 9981"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
              />
            </div>

            <div>
              <Input
                label="Loan Purpose"
                placeholder="e.g. Business Working Capital"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </div>

            <div>
              <Input
                label="Guarantor Name (Optional)"
                placeholder="e.g. Sunita Sharma"
                value={guarantorName}
                onChange={(e) => setGuarantorName(e.target.value)}
              />
            </div>

            <div>
              <Input
                label="Guarantor Mobile"
                type="tel"
                placeholder="10-digit phone"
                value={guarantorMobile}
                onChange={(e) => setGuarantorMobile(e.target.value)}
              />
            </div>

            <div>
              <Input
                label="Special Notes"
                placeholder="Collateral or approval remarks"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};
