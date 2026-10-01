import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmationContext';
import { BhishiPlan } from '../../types/bhishi';
import { deleteBhishiPlan } from '../../services/bhishiService';
import { Button } from '../../components/common/Button';
import { Badge, getStatusBadgeVariant } from '../../components/common/Badge';
import { BhishiPlanFormModal } from '../../components/bhishi/BhishiPlanFormModal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { calculateMaturityAmount } from '../../utils/calculations';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Users,
  Calendar,
  Percent,
  Calculator,
  TrendingUp,
  Clock,
} from 'lucide-react';

export const BhishiPlansPage: React.FC = () => {
  const { plans, refreshAll } = useData();
  const { success } = useToast();
  const { confirm } = useConfirm();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState<BhishiPlan | null>(null);

  const handleDelete = (plan: BhishiPlan) => {
    confirm({
      title: 'Delete Bhishi Plan?',
      message: `Are you sure you want to delete "${plan.planName}"? This action will remove the plan from future enrollments.`,
      confirmText: 'Yes, Delete Plan',
      variant: 'danger',
      onConfirm: async () => {
        await deleteBhishiPlan(plan.id);
        await refreshAll();
        success('Plan Deleted', `${plan.planName} removed.`);
      },
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-card">
        <div>
          <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight font-display">
            Bhishi Plans & Schemes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure monthly contribution tiers, tenures, and annual return rates
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setPlanToEdit(null);
            setIsFormModalOpen(true);
          }}
          className="w-full sm:w-auto justify-center"
        >
          + Create New Plan
        </Button>
      </div>

      {/* Grid of Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {plans.map((plan) => {
          const calc = calculateMaturityAmount(
            plan.monthlyContribution,
            plan.durationMonths,
            plan.annualInterestRate,
            plan.returnCalculationMethod
          );

          return (
            <div
              key={plan.id}
              className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-card hover:shadow-card-hover transition-all duration-200 p-4 sm:p-6 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3.5">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base font-bold text-slate-900">{plan.planName}</h2>
                      <Badge variant={getStatusBadgeVariant(plan.status)} size="sm">
                        {plan.status}
                      </Badge>
                    </div>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">
                      Code: {plan.planCode} • Due day: {plan.paymentDueDay}th
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setPlanToEdit(plan);
                        setIsFormModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Edit Plan"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(plan)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Main Stats Strip */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 text-center mb-3.5">
                  <div>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-semibold uppercase block truncate">Monthly Due</span>
                    <p className="text-xs sm:text-base font-bold font-mono text-emerald-800 mt-0.5">
                      {formatCurrency(plan.monthlyContribution)}
                    </p>
                  </div>

                  <div>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-semibold uppercase block truncate">Duration</span>
                    <p className="text-xs sm:text-base font-bold text-slate-900 mt-0.5">
                      {plan.durationMonths} Mo
                    </p>
                  </div>

                  <div>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-semibold uppercase block truncate">Return</span>
                    <p className="text-xs sm:text-base font-bold font-mono text-purple-700 mt-0.5">
                      {plan.annualInterestRate}%
                    </p>
                  </div>
                </div>

                {/* Calculation Engine Breakdown */}
                <div className="space-y-1.5 text-xs text-slate-600 bg-emerald-50/50 p-3 sm:p-3.5 rounded-xl border border-emerald-100 mb-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Principal Deposit:</span>
                    <span className="font-bold font-mono text-slate-900">{formatCurrency(calc.totalPrincipal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Estimated Returns:</span>
                    <span className="font-bold font-mono text-emerald-700">+{formatCurrency(calc.totalInterest)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1.5 border-t border-emerald-200/80 font-bold">
                    <span className="text-emerald-950">Maturity Sum:</span>
                    <span className="text-sm font-mono text-emerald-900">{formatCurrency(calc.maturityAmount)}</span>
                  </div>
                </div>

                {plan.description && (
                  <p className="text-xs text-slate-500 mb-3 leading-relaxed italic">{plan.description}</p>
                )}
              </div>

              {/* Footer info */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] sm:text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {plan.enrolledMembersCount || 0} Enrolled
                </span>

                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {formatDate(plan.startDate)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Form Modal */}
      {isFormModalOpen && (
        <BhishiPlanFormModal
          isOpen={true}
          planToEdit={planToEdit}
          onClose={() => setIsFormModalOpen(false)}
        />
      )}
    </div>
  );
};
