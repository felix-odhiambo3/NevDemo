import React, { useState } from 'react';
import { CashMovement, ShiftSession, StoreSettings } from '../../types/pos';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { posAudio } from '../../utils/audio';
import {
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  Printer,
  History,
  AlertTriangle,
  CheckCircle,
  FileText,
  Clock,
  X,
} from 'lucide-react';

interface ShiftManagerModalProps {
  currentShift: ShiftSession;
  shiftHistory: ShiftSession[];
  settings: StoreSettings;
  onUpdateShift: (shift: ShiftSession) => void;
  onCloseShift: (closedShift: ShiftSession) => void;
  onOpenNewShift: (openingFloat: number, notes?: string) => void;
  onClose: () => void;
}

export const ShiftManagerModal: React.FC<ShiftManagerModalProps> = ({
  currentShift,
  shiftHistory,
  settings,
  onUpdateShift,
  onCloseShift,
  onOpenNewShift,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'current' | 'movement' | 'close' | 'history'>('current');
  const [movementType, setMovementType] = useState<'in' | 'out'>('in');
  const [movementAmount, setMovementAmount] = useState('');
  const [movementReason, setMovementReason] = useState('');

  // Closing cash count inputs
  const [countedCash, setCountedCash] = useState<string>('');
  const [closingNotes, setClosingNotes] = useState('');
  const [showZReport, setShowZReport] = useState<ShiftSession | null>(null);

  // New Shift inputs if current shift is closed
  const [newOpeningFloat, setNewOpeningFloat] = useState('150.00');
  const [newShiftNotes, setNewShiftNotes] = useState('');

  const isShiftOpen = currentShift.status === 'open';

  // Handle Pay In / Pay Out
  const handleRecordMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(movementAmount);
    if (isNaN(amount) || amount <= 0 || !movementReason.trim()) return;

    const newMov: CashMovement = {
      id: `mov_${Date.now()}`,
      type: movementType,
      amount,
      reason: movementReason.trim(),
      timestamp: new Date().toISOString(),
      cashierName: currentShift.cashierName,
    };

    const delta = movementType === 'in' ? amount : -amount;
    const updatedShift: ShiftSession = {
      ...currentShift,
      expectedCash: Math.max(0, currentShift.expectedCash + delta),
      movements: [newMov, ...currentShift.movements],
    };

    onUpdateShift(updatedShift);
    posAudio.playDrawerKick();
    setMovementAmount('');
    setMovementReason('');
    setActiveTab('current');
  };

  // Handle End-of-Shift Cash Count & Close
  const handleFinalizeCloseShift = () => {
    const actual = parseFloat(countedCash);
    if (isNaN(actual) || actual < 0) return;

    const discrepancy = actual - currentShift.expectedCash;
    const closedSession: ShiftSession = {
      ...currentShift,
      endTime: new Date().toISOString(),
      actualCash: actual,
      discrepancy,
      status: 'closed',
      notes: closingNotes.trim() || currentShift.notes,
    };

    posAudio.playSuccess();
    onCloseShift(closedSession);
    setShowZReport(closedSession);
  };

  // Open fresh shift
  const handleStartFreshShift = (e: React.FormEvent) => {
    e.preventDefault();
    const floatVal = parseFloat(newOpeningFloat);
    if (isNaN(floatVal) || floatVal < 0) return;

    onOpenNewShift(floatVal, newShiftNotes.trim());
    posAudio.playDrawerKick();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-slate-100">Shift &amp; Cash Drawer Control</h2>
              <p className="text-xs text-slate-400">
                Register Cashier: <span className="text-cyan-400 font-semibold">{currentShift.cashierName}</span> ·{' '}
                Status:{' '}
                <span className={isShiftOpen ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                  {isShiftOpen ? 'ACTIVE SHIFT' : 'SHIFT CLOSED'}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 py-2 border-b border-slate-800 bg-slate-950/40 flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('current')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-colors ${
              activeTab === 'current'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Drawer Balance
          </button>
          <button
            type="button"
            disabled={!isShiftOpen}
            onClick={() => setActiveTab('movement')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-colors ${
              activeTab === 'movement'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed'
            }`}
          >
            Pay-In / Pay-Out
          </button>
          <button
            type="button"
            disabled={!isShiftOpen}
            onClick={() => setActiveTab('close')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-colors ${
              activeTab === 'close'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed'
            }`}
          >
            End Shift &amp; Count
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-colors ${
              activeTab === 'history'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            History &amp; Z-Reports
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {!isShiftOpen && activeTab !== 'history' ? (
            /* Shift Closed State -> Prompt to Open Fresh Shift */
            <form onSubmit={handleStartFreshShift} className="p-6 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-3 text-amber-400">
                <Lock className="w-6 h-6" />
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">Register Drawer is Currently Closed</h3>
                  <p className="text-xs text-slate-400">Enter opening cash float to begin cashier sales.</p>
                </div>
              </div>
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Opening Cash Float ({settings.currency.symbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newOpeningFloat}
                    onChange={(e) => setNewOpeningFloat(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-lg font-bold text-white tabular-nums focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Opening Shift Note (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Afternoon shift handover, Verified cash tray"
                    value={newShiftNotes}
                    onChange={(e) => setNewShiftNotes(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  Open Cash Drawer Shift
                </button>
              </div>
            </form>
          ) : activeTab === 'current' ? (
            /* TAB 1: Current Drawer Balance & Breakdown */
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block font-medium">Opening Float</span>
                  <span className="text-lg font-bold text-slate-100 tabular-nums">
                    {formatCurrency(currentShift.openingFloat, settings.currency)}
                  </span>
                </div>
                <div className="p-3.5 bg-slate-950 rounded-xl border border-emerald-900/40">
                  <span className="text-[11px] text-emerald-400 block font-medium">Expected Drawer Cash</span>
                  <span className="text-lg font-extrabold text-emerald-400 tabular-nums">
                    {formatCurrency(currentShift.expectedCash, settings.currency)}
                  </span>
                </div>
                <div className="p-3.5 bg-slate-950 rounded-xl border border-cyan-900/40">
                  <span className="text-[11px] text-cyan-400 block font-medium">Total Shift Sales</span>
                  <span className="text-lg font-extrabold text-cyan-400 tabular-nums">
                    {formatCurrency(currentShift.totalSales, settings.currency)}
                  </span>
                </div>
              </div>

              {/* Tender Breakdown */}
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2 text-xs">
                <h4 className="font-semibold text-slate-200">Payment Methods Collected This Shift</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="p-2 bg-slate-900 rounded-lg">
                    <span className="text-slate-400 block">Cash Sales</span>
                    <span className="font-bold text-slate-100 tabular-nums">
                      {formatCurrency(currentShift.totalCash, settings.currency)}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-lg">
                    <span className="text-slate-400 block">Card (POS)</span>
                    <span className="font-bold text-slate-100 tabular-nums">
                      {formatCurrency(currentShift.totalCard, settings.currency)}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-lg">
                    <span className="text-slate-400 block">M-Pesa / Mobile</span>
                    <span className="font-bold text-slate-100 tabular-nums">
                      {formatCurrency(currentShift.totalMpesa, settings.currency)}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-lg">
                    <span className="text-slate-400 block">Bank / Credit</span>
                    <span className="font-bold text-slate-100 tabular-nums">
                      {formatCurrency(currentShift.totalTransfer + currentShift.totalCredit, settings.currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cash Movements Log */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-semibold text-slate-300">Shift Cash Movements &amp; Pay-Ins</h4>
                  <button
                    onClick={() => setActiveTab('movement')}
                    className="text-xs text-cyan-400 hover:underline"
                  >
                    + Record Movement
                  </button>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {currentShift.movements.length === 0 ? (
                    <div className="text-xs text-slate-500 py-3 text-center border border-dashed border-slate-800 rounded-lg">
                      No cash adjustments made during this shift.
                    </div>
                  ) : (
                    currentShift.movements.map((mov) => (
                      <div
                        key={mov.id}
                        className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          {mov.type === 'in' ? (
                            <ArrowDownLeft className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                          <div>
                            <span className="font-semibold text-slate-200">{mov.reason}</span>
                            <span className="text-[10px] text-slate-500 block">
                              {formatDateTime(mov.timestamp)} by {mov.cashierName}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`font-bold tabular-nums ${
                            mov.type === 'in' ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {mov.type === 'in' ? '+' : '-'}
                          {formatCurrency(mov.amount, settings.currency)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === 'movement' ? (
            /* TAB 2: Record Pay-In / Pay-Out */
            <form onSubmit={handleRecordMovement} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMovementType('in')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    movementType === 'in'
                      ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>Cash Pay-In (Add Cash)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMovementType('out')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    movementType === 'out'
                      ? 'border-rose-500 bg-rose-950/40 text-rose-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Cash Pay-Out (Remove Cash)</span>
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Amount ({settings.currency.symbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={movementAmount}
                    onChange={(e) => setMovementAmount(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Reason / Description
                  </label>
                  <input
                    type="text"
                    placeholder={
                      movementType === 'in'
                        ? 'e.g. Additional float, change replenishment'
                        : 'e.g. Paid supplier delivery, courier fee, petty cash'
                    }
                    value={movementReason}
                    onChange={(e) => setMovementReason(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('current')}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Save Movement
                </button>
              </div>
            </form>
          ) : activeTab === 'close' ? (
            /* TAB 3: Close Shift & Detailed Cash Arqueo */
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Expected Cash in Drawer</span>
                  <span className="text-xl font-extrabold text-cyan-400 tabular-nums">
                    {formatCurrency(currentShift.expectedCash, settings.currency)}
                  </span>
                </div>
                <div className="text-right text-slate-400">
                  <span>Shift Started: {formatDateTime(currentShift.startTime)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Actual Counted Cash ({settings.currency.symbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Enter total counted bills & coins..."
                    value={countedCash}
                    onChange={(e) => setCountedCash(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-lg font-bold text-white tabular-nums focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {countedCash && !isNaN(parseFloat(countedCash)) && (
                  <div
                    className={`p-3 rounded-lg border text-xs font-semibold flex items-center justify-between ${
                      parseFloat(countedCash) === currentShift.expectedCash
                        ? 'border-emerald-800 bg-emerald-950/40 text-emerald-300'
                        : parseFloat(countedCash) > currentShift.expectedCash
                        ? 'border-cyan-800 bg-cyan-950/40 text-cyan-300'
                        : 'border-rose-800 bg-rose-950/40 text-rose-300'
                    }`}
                  >
                    <span>
                      {parseFloat(countedCash) === currentShift.expectedCash
                        ? 'Drawer is Balanced (Exact match)'
                        : parseFloat(countedCash) > currentShift.expectedCash
                        ? 'Cash Overage in Drawer'
                        : 'Cash Shortage in Drawer'}
                    </span>
                    <span className="font-mono text-sm">
                      {parseFloat(countedCash) - currentShift.expectedCash >= 0 ? '+' : ''}
                      {formatCurrency(parseFloat(countedCash) - currentShift.expectedCash, settings.currency)}
                    </span>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Closing Notes / Discrepancy Reason</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. All counted bills verified. Cash deposited in safe."
                    value={closingNotes}
                    onChange={(e) => setClosingNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleFinalizeCloseShift}
                disabled={!countedCash || isNaN(parseFloat(countedCash))}
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md disabled:opacity-40"
              >
                Finalize Close Shift &amp; Generate Z-Report
              </button>
            </div>
          ) : (
            /* TAB 4: Shift History */
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-300">Previous Closed Shifts &amp; Registers</h4>
              {shiftHistory.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No archived historical shifts yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {shiftHistory.map((sh) => (
                    <div
                      key={sh.id}
                      className="p-3 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-200">
                          Cashier: {sh.cashierName} · {formatDateTime(sh.startTime)}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Sales: {formatCurrency(sh.totalSales, settings.currency)} · Cash Count:{' '}
                          {formatCurrency(sh.actualCash || 0, settings.currency)}
                        </div>
                      </div>
                      <button
                        onClick={() => setShowZReport(sh)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Z-Report</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Z-Report Modal Preview */}
        {showZReport && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="font-bold text-slate-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <span>Fiscal Register Z-Report</span>
                </div>
                <button
                  onClick={() => setShowZReport(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="bg-white text-slate-900 p-4 rounded font-mono text-xs space-y-2">
                <div className="text-center font-bold pb-2 border-b border-dashed border-slate-300">
                  {settings.storeName}
                  <div className="text-[10px] font-normal text-slate-600">DAILY REGISTER Z-REPORT</div>
                  <div className="text-[10px] text-slate-500">TAX PIN: {settings.taxPinNumber}</div>
                </div>

                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>Shift ID:</span>
                    <span>{showZReport.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cashier:</span>
                    <span>{showZReport.cashierName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Opened:</span>
                    <span>{formatDateTime(showZReport.startTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Closed:</span>
                    <span>{showZReport.endTime ? formatDateTime(showZReport.endTime) : 'In progress'}</span>
                  </div>
                </div>

                <div className="py-2 border-t border-b border-dashed border-slate-300 space-y-1 text-[11px]">
                  <div className="flex justify-between font-bold">
                    <span>TOTAL GROSS SALES</span>
                    <span>{formatCurrency(showZReport.totalSales, settings.currency)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 pl-2">
                    <span>Cash Tendered</span>
                    <span>{formatCurrency(showZReport.totalCash, settings.currency)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 pl-2">
                    <span>Card POS</span>
                    <span>{formatCurrency(showZReport.totalCard, settings.currency)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 pl-2">
                    <span>M-Pesa / Mobile</span>
                    <span>{formatCurrency(showZReport.totalMpesa, settings.currency)}</span>
                  </div>
                </div>

                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>Opening Float:</span>
                    <span>{formatCurrency(showZReport.openingFloat, settings.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected Cash:</span>
                    <span>{formatCurrency(showZReport.expectedCash, settings.currency)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Counted Cash:</span>
                    <span>{formatCurrency(showZReport.actualCash || 0, settings.currency)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-1 border-t border-slate-300">
                    <span>Discrepancy:</span>
                    <span>{formatCurrency(showZReport.discrepancy || 0, settings.currency)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Z-Report</span>
                </button>
                <button
                  onClick={() => setShowZReport(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
