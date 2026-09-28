import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCompactCurrency, formatCurrency } from '../../utils/formatters';

export const InvestmentVsReturnChart: React.FC = () => {
  const data = [
    { period: 'Q1 2025', principal: 180000, returns: 18000 },
    { period: 'Q2 2025', principal: 250000, returns: 27500 },
    { period: 'Q3 2025', principal: 320000, returns: 38400 },
    { period: 'Q4 2025', principal: 400000, returns: 52000 },
    { period: 'Q1 2026', principal: 480000, returns: 67200 },
    { period: 'Q2 2026', principal: 567500, returns: 82500 },
  ];

  return (
    <div className="rounded-2xl bg-white p-5 md:p-6 border border-slate-100 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Investment vs. Returns Accumulation</h3>
          <p className="text-xs text-slate-500 mt-0.5">Cumulative Member Principal vs Interest Earned</p>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="period" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis tickFormatter={(v) => formatCompactCurrency(v)} tick={{ fill: '#64748b', fontSize: 11 }} />
            <Tooltip
              formatter={(value: any) => [formatCurrency(Number(value)), '']}
              contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Area
              type="monotone"
              dataKey="principal"
              name="Member Principal"
              stroke="#059669"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPrincipal)"
            />
            <Area
              type="monotone"
              dataKey="returns"
              name="Distributed Interest"
              stroke="#6366f1"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorReturns)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
