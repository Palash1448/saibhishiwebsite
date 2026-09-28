import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import type { Member } from '../../types/member';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { previewMemberInterest, creditInterestToMember } from '../../services/interestService';
import { formatCurrency } from '../../utils/formatters';
import { Percent, Gift, CheckCircle2 } from 'lucide-react';

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
  const { members, financeSettings, refreshAll } = useData();
  const { success, error } = useToast();

  const [selectedMemberId, setSelectedMemberId] = useState(preselectedMember?.id || '');
  const [periodLabel, setPeriodLabel] = useState('FY 2025-2026 (Year 1)');
  const [annualRate, setAnnualRate] = useState<number>(financeSettings.defaultAnnualReturnRate || 12);
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(0);
  const [creditedDate, setCreditedDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (preselectedMember) {
      setSelectedMemberId(preselectedMember.id);
    } else if (members.length > 0 && !selectedMemberId) {
      setSelectedMemberId(members[0].id);
    }
  }, [preselectedMember, members, isOpen]);

  const member = members.find((m) => m.id === selectedMemberId);
  const principal = member?.totalInvested || 0;
  const calculatedInterest = Math.round(principal * (annualRate / 100));
  const finalInterestAmount = Math.max(0, calculatedInterest + adjustmentAmount);

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
        principalAmount: principal,
        annualRate,
        calculatedInterest,
        adjustmentAmount,
        finalInterestAmount,
        creditedDate,
        notes,
      });

      await refreshAll();
      success('Interest Credited', `₹${finalInterestAmount} credited to ${member.fullName}'s account.`);
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
      title="Credit Yearly Return / Interest"
      subtitle="Preview and credit annual returns with optional loyalty bonus adjustment"
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
            Approve & Credit Return
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
            onChange={(e) => setSelectedMemberId(e.target.value)}
            options={[
              { value: '', label: '-- Select Member --' },
              ...members.map((m) => ({
                value: m.id,
                label: `${m.fullName} (${m.memberCode}) — Invested Principal: ₹${(m.totalInvested || 0).toLocaleString('en-IN')}`,
              })),
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Calculation Period"
              placeholder="e.g. FY 2025-2026 (Annual)"
              required
              value={periodLabel}
              onChange={(e) => setPeriodLabel(e.target.value)}
            />
          </div>

          <div>
            <Input
              label="Annual Return Rate (%)"
              type="number"
              step="0.1"
              suffixText="% p.a."
              required
              value={annualRate}
              onChange={(e) => setAnnualRate(Number(e.target.value))}
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
              helperText="Optional Diwali/Festival bonus or deduction"
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

        {/* Live Interest Breakdown */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Invested Principal Balance:</span>
            <span className="text-white font-mono font-semibold">{formatCurrency(principal)}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Base Interest (@ {annualRate}% p.a.):</span>
            <span className="text-emerald-400 font-mono font-semibold">+{formatCurrency(calculatedInterest)}</span>
          </div>
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
            placeholder="e.g. Annual return calculated as per Bhishi scheme guidelines"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
};
