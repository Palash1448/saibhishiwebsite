import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import type { Loan } from '../../types/loan';
import type { PaymentMethod } from '../../types/collection';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { recordLoanRepayment } from '../../services/loanService';
import { PAYMENT_METHODS } from '../../constants/categories';
import type { ReceiptData } from '../../utils/receiptGenerator';
import { numberToIndianWords, formatCurrency } from '../../utils/formatters';
import { Receipt } from 'lucide-react';

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
  const [amount, setAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const activeLoans = loans.filter((l) => l.status === 'active' || l.outstandingTotal > 0);

  useEffect(() => {
    if (preselectedLoan) {
      setSelectedLoanId(preselectedLoan.id);
      const nextDue = preselectedLoan.installments.find((i) => i.status !== 'paid');
      setAmount(nextDue ? nextDue.remainingAmount : preselectedLoan.monthlyInstallment);
    } else if (activeLoans.length > 0) {
      setSelectedLoanId(activeLoans[0].id);
      const nextDue = activeLoans[0].installments.find((i) => i.status !== 'paid');
      setAmount(nextDue ? nextDue.remainingAmount : activeLoans[0].monthlyInstallment);
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
      const nextDue = loan.installments.find((i) => i.status !== 'paid');
      setAmount(nextDue ? nextDue.remainingAmount : loan.monthlyInstallment);
    }
  };

  const selectedLoan = loans.find((l) => l.id === selectedLoanId);

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
        installmentNumbers: [1],
        amount,
        paymentDate,
        paymentMethod,
        referenceNumber,
        notes,
      });

      await refreshAll();
      success('Loan Repayment Recorded', `₹${amount} recorded for Loan #${selectedLoan.loanNumber}`);

      if (onSuccessReceipt) {
        const receiptData: ReceiptData = {
          receiptNumber: result.receiptNumber,
          date: paymentDate,
          time: new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' }),
          memberId: selectedLoan.memberId,
          memberName: selectedLoan.memberName,
          memberCode: selectedLoan.memberCode,
          transactionType: 'Loan EMI Repayment',
          itemDescription: `Loan Repayment (#${selectedLoan.loanNumber})`,
          amount,
          amountInWords: numberToIndianWords(amount),
          paymentMethod,
          referenceNumber,
          loanNumber: selectedLoan.loanNumber,
          notes,
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
      title="Record Loan Repayment"
      subtitle="Collect EMI repayment, update loan schedule, and issue receipt"
      size="lg"
      icon={<Receipt className="w-5 h-5" />}
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
            Record Repayment & Print Receipt
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Select
            label="Select Active Loan"
            required
            value={selectedLoanId}
            disabled={Boolean(preselectedLoan)}
            onChange={(e) => handleLoanChange(e.target.value)}
            options={[
              { value: '', label: '-- Choose Active Loan --' },
              ...activeLoans.map((l) => ({
                value: l.id,
                label: `${l.loanNumber} — ${l.memberName} (Bal: ₹${l.outstandingTotal.toLocaleString('en-IN')})`,
              })),
            ]}
            error={errors.loan}
          />
        </div>

        {selectedLoan && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-3 gap-3 text-center text-xs">
            <div>
              <p className="text-slate-500 uppercase font-semibold">Principal Sanctioned</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{formatCurrency(selectedLoan.principalAmount)}</p>
            </div>
            <div>
              <p className="text-slate-500 uppercase font-semibold">Total Repaid</p>
              <p className="text-sm font-bold text-emerald-600 mt-0.5">{formatCurrency(selectedLoan.totalAmountPaid)}</p>
            </div>
            <div>
              <p className="text-slate-500 uppercase font-semibold">Current Balance Due</p>
              <p className="text-sm font-bold text-amber-700 mt-0.5">{formatCurrency(selectedLoan.outstandingTotal)}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Repayment Amount (₹)"
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
            placeholder="e.g. Cleared installment #5 on time via UPI"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-900">Total EMI Paid</p>
            <p className="text-xs text-emerald-700 mt-0.5">{numberToIndianWords(amount)}</p>
          </div>
          <span className="text-xl font-bold font-mono text-emerald-900">
            {formatCurrency(amount)}
          </span>
        </div>
      </form>
    </Modal>
  );
};
