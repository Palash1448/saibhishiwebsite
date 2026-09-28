import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmationContext';
import { Expense, ExpenseCategory } from '../types/expense';
import { deleteExpense } from '../services/expenseService';
import { Button } from '../components/common/Button';
import { SearchInput } from '../components/common/SearchInput';
import { Badge } from '../components/common/Badge';
import { AddExpenseModal } from '../components/expenses/AddExpenseModal';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportToCSV } from '../utils/exportUtils';
import { EXPENSE_CATEGORIES } from '../constants/categories';
import { TrendingDown, Plus, Download, Trash2, Calendar, DollarSign, Layers } from 'lucide-react';

export const ExpensesPage: React.FC = () => {
  const { expenses, expenseSummary, refreshAll } = useData();
  const { success } = useToast();
  const { confirm } = useConfirm();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filtered = expenses.filter((e) => {
    const matchSearch =
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.expenseNumber.toLowerCase().includes(search.toLowerCase()) ||
      (e.recipientName && e.recipientName.toLowerCase().includes(search.toLowerCase()));
    const matchCat = categoryFilter === 'all' || e.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const handleDelete = (exp: Expense) => {
    confirm({
      title: `Delete Expense #${exp.expenseNumber}?`,
      message: `Are you sure you want to delete this ₹${exp.amount.toLocaleString('en-IN')} expense (${exp.description})?`,
      confirmText: 'Yes, Delete',
      variant: 'danger',
      onConfirm: async () => {
        await deleteExpense(exp.id);
        await refreshAll();
        success('Expense Deleted', `Expense #${exp.expenseNumber} removed.`);
      },
    });
  };

  const handleExportCSV = () => {
    exportToCSV(
      'Operating_Expenses_Ledger',
      filtered.map((e) => ({
        'Expense #': e.expenseNumber,
        'Date': e.date,
        'Category': e.category,
        'Description': e.description,
        'Paid To / Vendor': e.recipientName || '—',
        'Amount (₹)': e.amount,
        'Payment Mode': e.paymentMethod,
        'Notes': e.notes || '',
      }))
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-card">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight font-display">
            Business & Office Expense Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track operational disbursements, branch office rent, salaries, utilities, travel and logistics
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>

          <Button
            variant="danger"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            + Add New Expense
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards & Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-rose-950 text-rose-100 p-5 rounded-3xl border border-rose-900 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wider text-rose-300">Total Operating Expenses</p>
          <h2 className="text-3xl font-black font-mono text-white mt-1">
            {formatCurrency(expenseSummary.totalExpense)}
          </h2>
          <p className="text-xs text-rose-300/80 mt-1">
            This Month: {formatCurrency(expenseSummary.currentMonthExpense)}
          </p>
        </div>

        {/* Category Breakdown Bar */}
        <div className="md:col-span-2 bg-white p-5 rounded-3xl border border-slate-100 shadow-card flex flex-col justify-center">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Top Expense Categories
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {expenseSummary.categoryBreakdown.slice(0, 4).map((cat) => (
              <div key={cat.category} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-500 font-semibold">{cat.category}</span>
                <p className="font-bold font-mono text-slate-900 text-sm mt-0.5">{formatCurrency(cat.total)}</p>
                <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-rose-500 h-full" style={{ width: `${cat.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:max-w-md">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search description, recipient or expense #..."
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as any)}
          className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
        >
          <option value="all">All Categories</option>
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        {filtered.length === 0 ? (
          <p className="p-12 text-center text-slate-400 text-xs">No expenses recorded for this criteria.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Expense # / Date</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Description & Particulars</th>
                  <th className="py-3.5 px-4">Paid To</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4 text-right">Amount (₹)</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-mono font-bold text-slate-900">{e.expenseNumber}</p>
                      <p className="text-[11px] text-slate-500">{formatDate(e.date)}</p>
                    </td>

                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                        {e.category}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-medium text-slate-800 max-w-xs">
                      {e.description}
                      {e.notes && <p className="text-[11px] text-slate-400 mt-0.5">{e.notes}</p>}
                    </td>

                    <td className="py-4 px-4 text-slate-700">
                      {e.recipientName || '—'}
                    </td>

                    <td className="py-4 px-4 font-medium text-slate-700">
                      {e.paymentMethod}
                    </td>

                    <td className="py-4 px-4 text-right font-mono font-bold text-rose-600 text-sm">
                      -{formatCurrency(e.amount)}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDelete(e)}
                        title="Delete Expense"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <AddExpenseModal
          isOpen={true}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};
