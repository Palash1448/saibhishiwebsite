import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { MonthlyCollection } from '../../types/collection';
import { formatCompactCurrency, formatCurrency } from '../../utils/formatters';

interface CollectionTrendChartProps {
  collections: MonthlyCollection[];
}

export const CollectionTrendChart: React.FC<CollectionTrendChartProps> = ({ collections }) => {
  // Aggregate monthly collection stats
  const monthsData = [
    { month: 'Apr', target: 50000, collected: 48000, pending: 2000 },
    { month: 'May', target: 55000, collected: 52500, pending: 2500 },
    { month: 'Jun', target: 60000, collected: 58000, pending: 2000 },
    { month: 'Jul', target: 65000, collected: 62000, pending: 3000 },
    { month: 'Aug', target: 70000, collected: 67500, pending: 2500 },
    { month: 'Sep', target: 72500, collected: 67500, pending: 5000 },
  ];

  return (
    <div className="rounded-2xl bg-white p-5 md:p-6 border border-slate-100 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Monthly Collections Trend</h3>
          <p className="text-xs text-slate-500 mt-0.5">Target vs Actual Collected (Last 6 Months)</p>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#cbd5e1' }} />
            <YAxis tickFormatter={(v) => formatCompactCurrency(v)} tick={{ fill: '#64748b', fontSize: 11 }} />
            <Tooltip
              formatter={(value: any) => [formatCurrency(Number(value)), '']}
              contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Bar dataKey="collected" name="Collected" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
