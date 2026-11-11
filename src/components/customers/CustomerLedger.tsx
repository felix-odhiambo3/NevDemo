import React, { useState } from 'react';
import { Customer, Sale, StoreSettings } from '../../types/pos';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { Users, Plus, Search, Award, CreditCard, ShoppingBag, X } from 'lucide-react';
import { posAudio } from '../../utils/audio';

interface CustomerLedgerProps {
  customers: Customer[];
  sales: Sale[];
  settings: StoreSettings;
  onSaveCustomers: (customers: Customer[]) => void;
  onClose: () => void;
}

export const CustomerLedger: React.FC<CustomerLedgerProps> = ({
  customers,
  sales,
  settings,
  onSaveCustomers,
  onClose,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New customer form
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newCreditLimit, setNewCreditLimit] = useState('200');

  // Adjust credit modal
  const [creditAdjustmentAmount, setCreditAdjustmentAmount] = useState('');
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newCust: Customer = {
      id: `cust_${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim(),
      email: newEmail.trim(),
      loyaltyPoints: 0,
      storeCreditBalance: 0,
      creditLimit: parseFloat(newCreditLimit) || 0,
      totalSpent: 0,
      visitsCount: 0,
      notes: newNotes.trim() || undefined,
    };

    onSaveCustomers([...customers, newCust]);
    setIsAddOpen(false);
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewNotes('');
    posAudio.playScanBeep();
  };

  const handleAdjustCredit = (delta: number) => {
    if (!selectedCustomer) return;
    const amount = parseFloat(creditAdjustmentAmount);
    if (isNaN(amount) || amount <= 0) return;

    const newBalance = Math.max(0, selectedCustomer.storeCreditBalance + delta * amount);
    const updated = customers.map((c) =>
      c.id === selectedCustomer.id ? { ...c, storeCreditBalance: newBalance } : c
    );

    onSaveCustomers(updated);
    setSelectedCustomer({ ...selectedCustomer, storeCreditBalance: newBalance });
    setIsCreditModalOpen(false);
    setCreditAdjustmentAmount('');
    posAudio.playSuccess();
  };

  // Customer sales history
  const customerSales = selectedCustomer
    ? sales.filter((s) => s.customerId === selectedCustomer.id)
    : [];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-slate-100">Customers &amp; Loyalty Ledger</h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 tabular-nums">
            {customers.length} Accounts
          </span>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Register Customer</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Customer List (55%) */}
        <div className="flex-1 flex flex-col border-r border-slate-800 bg-slate-950/60 overflow-hidden">
          <div className="p-3 border-b border-slate-800">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search customer name, phone, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filtered.map((cust) => {
              const isSelected = selectedCustomer?.id === cust.id;
              return (
                <div
                  key={cust.id}
                  onClick={() => setSelectedCustomer(cust)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-950/30'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-slate-100 text-xs">{cust.name}</div>
                      <div className="text-[11px] text-slate-400">{cust.phone || 'No phone recorded'}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-amber-400 flex items-center justify-end gap-1">
                        <Award className="w-3.5 h-3.5" />
                        <span>{cust.loyaltyPoints} pts</span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      Store Credit: <strong className="text-slate-200">{formatCurrency(cust.storeCreditBalance, settings.currency)}</strong>
                    </span>
                    <span>
                      Lifetime: <strong className="text-slate-200">{formatCurrency(cust.totalSpent, settings.currency)}</strong> ({cust.visitsCount} visits)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Details Panel (45%) */}
        <div className="w-full md:w-96 lg:w-[440px] bg-slate-900 p-5 overflow-y-auto flex flex-col justify-between">
          {selectedCustomer ? (
            <div className="space-y-5">
              <div className="flex justify-between items-start pb-3 border-b border-slate-800">
                <div>
                  <h3 className="font-extrabold text-slate-100 text-sm">{selectedCustomer.name}</h3>
                  <p className="text-xs text-slate-400">{selectedCustomer.email || selectedCustomer.phone}</p>
                </div>
                {selectedCustomer.id !== 'cust_walkin' && (
                  <button
                    onClick={() => setIsCreditModalOpen(true)}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Manage Tab</span>
                  </button>
                )}
              </div>

              {/* Stats Card */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block font-medium">Loyalty Balance</span>
                  <span className="text-lg font-bold text-amber-400 tabular-nums">
                    {selectedCustomer.loyaltyPoints} Points
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block font-medium">Store Credit Tab</span>
                  <span className="text-lg font-bold text-cyan-400 tabular-nums">
                    {formatCurrency(selectedCustomer.storeCreditBalance, settings.currency)}
                  </span>
                </div>
              </div>

              {selectedCustomer.notes && (
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300">
                  <span className="font-semibold text-slate-400 block mb-1">Customer Preferences:</span>
                  {selectedCustomer.notes}
                </div>
              )}

              {/* Purchase History */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Purchase History</h4>
                {customerSales.length === 0 ? (
                  <div className="text-xs text-slate-500 py-6 text-center border border-dashed border-slate-800 rounded-lg">
                    No completed purchases recorded for this customer yet.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {customerSales.map((sale) => (
                      <div
                        key={sale.id}
                        className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs flex justify-between items-center"
                      >
                        <div>
                          <div className="font-semibold text-slate-200">{sale.receiptNumber}</div>
                          <div className="text-[10px] text-slate-500">{formatDateTime(sale.timestamp)}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-cyan-400 tabular-nums">
                            {formatCurrency(sale.total, settings.currency)}
                          </div>
                          <div className="text-[10px] text-slate-500">{sale.items.length} items</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
              <Users className="w-10 h-10 text-slate-800 mb-2" />
              <p className="text-xs font-semibold">Select a customer from the left to view profile and credit history</p>
            </div>
          )}
        </div>
      </div>

      {/* Register Customer Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSaveCustomer}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-3.5 text-xs"
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm">Register Customer Account</h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Customer Full Name</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Elena Rostova"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mobile Phone (M-Pesa/SMS)</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+254 712 345 678"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Credit Limit ({settings.currency.symbol})</label>
              <input
                type="number"
                value={newCreditLimit}
                onChange={(e) => setNewCreditLimit(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Customer Notes / VIP Tags</label>
              <input
                type="text"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="e.g. VIP Member, weekly corporate deliveries"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
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
                Create Account
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Adjust Store Credit Modal */}
      {isCreditModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm">Manage Store Credit Balance</h3>
              <button
                onClick={() => setIsCreditModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Current Balance:</span>
              <span className="font-bold text-cyan-400 text-sm">
                {formatCurrency(selectedCustomer.storeCreditBalance, settings.currency)}
              </span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Amount ({settings.currency.symbol})</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={creditAdjustmentAmount}
                onChange={(e) => setCreditAdjustmentAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleAdjustCredit(1)}
                className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold"
              >
                + Deposit Credit
              </button>
              <button
                type="button"
                onClick={() => handleAdjustCredit(-1)}
                className="py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold"
              >
                - Settle / Deduct Tab
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
