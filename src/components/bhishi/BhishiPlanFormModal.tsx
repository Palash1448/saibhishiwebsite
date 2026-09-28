import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import type { BhishiPlan, BhishiPlanStatus, CalculationMethod } from '../../types/bhishi';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { createBhishiPlan, updateBhishiPlan } from '../../services/bhishiService';
import { calculateMaturityAmount } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';
import { Layers, Calculator } from 'lucide-react';

interface BhishiPlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  planToEdit?: BhishiPlan | null;
  onSuccess?: () => void;
}

export const BhishiPlanFormModal: React.FC<BhishiPlanFormModalProps> = ({
  isOpen,
  onClose,
  planToEdit,
  onSuccess,
}) => {
  const { financeSettings, refreshAll } = useData();
  const { success, error } = useToast();

  const [planName, setPlanName] = useState('');
  const [planCode, setPlanCode] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState<number>(5000);
  const [durationMonths, setDurationMonths] = useState<number>(20);
  const [annualInterestRate, setAnnualInterestRate] = useState<number>(
    financeSettings.defaultAnnualReturnRate || 12
  );
  const [returnCalculationMethod, setReturnCalculationMethod] = useState<CalculationMethod>(
    financeSettings.defaultBhishiCalculationMethod || 'simple'
  );
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentDueDay, setPaymentDueDay] = useState<number>(10);
  const [status, setStatus] = useState<BhishiPlanStatus>('active');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (planToEdit) {
      setPlanName(planToEdit.planName);
      setPlanCode(planToEdit.planCode);
      setMonthlyContribution(planToEdit.monthlyContribution);
      setDurationMonths(planToEdit.durationMonths);
      setAnnualInterestRate(planToEdit.annualInterestRate);
      setReturnCalculationMethod(planToEdit.returnCalculationMethod);
      setStartDate(planToEdit.startDate);
      setPaymentDueDay(planToEdit.paymentDueDay);
      setStatus(planToEdit.status);
      setDescription(planToEdit.description || '');
    } else {
      setPlanName('');
      setPlanCode('');
      setMonthlyContribution(5000);
      setDurationMonths(20);
      setAnnualInterestRate(financeSettings.defaultAnnualReturnRate || 12);
      setReturnCalculationMethod(financeSettings.defaultBhishiCalculationMethod || 'simple');
      setStartDate(new Date().toISOString().slice(0, 10));
      setPaymentDueDay(10);
      setStatus('active');
      setDescription('');
    }
    setErrors({});
  }, [planToEdit, financeSettings, isOpen]);

  // Live Maturity Calculation
  const maturity = calculateMaturityAmount(
    monthlyContribution,
    durationMonths,
    annualInterestRate,
    returnCalculationMethod
  );

  // Compute End Date
  const computedEndDate = (() => {
    try {
      const d = new Date(startDate);
      d.setMonth(d.getMonth() + durationMonths);
      return d.toISOString().slice(0, 10);
    } catch {
      return '';
    }
  })();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!planName.trim()) errs.planName = 'Plan name is required';
    if (!monthlyContribution || monthlyContribution <= 0) errs.contribution = 'Monthly contribution must be greater than ₹0';
    if (!durationMonths || durationMonths <= 0) errs.duration = 'Duration must be at least 1 month';
    if (annualInterestRate < 0) errs.rate = 'Interest rate cannot be negative';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (planToEdit) {
        await updateBhishiPlan(planToEdit.id, {
          planName,
          planCode,
          monthlyContribution,
          durationMonths,
          annualInterestRate,
          returnCalculationMethod,
          startDate,
          endDate: computedEndDate,
          paymentDueDay,
          status,
          description,
        });

        await refreshAll();
        success('Plan Updated', `${planName} settings updated successfully.`);
      } else {
        await createBhishiPlan({
          planName,
          planCode,
          monthlyContribution,
          durationMonths,
          annualInterestRate,
          returnCalculationMethod,
          startDate,
          endDate: computedEndDate,
          paymentDueDay,
          status,
          description,
        });

        await refreshAll();
        success('Plan Created', `${planName} has been created and is active for enrollment.`);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      error('Bhishi Plan Error', err.message || 'Failed to save plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={planToEdit ? 'Edit Bhishi Plan' : 'Create New Bhishi Plan'}
      subtitle="Configure monthly installment, duration, and return calculation rules"
      size="lg"
      icon={<Layers className="w-5 h-5 text-emerald-600" />}
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
            {planToEdit ? 'Save Plan' : 'Launch Plan'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Bhishi Plan Name"
              placeholder="e.g. Gold Prosperity 2026 — ₹5,000/mo"
              required
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              error={errors.planName}
            />
          </div>

          <div>
            <Input
              label="Monthly Contribution (₹)"
              type="number"
              prefixText="₹"
              required
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              error={errors.contribution}
            />
          </div>

          <div>
            <Input
              label="Plan Duration (Months)"
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
            <Input
              label="Annual Return / Interest Rate (%)"
              type="number"
              step="0.1"
              suffixText="% p.a."
              required
              value={annualInterestRate}
              onChange={(e) => setAnnualInterestRate(Number(e.target.value))}
              error={errors.rate}
            />
          </div>

          <div>
            <Select
              label="Return Calculation Engine"
              value={returnCalculationMethod}
              onChange={(e) => setReturnCalculationMethod(e.target.value as CalculationMethod)}
              options={[
                { value: 'simple', label: 'Recurring Simple Interest (Standard)' },
                { value: 'compounded_annual', label: 'Compounded Annual Growth' },
                { value: 'fixed_bonus', label: 'Fixed Completion Bonus %' },
                { value: 'flat_rate', label: 'Proportional Flat Rate' },
              ]}
            />
          </div>

          <div>
            <Input
              label="Start Date"
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <Input
              label="Payment Due Day of Month"
              type="number"
              min={1}
              max={31}
              value={paymentDueDay}
              onChange={(e) => setPaymentDueDay(Number(e.target.value))}
              helperText="e.g. 10th of every month"
            />
          </div>
        </div>

        {/* Calculation Engine Breakdown Panel */}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-900 to-slate-900 p-5 text-white shadow-elevated border border-emerald-800">
          <div className="flex items-center justify-between border-b border-emerald-800/80 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-300" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                Plan Maturity & Returns Breakdown
              </span>
            </div>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 font-semibold border border-emerald-400/40">
              {annualInterestRate}% p.a. • {durationMonths} Mo
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xs">
              <p className="text-[11px] text-emerald-200 uppercase font-medium">Total Principal</p>
              <p className="text-lg font-bold font-mono text-white mt-1">
                {formatCurrency(maturity.totalPrincipal)}
              </p>
            </div>

            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xs">
              <p className="text-[11px] text-emerald-200 uppercase font-medium">Estimated Interest</p>
              <p className="text-lg font-bold font-mono text-emerald-300 mt-1">
                +{formatCurrency(maturity.totalInterest)}
              </p>
            </div>

            <div className="bg-emerald-500/20 p-3 rounded-xl backdrop-blur-xs border border-emerald-400/30">
              <p className="text-[11px] text-emerald-200 uppercase font-medium">Maturity Payout</p>
              <p className="text-lg font-extrabold font-mono text-emerald-200 mt-1">
                {formatCurrency(maturity.maturityAmount)}
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Plan Description / Highlights
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain eligibility, payout cycle, and terms for members..."
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </form>
    </Modal>
  );
};
