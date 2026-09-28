import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCompactCurrency, formatCurrency } from '../../utils/formatters';

export const MonthlyCashflowChart: React.FC = () => {
  const data = [
    { month: 'Apr', inflow: 145000, outflow: 120000, net: 25000 },
    { month: 'May', inflow: 162500, outflow: 110000, net: 52500 },
    { month: 'Jun', inflow: 183000, outflow: 140000, net: 43000 },
    { month: 'Jul', inflow: 197000, outflow: 135000, net: 62000 },
    { month: 'Aug', inflow: 207500, outflow: 148000, net: 59500 },
    { month: 'Sep', inflow: 232500, outflow: 165000, net: 67500 },
  ];

  return (
    <div className="rounded-2xl bg-white p-5 md:p-6 border border-slate-100 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Monthly Cash Flow & Liquidity</h3>
          <p className="text-xs text-slate-500 mt-0.5">Total Inflows, Outflows, and Net Monthly Surplus</p>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis tickFormatter={(v) => formatCompactCurrency(v)} tick={{ fill: '#64748b', fontSize: 11 }} />
            <Tooltip
              formatter={(value: any) => [formatCurrency(Number(value)), '']}
              contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Line type="monotone" dataKey="inflow" name="Total Inflow (+)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="outflow" name="Total Outflow (-)" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="net" name="Net Surplus" stroke="#6366f1" strokeWidth={2.5} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
