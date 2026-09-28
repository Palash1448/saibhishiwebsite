import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import type { MonthlyCollection, PaymentMethod } from '../../types/collection';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { recordMonthlyPayment, createCollectionScheduleEntry } from '../../services/collectionService';
import { PAYMENT_METHODS } from '../../constants/categories';
import type { ReceiptData } from '../../utils/receiptGenerator';
import { numberToIndianWords, formatCurrency } from '../../utils/formatters';
import { CircleDollarSign } from 'lucide-react';

interface RecordCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCollection?: MonthlyCollection | null;
  onSuccessReceipt?: (receipt: ReceiptData) => void;
}

export const RecordCollectionModal: React.FC<RecordCollectionModalProps> = ({
  isOpen,
  onClose,
  preselectedCollection,
  onSuccessReceipt,
}) => {
  const { members, plans, collections, businessSettings, refreshAll } = useData();
  const { success, error } = useToast();

  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  const [amount, setAmount] = useState<number>(5000);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (preselectedCollection) {
      setSelectedMemberId(preselectedCollection.memberId);
      setSelectedCollectionId(preselectedCollection.id);
      setAmount(preselectedCollection.remainingAmount || preselectedCollection.expectedAmount);
      setPaymentMethod(preselectedCollection.paymentMethod || 'UPI');
      setReferenceNumber(preselectedCollection.referenceNumber || '');
      setNotes(preselectedCollection.notes || '');
    } else {
      if (members.length > 0) {
        setSelectedMemberId(members[0].id);
        setAmount(members[0].monthlyContribution || 5000);
      }
      setSelectedCollectionId('');
      setPaymentDate(new Date().toISOString().slice(0, 10));
      setPaymentMethod('UPI');
      setReferenceNumber('');
      setNotes('');
    }
    setErrors({});
  }, [preselectedCollection, members, isOpen]);

  const handleMemberChange = (mId: string) => {
    setSelectedMemberId(mId);
    const m = members.find((mem) => mem.id === mId);
    if (m) {
      setAmount(m.monthlyContribution || 5000);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!selectedMemberId) errs.member = 'Please select a member';
    if (!amount || amount <= 0) errs.amount = 'Amount must be greater than ₹0';
    if (!paymentDate) errs.date = 'Payment date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const member = members.find((m) => m.id === selectedMemberId);
      if (!member) throw new Error('Member not found');

      let targetColId = selectedCollectionId;

      // If no specific collection schedule entry existed, find or create one
      if (!targetColId) {
        const currentMonth = new Date(paymentDate).getMonth() + 1;
        const currentYear = new Date(paymentDate).getFullYear();
        const existingCol = collections.find(
          (c) => c.memberId === member.id && c.month === currentMonth && c.year === currentYear
        );

        if (existingCol) {
          targetColId = existingCol.id;
        } else {
          const newEntry = await createCollectionScheduleEntry({
            memberId: member.id,
            memberName: member.fullName,
            memberCode: member.memberCode,
            bhishiPlanId: member.bhishiPlanId || plans[0]?.id || 'BP-101',
            bhishiPlanName: member.bhishiPlanName || plans[0]?.planName || 'Standard Plan',
            month: currentMonth,
            year: currentYear,
            monthYearLabel: `${new Date(paymentDate).toLocaleString('default', { month: 'long' })} ${currentYear}`,
            installmentNumber: 1,
            expectedAmount: amount,
            dueDate: paymentDate,
          });
          targetColId = newEntry.id;
        }
      }

      const result = await recordMonthlyPayment(targetColId, {
        paidAmount: amount,
        paymentDate,
        paymentMethod,
        referenceNumber,
        notes,
        receiptPrefix: businessSettings.receiptPrefix,
      });

      await refreshAll();
      success('Collection Recorded', `₹${amount} recorded for ${member.fullName}. Receipt #${result.receiptNumber}`);

      if (onSuccessReceipt) {
        const receiptData: ReceiptData = {
          receiptNumber: result.receiptNumber,
          date: paymentDate,
          time: new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' }),
          memberId: member.id,
          memberName: member.fullName,
          memberCode: member.memberCode,
          mobile: member.mobile,
          address: member.address,
          transactionType: 'Monthly Bhishi Collection',
          itemDescription: `Bhishi Monthly Installment (${result.collection.monthYearLabel})`,
          amount,
          amountInWords: numberToIndianWords(amount),
          paymentMethod,
          referenceNumber,
          bhishiPlanName: result.collection.bhishiPlanName,
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
      error('Collection error', err.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Monthly Collection"
      subtitle="Collect Bhishi installment and issue instant receipt"
      size="lg"
      icon={<CircleDollarSign className="w-5 h-5" />}
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
            Record & Generate Receipt
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Select
            label="Select Member"
            required
            value={selectedMemberId}
            disabled={Boolean(preselectedCollection)}
            onChange={(e) => handleMemberChange(e.target.value)}
            options={[
              { value: '', label: '-- Choose Member --' },
              ...members.map((m) => ({
                value: m.id,
                label: `${m.fullName} (${m.memberCode}) — ${m.bhishiPlanName || 'Plan'} (₹${m.monthlyContribution}/mo)`,
              })),
            ]}
            error={errors.member}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Amount Collected (₹)"
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
              label="Reference / UTR / Cheque No."
              placeholder="e.g. UPI Ref / Cheque 123456"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              helperText="Optional for cash payments"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Remarks / Collection Note
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Paid in full via GPay QR"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Live Calculation Box */}
        <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-900">Total Collection Amount</p>
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
