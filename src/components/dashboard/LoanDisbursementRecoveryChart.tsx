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
import { formatCompactCurrency, formatCurrency } from '../../utils/formatters';

export const LoanDisbursementRecoveryChart: React.FC = () => {
  const data = [
    { month: 'Apr', disbursed: 150000, recovered: 95000 },
    { month: 'May', disbursed: 100000, recovered: 110000 },
    { month: 'Jun', disbursed: 200000, recovered: 125000 },
    { month: 'Jul', disbursed: 120000, recovered: 135000 },
    { month: 'Aug', disbursed: 180000, recovered: 140000 },
    { month: 'Sep', disbursed: 150000, recovered: 165000 },
  ];

  return (
    <div className="rounded-2xl bg-white p-5 md:p-6 border border-slate-100 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Loan Disbursement vs Recovery</h3>
          <p className="text-xs text-slate-500 mt-0.5">Capital Sanctioned vs EMI Principal & Interest Inflow</p>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis tickFormatter={(v) => formatCompactCurrency(v)} tick={{ fill: '#64748b', fontSize: 11 }} />
            <Tooltip
              formatter={(value: any) => [formatCurrency(Number(value)), '']}
              contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Bar dataKey="disbursed" name="Loan Disbursed" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="recovered" name="EMI Recovered" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
