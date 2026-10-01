import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { SearchInput } from '../components/common/SearchInput';
import { Button } from '../components/common/Button';
import { formatDateTime } from '../utils/formatters';
import { exportToCSV } from '../utils/exportUtils';
import { ShieldCheck, Download, Clock, UserCheck, Activity } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const { auditLogs } = useData();
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');

  const filtered = auditLogs.filter((log) => {
    const matchSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.performedBy.toLowerCase().includes(search.toLowerCase());
    const matchMod = moduleFilter === 'all' || log.module === moduleFilter;
    return matchSearch && matchMod;
  });

  const handleExportCSV = () => {
    exportToCSV(
      'Audit_Security_Logs',
      filtered.map((l) => ({
        'Timestamp': l.timestamp,
        'Action': l.action,
        'Module': l.module,
        'Details': l.details,
        'Performed By': l.performedBy,
        'Entity ID': l.entityId || '—',
      }))
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-card">
        <div>
          <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight font-display">
            Security & Audit Activity
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Immutable log of all administrative actions, disbursements, and adjustments
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<Download className="w-4 h-4" />}
          onClick={handleExportCSV}
          className="w-full sm:w-auto justify-center"
        >
          Export Logs
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:max-w-md">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search action, details or administrator..."
          />
        </div>

        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
        >
          <option value="all">All Modules ({auditLogs.length})</option>
          <option value="members">Members</option>
          <option value="collections">Collections</option>
          <option value="loans">Loans</option>
          <option value="transactions">Transactions</option>
          <option value="bhishi">Bhishi Plans</option>
          <option value="expenses">Expenses</option>
          <option value="settings">Settings</option>
        </select>
      </div>

      {/* Logs Content: Mobile Native Cards vs Desktop Table */}
      {filtered.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-100">
          <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No audit logs match criteria.</p>
          <p className="text-xs text-slate-400 mt-1">Actions performed by admin will appear here.</p>
        </div>
      ) : (
        <>
          {/* Mobile Native Audit Feed */}
          <div className="space-y-3 sm:hidden">
            {filtered.map((log) => (
              <div
                key={log.id}
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                      {log.module}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">{log.action}</h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {formatDateTime(log.timestamp)}
                  </span>
                </div>

                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                  {log.details}
                </p>

                <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                  <span>Performed by:</span>
                  <span className="font-semibold text-slate-800">{log.performedBy}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Logs Table */}
          <div className="hidden sm:block bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-6">Timestamp</th>
                    <th className="py-3.5 px-4">Action</th>
                    <th className="py-3.5 px-4">Module</th>
                    <th className="py-3.5 px-6">Operation Details</th>
                    <th className="py-3.5 px-6 text-right">Performed By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-6 font-mono text-slate-500 whitespace-nowrap">
                        {formatDateTime(log.timestamp)}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {log.action}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700">
                          {log.module}
                        </span>
                      </td>

                      <td className="py-3.5 px-6 text-slate-700 max-w-md">
                        {log.details}
                      </td>

                      <td className="py-3.5 px-6 text-right font-medium text-slate-900 whitespace-nowrap">
                        {log.performedBy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
