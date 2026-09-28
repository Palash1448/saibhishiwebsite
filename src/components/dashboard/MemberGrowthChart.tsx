import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const MemberGrowthChart: React.FC = () => {
  const data = [
    { month: 'Apr', total: 4, active: 4 },
    { month: 'May', total: 5, active: 5 },
    { month: 'Jun', total: 6, active: 6 },
    { month: 'Jul', total: 7, active: 7 },
    { month: 'Aug', total: 8, active: 8 },
    { month: 'Sep', total: 8, active: 8 },
  ];

  return (
    <div className="rounded-2xl bg-white p-5 md:p-6 border border-slate-100 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Member Growth & Retention</h3>
          <p className="text-xs text-slate-500 mt-0.5">Enrolled community savings members over time</p>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
            />
            <Area
              type="monotone"
              dataKey="total"
              name="Active Members"
              stroke="#10b981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorMembers)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
