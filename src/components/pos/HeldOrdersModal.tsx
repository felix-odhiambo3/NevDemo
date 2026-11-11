import React from 'react';
import { HeldOrder, StoreSettings } from '../../types/pos';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { Clock, Play, Trash2, X, ShoppingBag } from 'lucide-react';

interface HeldOrdersModalProps {
  heldOrders: HeldOrder[];
  settings: StoreSettings;
  onResumeOrder: (order: HeldOrder) => void;
  onDeleteHeldOrder: (orderId: string) => void;
  onClose: () => void;
}

export const HeldOrdersModal: React.FC<HeldOrdersModalProps> = ({
  heldOrders,
  settings,
  onResumeOrder,
  onDeleteHeldOrder,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-slate-100">Parked / Held Orders</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {heldOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <ShoppingBag className="w-12 h-12 mx-auto text-slate-700 mb-3" />
              <p className="text-sm font-medium">No orders currently on hold.</p>
              <p className="text-xs text-slate-600 mt-1">
                You can park an active checkout anytime by clicking &quot;Hold Order&quot; in the terminal.
              </p>
            </div>
          ) : (
            heldOrders.map((order) => {
              const totalAmount = order.items.reduce(
                (sum, it) => sum + (it.product.sellingPrice * it.quantity),
                0
              );
              const itemCount = order.items.reduce((sum, it) => sum + it.quantity, 0);

              return (
                <div
                  key={order.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-900/60">
                        {order.holdNumber}
                      </span>
                      <span className="text-sm font-bold text-slate-200">
                        {order.customerName || 'Walk-in Customer'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      <span>{itemCount} items</span> · <span className="text-slate-500">{formatDateTime(order.timestamp)}</span>
                    </div>
                    {order.notes && (
                      <p className="text-xs text-slate-500 italic">&ldquo;{order.notes}&rdquo;</p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-cyan-400 tabular-nums">
                        {formatCurrency(totalAmount, settings.currency)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onResumeOrder(order)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Resume</span>
                      </button>
                      <button
                        onClick={() => onDeleteHeldOrder(order.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
