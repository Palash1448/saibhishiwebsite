import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import type { ExpenseCategory } from '../../types/expense';
import type { PaymentMethod } from '../../types/collection';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { createExpense } from '../../services/expenseService';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../../constants/categories';
import { TrendingDown } from 'lucide-react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { refreshAll } = useData();
  const { success, error } = useToast();

  const [category, setCategory] = useState<ExpenseCategory>('Office');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [recipientName, setRecipientName] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!amount || amount <= 0) errs.amount = 'Amount must be greater than ₹0';
    if (!description.trim()) errs.description = 'Expense description is required';
    if (!date) errs.date = 'Date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await createExpense({
        category,
        amount,
        date,
        paymentMethod,
        recipientName,
        description,
        notes,
        recordedBy: 'Admin',
      });

      await refreshAll();
      success('Expense Added', `₹${amount} recorded under ${category}.`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      error('Expense error', err.message || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Business Expense"
      subtitle="Track office rent, salaries, utilities, and daily operations"
      size="md"
      icon={<TrendingDown className="w-5 h-5 text-rose-600" />}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            isLoading={loading}
            onClick={handleSubmit}
          >
            Record Outflow Expense
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Select
              label="Expense Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              options={EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }))}
            />
          </div>

          <div>
            <Input
              label="Amount (₹)"
              type="number"
              prefixText="₹"
              required
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              error={errors.amount}
            />
          </div>

          <div>
            <Input
              label="Expense Date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
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
        </div>

        <div>
          <Input
            label="Paid To / Vendor / Recipient"
            placeholder="e.g. Landlord Name / Electric Board / Staff"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
          />
        </div>

        <div>
          <Input
            label="Description / Purpose"
            placeholder="e.g. Office branch monthly electricity charges"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={errors.description}
          />
        </div>

        <div>
          <Input
            label="Remarks / Reference"
            placeholder="Invoice / Bill number or note"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
};
