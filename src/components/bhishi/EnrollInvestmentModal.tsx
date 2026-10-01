import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import type { Member } from '../../types/member';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { enrollMemberInInvestment } from '../../services/bhishiService';
import { calculateMaturityAmount, roundToTwo } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';
import { TrendingUp, Coins, Percent, Calendar, Sparkles, AlertCircle, Clock } from 'lucide-react';

interface EnrollInvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedMember?: Member | null;
  onSuccess?: () => void;
}

const COMMON_AMOUNTS = [1000, 2000, 3000, 5000, 10000, 20000, 50000];
const COMMON_MONTHLY_RATES = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
const COMMON_CUTOFF_DAYS = [5, 10, 15, 20];
const COMMON_TENURES = [
  { months: 12, label: '12 Months (1 Year)' },
  { months: 20, label: '20 Months' },
  { months: 24, label: '24 Months (2 Years)' },
  { months: 36, label: '36 Months (3 Years)' },
  { months: 60, label: '60 Months (5 Years)' },
];

export const EnrollInvestmentModal: React.FC<EnrollInvestmentModalProps> = ({
  isOpen,
  onClose,
  preselectedMember,
  onSuccess,
}) => {
  const { members, plans, financeSettings, refreshAll } = useData();
  const { success, error } = useToast();

  const [selectedMemberId, setSelectedMemberId] = useState(preselectedMember?.id || '');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('custom-plan');
  const [monthlyContribution, setMonthlyContribution] = useState<number>(
    preselectedMember?.monthlyContribution || 5000
  );
  const [monthlyReturnRate, setMonthlyReturnRate] = useState<number>(
    preselectedMember?.monthlyReturnRate ??
      (preselectedMember?.annualReturnRate ? preselectedMember.annualReturnRate / 12 : financeSettings.defaultMonthlyReturnRate || 1.0)
  );
  const [interestCutoffDay, setInterestCutoffDay] = useState<number>(
    preselectedMember?.interestCutoffDay || financeSettings.defaultInterestCutoffDay || 10
  );
  const [durationMonths, setDurationMonths] = useState<number>(
    preselectedMember?.durationMonths || 20
  );
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (preselectedMember) {
      setSelectedMemberId(preselectedMember.id);
      if (preselectedMember.monthlyContribution) {
        setMonthlyContribution(preselectedMember.monthlyContribution);
      }
      if (preselectedMember.monthlyReturnRate !== undefined) {
        setMonthlyReturnRate(preselectedMember.monthlyReturnRate);
      } else if (preselectedMember.annualReturnRate) {
        setMonthlyReturnRate(roundToTwo(preselectedMember.annualReturnRate / 12));
      }
      if (preselectedMember.interestCutoffDay) {
        setInterestCutoffDay(preselectedMember.interestCutoffDay);
      }
      if (preselectedMember.bhishiPlanId) {
        setSelectedPlanId(preselectedMember.bhishiPlanId);
      }
      if (preselectedMember.durationMonths) {
        setDurationMonths(preselectedMember.durationMonths);
      }
    } else if (members.length > 0 && !selectedMemberId) {
      setSelectedMemberId(members[0].id);
      if (members[0].monthlyContribution) {
        setMonthlyContribution(members[0].monthlyContribution);
      }
      if (members[0].monthlyReturnRate !== undefined) {
        setMonthlyReturnRate(members[0].monthlyReturnRate);
      }
      if (members[0].interestCutoffDay) {
        setInterestCutoffDay(members[0].interestCutoffDay);
      }
    }
  }, [preselectedMember, members, isOpen, financeSettings]);

  // When a predefined plan is selected, autofill defaults while still allowing customization
  const handlePlanChange = (pId: string) => {
    setSelectedPlanId(pId);
    if (pId === 'custom-plan') return;

    const plan = plans.find((p) => p.id === pId);
    if (plan) {
      setMonthlyContribution(plan.monthlyContribution);
      const mRate = plan.monthlyReturnRate ?? roundToTwo(plan.annualInterestRate / 12);
      setMonthlyReturnRate(mRate);
      setInterestCutoffDay(plan.interestCutoffDay || plan.paymentDueDay || 10);
      setDurationMonths(plan.durationMonths);
    }
  };

  const handleMemberChange = (mId: string) => {
    setSelectedMemberId(mId);
    const m = members.find((mem) => mem.id === mId);
    if (m) {
      if (m.monthlyContribution) setMonthlyContribution(m.monthlyContribution);
      if (m.monthlyReturnRate !== undefined) {
        setMonthlyReturnRate(m.monthlyReturnRate);
      } else if (m.annualReturnRate) {
        setMonthlyReturnRate(roundToTwo(m.annualReturnRate / 12));
      }
      if (m.interestCutoffDay) setInterestCutoffDay(m.interestCutoffDay);
      if (m.bhishiPlanId) setSelectedPlanId(m.bhishiPlanId);
    }
  };

  const annualEquivalent = roundToTwo(monthlyReturnRate * 12);

  // Live Calculations
  const maturity = calculateMaturityAmount(
    monthlyContribution,
    durationMonths,
    annualEquivalent,
    'simple'
  );

  const monthlyReturnPerInstallment = roundToTwo(monthlyContribution * (monthlyReturnRate / 100));
  const annualDeposit = monthlyContribution * 12;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!selectedMemberId) errs.member = 'Please select a member';
    if (!monthlyContribution || monthlyContribution <= 0) {
      errs.contribution = 'Monthly investment must be greater than ₹0';
    }
    if (monthlyReturnRate < 0) {
      errs.rate = 'Return rate cannot be negative';
    }
    if (!interestCutoffDay || interestCutoffDay < 1 || interestCutoffDay > 31) {
      errs.cutoff = 'Cutoff day must be between 1 and 31';
    }
    if (!durationMonths || durationMonths <= 0) {
      errs.duration = 'Duration must be at least 1 month';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const member = members.find((m) => m.id === selectedMemberId);
    if (!member) return;

    const plan = plans.find((p) => p.id === selectedPlanId);
    const planName = plan
      ? plan.planName
      : `Custom Investment (₹${monthlyContribution.toLocaleString('en-IN')}/mo @ ${monthlyReturnRate}%/mo • Cutoff: ${interestCutoffDay}th)`;

    setLoading(true);
    try {
      await enrollMemberInInvestment({
        memberId: member.id,
        memberName: member.fullName,
        memberCode: member.memberCode,
        planId: selectedPlanId,
        planName,
        monthlyContribution,
        monthlyReturnRate,
        annualReturnRate: annualEquivalent,
        interestCutoffDay,
        paymentDueDay: interestCutoffDay,
        durationMonths,
        startDate,
        notes,
      });

      await refreshAll();
      success(
        'Investment Configured',
        `Enrolled ${member.fullName} with ₹${monthlyContribution.toLocaleString('en-IN')}/month @ ${monthlyReturnRate}%/mo return (${annualEquivalent}% p.a.), interest cutoff on the ${interestCutoffDay}th.`
      );

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      error('Enrollment Failed', err.message || 'Failed to enroll member in investment scheme');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Investment Scheme & Monthly Return Configuration"
      subtitle="Member chooses monthly investment • Admin sets monthly return rate & interest cutoff date"
      size="lg"
      icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
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
            Activate Investment Plan
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Member Selector */}
        <div>
          <Select
            label="Select Member"
            required
            value={selectedMemberId}
            disabled={Boolean(preselectedMember)}
            onChange={(e) => handleMemberChange(e.target.value)}
            options={[
              { value: '', label: '-- Select Member --' },
              ...members.map((m) => ({
                value: m.id,
                label: `${m.fullName} (${m.memberCode}) • Mobile: ${m.mobile}`,
              })),
            ]}
            error={errors.member}
          />
        </div>

        {/* Plan Template Selector */}
        <div>
          <Select
            label="Investment Scheme / Plan Template"
            value={selectedPlanId}
            onChange={(e) => handlePlanChange(e.target.value)}
            options={[
              { value: 'custom-plan', label: 'Custom Member-Defined Plan (Flexible Amount & Monthly Rate)' },
              ...plans.map((p) => ({
                value: p.id,
                label: `${p.planName} (Base ₹${p.monthlyContribution}/mo • ${p.durationMonths} Mo • ${p.monthlyReturnRate || (p.annualInterestRate / 12).toFixed(2)}%/mo)`,
              })),
            ]}
          />
        </div>

        {/* 1. Member's Choice: Monthly Investment Amount */}
        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-700" />
              <label className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                1. Member's Monthly Investment Amount
              </label>
            </div>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-semibold shadow-xs">
              Member's Choice
            </span>
          </div>
          <p className="text-xs text-emerald-800">
            The member decides how much money they want to invest on a recurring monthly basis.
          </p>

          {/* Quick Amount Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {COMMON_AMOUNTS.map((amt) => (
              <button
                type="button"
                key={amt}
                onClick={() => setMonthlyContribution(amt)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  monthlyContribution === amt
                    ? 'bg-emerald-700 text-white shadow-xs scale-105'
                    : 'bg-white text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                ₹{amt.toLocaleString('en-IN')}/mo
              </button>
            ))}
          </div>

          <div className="pt-1">
            <Input
              label="Monthly Investment (₹)"
              type="number"
              prefixText="₹"
              step="100"
              min={100}
              required
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              error={errors.contribution}
              helperText={`Annualized investment: ₹${(monthlyContribution * 12).toLocaleString('en-IN')} per year`}
            />
          </div>
        </div>

        {/* 2. Admin's Choice: Monthly Return Rate (% / month) */}
        <div className="bg-purple-50/60 border border-purple-200/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-purple-700" />
              <label className="text-xs font-bold uppercase tracking-wider text-purple-950">
                2. Monthly Return Rate (% / month)
              </label>
            </div>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-700 text-white font-semibold shadow-xs">
              Admin's Rate
            </span>
          </div>
          <p className="text-xs text-purple-800">
            Admin chooses the return rate on a <strong>monthly basis (% per month)</strong>.
          </p>

          {/* Quick Monthly Rate Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {COMMON_MONTHLY_RATES.map((rate) => (
              <button
                type="button"
                key={rate}
                onClick={() => setMonthlyReturnRate(rate)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  monthlyReturnRate === rate
                    ? 'bg-purple-700 text-white shadow-xs scale-105'
                    : 'bg-white text-purple-800 hover:bg-purple-100 border border-purple-200'
                }`}
              >
                {rate}% / mo ({roundToTwo(rate * 12)}% p.a.)
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <Input
              label="Monthly Return Rate (% / mo)"
              type="number"
              step="0.01"
              min={0}
              max={50}
              suffixText="% / mo"
              required
              value={monthlyReturnRate}
              onChange={(e) => setMonthlyReturnRate(Number(e.target.value))}
              error={errors.rate}
              helperText={`Yields ₹${monthlyReturnPerInstallment.toLocaleString('en-IN')} return/mo per installment`}
            />

            <div className="bg-white/80 p-3 rounded-xl border border-purple-200 flex flex-col justify-center">
              <span className="text-[11px] font-semibold text-purple-900 uppercase">Annualized Equivalent</span>
              <p className="text-base font-extrabold font-mono text-purple-700 mt-0.5">
                {annualEquivalent}% p.a. <span className="text-xs font-normal text-purple-600">yearly</span>
              </p>
            </div>
          </div>
        </div>

        {/* 3. Admin's Choice: Monthly Interest Cutoff Day Rule */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-700" />
              <label className="text-xs font-bold uppercase tracking-wider text-amber-950">
                3. Monthly Interest Cutoff Date Rule
              </label>
            </div>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-600 text-white font-semibold shadow-xs">
              Cutoff Rule
            </span>
          </div>

          {/* Cutoff Day Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {COMMON_CUTOFF_DAYS.map((day) => (
              <button
                type="button"
                key={day}
                onClick={() => setInterestCutoffDay(day)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  interestCutoffDay === day
                    ? 'bg-amber-700 text-white shadow-xs scale-105'
                    : 'bg-white text-amber-900 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                {day}th of month
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <Input
              label="Interest Cutoff Day of Month"
              type="number"
              min={1}
              max={31}
              required
              value={interestCutoffDay}
              onChange={(e) => setInterestCutoffDay(Number(e.target.value))}
              error={errors.cutoff}
              helperText={`e.g. ${interestCutoffDay}th of every calendar month`}
            />

            <div className="p-3 bg-amber-100/70 border border-amber-300/80 rounded-xl text-xs text-amber-950 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Cutoff Interest Rule:</p>
                <p className="mt-0.5 text-[11px] text-amber-900 leading-relaxed">
                  If member deposits on/before the <strong>{interestCutoffDay}th</strong>: earns interest for that month. If paid <strong>after the {interestCutoffDay}th</strong>: interest for that month only is <strong>forfeited</strong> (₹0). Next month earns normally.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Tenure & Start Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Tenure (Months)
            </label>
            <select
              value={durationMonths}
              onChange={(e) => setDurationMonths(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {COMMON_TENURES.map((t) => (
                <option key={t.months} value={t.months}>
                  {t.label}
                </option>
              ))}
            </select>
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
        </div>

        {/* 5. Live Financial Yield & Maturity Breakdown */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 p-5 text-white shadow-elevated border border-emerald-800">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Live Investment Returns Projection
              </span>
            </div>
            <span className="text-xs font-mono px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">
              ₹{monthlyContribution.toLocaleString('en-IN')}/mo • {monthlyReturnRate}% / month ({annualEquivalent}% p.a.)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xs">
              <p className="text-[10px] text-slate-300 uppercase font-semibold">Monthly Return</p>
              <p className="text-base font-bold font-mono text-emerald-300 mt-0.5">
                +{formatCurrency(monthlyReturnPerInstallment)}
                <span className="text-[10px] block font-normal text-slate-300">per deposit/mo</span>
              </p>
            </div>

            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xs">
              <p className="text-[10px] text-slate-300 uppercase font-semibold">Total Principal ({durationMonths} Mo)</p>
              <p className="text-base font-bold font-mono text-white mt-0.5">
                {formatCurrency(maturity.totalPrincipal)}
              </p>
            </div>

            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xs">
              <p className="text-[10px] text-emerald-300 uppercase font-semibold">Estimated Total Interest</p>
              <p className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                +{formatCurrency(maturity.totalInterest)}
              </p>
            </div>

            <div className="bg-emerald-500/20 p-3 rounded-xl backdrop-blur-xs border border-emerald-400/40">
              <p className="text-[10px] text-emerald-200 uppercase font-bold">Total Maturity Sum</p>
              <p className="text-base font-extrabold font-mono text-emerald-200 mt-0.5">
                {formatCurrency(maturity.maturityAmount)}
              </p>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Remarks / Special Terms
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={`e.g. Member opted for ₹${monthlyContribution}/mo with ${monthlyReturnRate}%/month return, cutoff on ${interestCutoffDay}th`}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </form>
    </Modal>
  );
};

