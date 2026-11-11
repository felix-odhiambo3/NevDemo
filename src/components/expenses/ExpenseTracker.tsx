import React, { useState } from 'react';
import { Expense, StoreSettings } from '../../types/pos';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { Receipt, Plus, Search, Trash2, Filter, X } from 'lucide-react';
import { posAudio } from '../../utils/audio';

interface ExpenseTrackerProps {
  expenses: Expense[];
  settings: StoreSettings;
  onSaveExpenses: (expenses: Expense[]) => void;
  onClose: () => void;
}

export const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({
  expenses,
  settings,
  onSaveExpenses,
  onClose,
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [newCategory, setNewCategory] = useState<Expense['category']>('Supplies');
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newMethod, setNewMethod] = useState('Cash');

  const filtered = expenses.filter(
    (exp) => categoryFilter === 'all' || exp.category === categoryFilter
  );

  const totalExpenseAmount = filtered.reduce((acc, curr) => acc + curr.amount, 0);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newAmount);
    if (isNaN(amt) || amt <= 0 || !newDesc.trim()) return;

    const newExpense: Expense = {
      id: `exp_${Date.now()}`,
      category: newCategory,
      description: newDesc.trim(),
      amount: amt,
      date: new Date().toISOString(),
      paymentMethod: newMethod,
      recordedBy: 'Alex Chen',
    };

    onSaveExpenses([newExpense, ...expenses]);
    setIsAddOpen(false);
    setNewDesc('');
    setNewAmount('');
    posAudio.playScanBeep();
  };

  const handleDeleteExpense = (id: string) => {
    onSaveExpenses(expenses.filter((e) => e.id !== id));
    posAudio.playScanBeep();
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-slate-100">Operational Expenses Ledger</h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 tabular-nums">
            Total: {formatCurrency(totalExpenseAmount, settings.currency)}
          </span>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Record Expense</span>
        </button>
      </div>

      {/* Filter Strip */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/60 flex items-center gap-2">
        <span className="text-xs text-slate-400 font-medium">Filter Category:</span>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
        >
          <option value="all">All Expense Categories</option>
          <option value="Rent">Rent</option>
          <option value="Utilities">Utilities &amp; Telecom</option>
          <option value="Wages">Staff Wages / Meals</option>
          <option value="Supplies">Store Supplies &amp; Paper</option>
          <option value="Marketing">Marketing &amp; Ads</option>
          <option value="Maintenance">Equipment Maintenance</option>
          <option value="Other">Other Expenses</option>
        </select>
      </div>

      {/* Expenses Table */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Category</th>
                <th className="p-3">Description</th>
                <th className="p-3">Recorded By</th>
                <th className="p-3">Method</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No expenses logged in this view.
                  </td>
                </tr>
              ) : (
                filtered.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3">
                      <span className="bg-slate-900 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-300 border border-slate-800">
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-slate-200">{exp.description}</td>
                    <td className="p-3 text-slate-400">{exp.recordedBy}</td>
                    <td className="p-3 text-slate-400">{exp.paymentMethod}</td>
                    <td className="p-3 text-slate-400">{formatDateTime(exp.date)}</td>
                    <td className="p-3 text-right font-bold text-rose-400 tabular-nums">
                      -{formatCurrency(exp.amount, settings.currency)}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form
            onSubmit={handleAddExpense}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-3.5 text-xs"
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm">Log Store Expense</h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Expense Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Supplies">Store Supplies &amp; Paper Rolls</option>
                <option value="Utilities">Utilities &amp; Fiber Internet</option>
                <option value="Rent">Store Premise Rent</option>
                <option value="Wages">Staff Daily Wages / Meals</option>
                <option value="Maintenance">Repairs &amp; Maintenance</option>
                <option value="Marketing">Local Marketing &amp; Signage</option>
                <option value="Other">Miscellaneous Expenses</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Description / Memo</label>
              <input
                type="text"
                required
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="e.g. 50 rolls 80mm thermal receipt paper"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Amount ({settings.currency.symbol})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500 font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Paid Via</label>
                <select
                  value={newMethod}
                  onChange={(e) => setNewMethod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Cash">Cash (Drawer Float)</option>
                  <option value="M-Pesa">M-Pesa / Mobile</option>
                  <option value="Bank Wire">Bank Wire</option>
                  <option value="Card">Company Debit Card</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Record Expense
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
