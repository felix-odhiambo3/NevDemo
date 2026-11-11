import React, { useState } from 'react';
import { Customer, PaymentMethod, PaymentSplit, StoreSettings } from '../../types/pos';
import { formatCurrency } from '../../utils/formatters';
import { Banknote, CreditCard, Smartphone, Building, Award, Plus, Trash2, Check, X } from 'lucide-react';
import { posAudio } from '../../utils/audio';

interface CheckoutModalProps {
  totalDue: number;
  settings: StoreSettings;
  customer?: Customer;
  onCompleteSale: (payments: PaymentSplit[], changeAmount: number, notes?: string) => void;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  totalDue,
  settings,
  customer,
  onCompleteSale,
  onClose,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('cash');
  const [tenderAmount, setTenderAmount] = useState<string>(totalDue.toFixed(2));
  const [paymentSplits, setPaymentSplits] = useState<PaymentSplit[]>([]);
  const [referenceCode, setReferenceCode] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Total already allocated across splits
  const alreadyPaid = paymentSplits.reduce((acc, curr) => acc + curr.amount, 0);
  const remainingDue = Math.max(0, totalDue - alreadyPaid);

  // Suggested quick cash denominations depending on currency
  const isKES = settings.currency.code === 'KES';
  const denominations = isKES
    ? [50, 100, 200, 500, 1000, 2000]
    : [1, 5, 10, 20, 50, 100];

  const handleAddSplit = () => {
    const val = parseFloat(tenderAmount);
    if (isNaN(val) || val <= 0) return;

    const newSplit: PaymentSplit = {
      method: selectedMethod,
      amount: val,
      reference: referenceCode.trim() || undefined,
    };

    const nextSplits = [...paymentSplits, newSplit];
    setPaymentSplits(nextSplits);
    posAudio.playScanBeep();

    const nextPaid = nextSplits.reduce((acc, s) => acc + s.amount, 0);
    const nextRemaining = Math.max(0, totalDue - nextPaid);
    setTenderAmount(nextRemaining.toFixed(2));
    setReferenceCode('');
  };

  const handleRemoveSplit = (idx: number) => {
    const nextSplits = paymentSplits.filter((_, i) => i !== idx);
    setPaymentSplits(nextSplits);
    const nextPaid = nextSplits.reduce((acc, s) => acc + s.amount, 0);
    const nextRemaining = Math.max(0, totalDue - nextPaid);
    setTenderAmount(nextRemaining.toFixed(2));
  };

  // Immediate single-payment finalize if no split added yet
  const handleDirectFinalize = () => {
    const tenderedVal = parseFloat(tenderAmount);
    if (isNaN(tenderedVal) || tenderedVal < remainingDue) return;

    let finalSplits = [...paymentSplits];
    let change = 0;

    if (finalSplits.length === 0) {
      finalSplits.push({
        method: selectedMethod,
        amount: tenderedVal,
        reference: referenceCode.trim() || undefined,
      });
      change = Math.max(0, tenderedVal - totalDue);
    } else {
      const remainingToAdd = Math.min(tenderedVal, remainingDue);
      finalSplits.push({
        method: selectedMethod,
        amount: remainingToAdd,
        reference: referenceCode.trim() || undefined,
      });
      change = Math.max(0, tenderedVal - remainingToAdd);
    }

    posAudio.playDrawerKick();
    onCompleteSale(finalSplits, change, orderNotes);
  };

  const handleCompleteSplitSale = () => {
    const totalTendered = paymentSplits.reduce((acc, s) => acc + s.amount, 0);
    const change = Math.max(0, totalTendered - totalDue);
    posAudio.playDrawerKick();
    onCompleteSale(paymentSplits, change, orderNotes);
  };

  const currentTenderFloat = parseFloat(tenderAmount) || 0;
  const currentTotalProvided = alreadyPaid + currentTenderFloat;
  const totalChangeDue = Math.max(0, currentTotalProvided - totalDue);
  const canComplete = paymentSplits.length > 0 
    ? alreadyPaid >= totalDue 
    : currentTenderFloat >= totalDue;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Payment Checkout</h2>
            <p className="text-xs text-slate-400">
              Customer: <span className="text-cyan-400 font-medium">{customer?.name || 'Walk-in Customer'}</span>
              {customer?.loyaltyPoints ? ` · ${customer.loyaltyPoints} Loyalty Pts` : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-900">
          {/* Left Column: Payment Methods & Input (7 cols) */}
          <div className="md:col-span-7 space-y-4">
            {/* Total Display */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block font-medium">TOTAL DUE</span>
                <span className="text-3xl font-extrabold text-cyan-400 tabular-nums">
                  {formatCurrency(totalDue, settings.currency)}
                </span>
              </div>
              {alreadyPaid > 0 && (
                <div className="text-right">
                  <span className="text-xs text-emerald-400 block font-medium">STILL DUE</span>
                  <span className="text-xl font-bold text-emerald-400 tabular-nums">
                    {formatCurrency(remainingDue, settings.currency)}
                  </span>
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Payment Tender Method</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('cash')}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-semibold transition-all ${
                    selectedMethod === 'cash'
                      ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 shadow-sm'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <Banknote className="w-5 h-5 mb-1" />
                  <span>Cash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('card')}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-semibold transition-all ${
                    selectedMethod === 'card'
                      ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 shadow-sm'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mb-1" />
                  <span>Card POS</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('mpesa')}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-semibold transition-all ${
                    selectedMethod === 'mpesa'
                      ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 shadow-sm'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <Smartphone className="w-5 h-5 mb-1 text-emerald-400" />
                  <span>M-Pesa / Mobile</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('transfer')}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-semibold transition-all ${
                    selectedMethod === 'transfer'
                      ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 shadow-sm'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <Building className="w-5 h-5 mb-1" />
                  <span>Wire Transfer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('credit')}
                  disabled={!customer || customer.id === 'cust_walkin'}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-semibold transition-all ${
                    selectedMethod === 'credit'
                      ? 'border-amber-500 bg-amber-950/40 text-amber-300 shadow-sm'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed'
                  }`}
                >
                  <Award className="w-5 h-5 mb-1" />
                  <span>Store Tab</span>
                </button>
              </div>
            </div>

            {/* Amount input & Quick Chips */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300">Amount Tendered</label>
                <button
                  type="button"
                  onClick={() => setTenderAmount(remainingDue.toFixed(2))}
                  className="text-[11px] text-cyan-400 hover:underline"
                >
                  Exact ({formatCurrency(remainingDue, settings.currency)})
                </button>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={tenderAmount}
                  onChange={(e) => setTenderAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-lg font-bold text-white tabular-nums focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Quick Cash Chips */}
              {selectedMethod === 'cash' && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {denominations.map((denom) => (
                    <button
                      key={denom}
                      type="button"
                      onClick={() => setTenderAmount(denom.toString())}
                      className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors tabular-nums"
                    >
                      +{settings.currency.symbol}{denom}
                    </button>
                  ))}
                </div>
              )}

              {/* Reference or STK prompt */}
              {(selectedMethod === 'card' || selectedMethod === 'mpesa' || selectedMethod === 'transfer') && (
                <div className="pt-1">
                  <label className="text-xs text-slate-400 block mb-1">
                    {selectedMethod === 'mpesa' ? 'M-Pesa Transaction Code / Phone' : 'Auth Reference / Card Last 4'}
                  </label>
                  <input
                    type="text"
                    placeholder={selectedMethod === 'mpesa' ? 'e.g. QW7291048' : 'e.g. AUTH-8821 or 4192'}
                    value={referenceCode}
                    onChange={(e) => setReferenceCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              )}

              {/* Add to split list button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleAddSplit}
                  disabled={!tenderAmount || parseFloat(tenderAmount) <= 0}
                  className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add as Split Payment</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Splits Summary & Change Calculation (5 cols) */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Payment Breakdown</h3>

              {/* Splits List */}
              {paymentSplits.length === 0 ? (
                <div className="text-xs text-slate-500 py-3 text-center border border-dashed border-slate-800 rounded-lg">
                  Single payment mode. Or click &quot;Add as Split&quot; to combine tender types.
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {paymentSplits.map((split, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs bg-slate-900 p-2 rounded-lg border border-slate-800"
                    >
                      <div>
                        <span className="font-semibold text-slate-200 capitalize">{split.method}</span>
                        {split.reference && (
                          <span className="text-[10px] text-slate-400 block font-mono">{split.reference}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 tabular-nums">
                          {formatCurrency(split.amount, settings.currency)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSplit(i)}
                          className="text-rose-400 hover:text-rose-300 p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Change / Balance calculation */}
              <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Total Due</span>
                  <span className="tabular-nums font-semibold">{formatCurrency(totalDue, settings.currency)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Total Tendered</span>
                  <span className="tabular-nums font-semibold text-slate-200">
                    {formatCurrency(paymentSplits.length > 0 ? alreadyPaid : currentTenderFloat, settings.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-800">
                  <span className="text-emerald-400">CHANGE DUE</span>
                  <span className="text-emerald-400 tabular-nums">
                    {formatCurrency(totalChangeDue, settings.currency)}
                  </span>
                </div>
              </div>

              {/* Order Notes */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Receipt Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Table 4, Delivery, PO#..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Complete Sale Action */}
            <div className="pt-4">
              {paymentSplits.length > 0 && alreadyPaid >= totalDue ? (
                <button
                  type="button"
                  onClick={handleCompleteSplitSale}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-950 flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  <span>Finalize Split Sale</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDirectFinalize}
                  disabled={!canComplete}
                  className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-cyan-950 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Check className="w-5 h-5" />
                  <span>Complete Sale &amp; Print</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
