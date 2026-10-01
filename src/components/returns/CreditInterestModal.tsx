import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import type { Member } from '../../types/member';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { creditInterestToMember } from '../../services/interestService';
import { calculateMemberCollectionsInterest, roundToTwo } from '../../utils/calculations';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Percent, CheckCircle2, AlertTriangle, Clock, Calendar, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

interface CreditInterestModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedMember?: Member | null;
  onSuccess?: () => void;
}

export const CreditInterestModal: React.FC<CreditInterestModalProps> = ({
  isOpen,
  onClose,
  preselectedMember,
  onSuccess,
}) => {
  const { members, collections, financeSettings, refreshAll } = useData();
  const { success, error } = useToast();

  const [selectedMemberId, setSelectedMemberId] = useState(preselectedMember?.id || '');
  const [periodLabel, setPeriodLabel] = useState('FY 2025-2026 (Monthly Calculated)');
  const [monthlyRate, setMonthlyRate] = useState<number>(
    preselectedMember?.monthlyReturnRate ??
      (preselectedMember?.annualReturnRate ? preselectedMember.annualReturnRate / 12 : financeSettings.defaultMonthlyReturnRate || 1.0)
  );
  const [cutoffDay, setCutoffDay] = useState<number>(
    preselectedMember?.interestCutoffDay || financeSettings.defaultInterestCutoffDay || 10
  );
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(0);
  const [creditedDate, setCreditedDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (preselectedMember) {
      setSelectedMemberId(preselectedMember.id);
      const mRate =
        preselectedMember.monthlyReturnRate ??
        (preselectedMember.annualReturnRate ? preselectedMember.annualReturnRate / 12 : financeSettings.defaultMonthlyReturnRate || 1.0);
      setMonthlyRate(roundToTwo(mRate));
      setCutoffDay(preselectedMember.interestCutoffDay || financeSettings.defaultInterestCutoffDay || 10);
    } else if (members.length > 0 && !selectedMemberId) {
      setSelectedMemberId(members[0].id);
      const mRate =
        members[0].monthlyReturnRate ??
        (members[0].annualReturnRate ? members[0].annualReturnRate / 12 : financeSettings.defaultMonthlyReturnRate || 1.0);
      setMonthlyRate(roundToTwo(mRate));
      setCutoffDay(members[0].interestCutoffDay || financeSettings.defaultInterestCutoffDay || 10);
    }
  }, [preselectedMember, members, isOpen, financeSettings]);

  const handleMemberChange = (mId: string) => {
    setSelectedMemberId(mId);
    const m = members.find((mem) => mem.id === mId);
    if (m) {
      const mRate =
        m.monthlyReturnRate ??
        (m.annualReturnRate ? m.annualReturnRate / 12 : financeSettings.defaultMonthlyReturnRate || 1.0);
      setMonthlyRate(roundToTwo(mRate));
      setCutoffDay(m.interestCutoffDay || financeSettings.defaultInterestCutoffDay || 10);
    }
  };

  const member = members.find((m) => m.id === selectedMemberId);
  const memberCollections = collections.filter((c) => c.memberId === selectedMemberId);

  // Compute live interest calculation based on cutoff date rule
  const calculation = calculateMemberCollectionsInterest(
    memberCollections,
    monthlyRate,
    cutoffDay,
    member?.totalInvested || 0,
    12
  );

  const finalInterestAmount = Math.max(0, roundToTwo(calculation.totalEarnedInterest + adjustmentAmount));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    if (finalInterestAmount <= 0) {
      error('Invalid Amount', 'Calculated interest amount must be greater than ₹0');
      return;
    }

    setLoading(true);
    try {
      await creditInterestToMember({
        memberId: member.id,
        memberName: member.fullName,
        memberCode: member.memberCode,
        planId: member.bhishiPlanId,
        planName: member.bhishiPlanName,
        calculationPeriod: periodLabel,
        principalAmount: calculation.totalPrincipal,
        monthlyRate,
        annualRate: calculation.annualRate,
        interestCutoffDay: cutoffDay,
        onTimeDepositsCount: calculation.onTimeCount,
        lateDepositsCount: calculation.lateCount,
        forfeitedInterestAmount: calculation.totalForfeitedInterest,
        calculatedInterest: calculation.totalEarnedInterest,
        adjustmentAmount,
        finalInterestAmount,
        creditedDate,
        notes,
      });

      await refreshAll();
      success('Interest Credited', `₹${finalInterestAmount.toLocaleString('en-IN')} credited to ${member.fullName}'s account.`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      error('Interest credit error', err.message || 'Failed to credit return');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Credit Monthly / Yearly Return & Interest"
      subtitle="Evaluates monthly deposit dates against cutoff day • Deducts forfeited month interest for late deposits"
      size="lg"
      icon={<Percent className="w-5 h-5 text-emerald-600" />}
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
            Approve & Credit Return ({formatCurrency(finalInterestAmount)})
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
            onChange={(e) => handleMemberChange(e.target.value)}
            options={[
              { value: '', label: '-- Select Member --' },
              ...members.map((m) => ({
                value: m.id,
                label: `${m.fullName} (${m.memberCode}) — Invested: ₹${(m.totalInvested || 0).toLocaleString('en-IN')} @ ${m.monthlyReturnRate || ((m.annualReturnRate || 12) / 12).toFixed(2)}%/mo (Cutoff: ${m.interestCutoffDay || 10}th)`,
              })),
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Calculation Period"
              placeholder="e.g. FY 2025-2026 (Monthly Calculated)"
              required
              value={periodLabel}
              onChange={(e) => setPeriodLabel(e.target.value)}
            />
          </div>

          <div>
            <Input
              label="Monthly Return Rate (% / mo)"
              type="number"
              step="0.01"
              min={0}
              max={50}
              suffixText="% / mo"
              required
              value={monthlyRate}
              onChange={(e) => setMonthlyRate(Number(e.target.value))}
              helperText={`Equivalent to ${calculation.annualRate}% p.a. yearly rate`}
            />
          </div>

          <div>
            <Input
              label="Interest Cutoff Day of Month"
              type="number"
              min={1}
              max={31}
              required
              value={cutoffDay}
              onChange={(e) => setCutoffDay(Number(e.target.value))}
              helperText="Deposits after this day forfeit interest for that month"
            />
          </div>

          <div>
            <Input
              label="Manual Adjustment / Bonus (₹)"
              type="number"
              prefixText="₹"
              placeholder="e.g. 500 bonus or penalty"
              value={adjustmentAmount || ''}
              onChange={(e) => setAdjustmentAmount(Number(e.target.value))}
              helperText="Optional festival bonus or late adjustment"
            />
          </div>

          <div>
            <Input
              label="Credit Date"
              type="date"
              required
              value={creditedDate}
              onChange={(e) => setCreditedDate(e.target.value)}
            />
          </div>
        </div>

        {/* Live Cutoff Evaluation KPI Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
            <span className="text-[10px] text-emerald-800 uppercase font-semibold block">On-Time Deposits</span>
            <p className="text-lg font-bold font-mono text-emerald-900 mt-0.5">
              {calculation.onTimeCount} Deposits
            </p>
            <span className="text-[10px] text-emerald-700">≤ {cutoffDay}th of month</span>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
            <span className="text-[10px] text-amber-800 uppercase font-semibold block">Late Deposits</span>
            <p className="text-lg font-bold font-mono text-amber-900 mt-0.5">
              {calculation.lateCount} Deposits
            </p>
            <span className="text-[10px] text-amber-700">&gt; {cutoffDay}th of month</span>
          </div>

          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-center">
            <span className="text-[10px] text-rose-800 uppercase font-semibold block">Forfeited Interest</span>
            <p className="text-lg font-bold font-mono text-rose-700 mt-0.5">
              -{formatCurrency(calculation.totalForfeitedInterest)}
            </p>
            <span className="text-[10px] text-rose-600">That month only</span>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
            <span className="text-[10px] text-purple-800 uppercase font-semibold block">Earned Return</span>
            <p className="text-lg font-bold font-mono text-purple-900 mt-0.5">
              +{formatCurrency(calculation.totalEarnedInterest)}
            </p>
            <span className="text-[10px] text-purple-700">@ {monthlyRate}%/mo</span>
          </div>
        </div>

        {/* Detailed Collection Breakdown Toggle */}
        {calculation.breakdown.length > 0 && (
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
            >
              <span>View Per-Deposit Cutoff & Interest Calculation ({calculation.breakdown.length} Deposits)</span>
              {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showBreakdown && (
              <div className="max-h-48 overflow-y-auto p-2 bg-white divide-y divide-slate-100 text-xs">
                {calculation.breakdown.map((item, idx) => (
                  <div key={item.collectionId || idx} className="py-2 px-3 flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-800">{item.monthYearLabel}</span>
                        {item.isEligibleForMonth ? (
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                            Paid {formatDate(item.paymentDate)} (Day {item.paymentDay} ≤ {cutoffDay})
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-100 text-amber-900 font-medium">
                            Paid {formatDate(item.paymentDate)} (Day {item.paymentDay} &gt; {cutoffDay} - Forfeited)
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Deposit: {formatCurrency(item.depositAmount)} • Earned for {item.monthsEarned} months
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-emerald-700 block">
                        +{formatCurrency(item.earnedInterest)}
                      </span>
                      {item.forfeitedInterestThisMonth > 0 && (
                        <span className="text-[10px] font-mono text-rose-600 block">
                          Forfeited: -{formatCurrency(item.forfeitedInterestThisMonth)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Live Interest Breakdown */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Invested Principal Balance:</span>
            <span className="text-white font-mono font-semibold">{formatCurrency(calculation.totalPrincipal)}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Earned Return ({monthlyRate}%/mo • {calculation.annualRate}% p.a.):</span>
            <span className="text-emerald-400 font-mono font-semibold">+{formatCurrency(calculation.totalEarnedInterest)}</span>
          </div>
          {calculation.totalForfeitedInterest > 0 && (
            <div className="flex items-center justify-between text-xs text-rose-300">
              <span>Forfeited Return (Late deposits after {cutoffDay}th):</span>
              <span className="text-rose-400 font-mono font-semibold">
                -{formatCurrency(calculation.totalForfeitedInterest)}
              </span>
            </div>
          )}
          {adjustmentAmount !== 0 && (
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Manual Bonus / Adjustment:</span>
              <span className="text-amber-400 font-mono font-semibold">
                {adjustmentAmount > 0 ? '+' : ''}{formatCurrency(adjustmentAmount)}
              </span>
            </div>
          )}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-200">Net Return To Credit:</span>
            <span className="text-2xl font-extrabold font-mono text-emerald-400">
              {formatCurrency(finalInterestAmount)}
            </span>
          </div>
        </div>

        <div>
          <Input
            label="Credit Notes / Remarks"
            placeholder="e.g. Monthly return calculated with cutoff rule applied"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
};

