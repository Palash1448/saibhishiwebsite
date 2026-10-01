import React from 'react';
import { LucideIcon } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface StatCardProps {
  title: string;
  value: number | string;
  isCurrency?: boolean;
  subtitle?: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  isCurrency = false,
  subtitle,
  icon: Icon,
  iconBgColor = 'bg-emerald-50',
  iconColor = 'text-emerald-600',
  trend,
  onClick,
  className = '',
}) => {
  const displayValue = typeof value === 'number' && isCurrency ? formatCurrency(value) : value;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl bg-white p-3.5 sm:p-5 md:p-6 border border-slate-100 shadow-card transition-all duration-200 hover:shadow-card-hover active:scale-[0.99] ${
        onClick ? 'cursor-pointer hover:border-emerald-200' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-2 sm:gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 truncate">
            {title}
          </p>
          <h3 className="mt-1 sm:mt-2 text-base sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight truncate font-mono">
            {displayValue}
          </h3>

          {(subtitle || trend) && (
            <div className="mt-1.5 sm:mt-2 flex items-center gap-1.5 text-[10px] sm:text-xs flex-wrap">
              {trend && (
                <span
                  className={`font-semibold px-1.5 py-0.5 rounded-md text-[10px] ${
                    trend.isPositive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {trend.value}
                </span>
              )}
              {subtitle && <span className="text-slate-500 truncate">{subtitle}</span>}
            </div>
          )}
        </div>

        <div className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl shrink-0 ${iconBgColor} ${iconColor}`}>
          <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
        </div>
      </div>
    </div>
  );
};

