import React from 'react';
import { Sale, StoreSettings } from '../../types/pos';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { Printer, CheckCircle2, Download, Copy, X } from 'lucide-react';

interface ThermalReceiptModalProps {
  sale: Sale;
  settings: StoreSettings;
  onClose: () => void;
  onNewSale: () => void;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  sale,
  settings,
  onClose,
  onNewSale,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const lines = [
      settings.storeName.toUpperCase(),
      settings.legalEntity,
      settings.address,
      `TEL: ${settings.phone}`,
      `TAX PIN: ${settings.taxPinNumber}`,
      '--------------------------------',
      `RECEIPT: ${sale.receiptNumber}`,
      `DATE: ${formatDateTime(sale.timestamp)}`,
      `CASHIER: ${sale.cashierName}`,
      `BRANCH: ${sale.branchName}`,
      sale.customerName ? `CUSTOMER: ${sale.customerName}` : '',
      '--------------------------------',
      'ITEMS:',
      ...sale.items.map(
        (it) =>
          `${it.quantity}x ${it.productName.padEnd(20).slice(0, 20)} ${formatCurrency(it.total, settings.currency)}`
      ),
      '--------------------------------',
      `SUBTOTAL: ${formatCurrency(sale.subtotal, settings.currency)}`,
      sale.discountTotal > 0 ? `DISCOUNT: -${formatCurrency(sale.discountTotal, settings.currency)}` : '',
      `TAX (${(settings.defaultTaxRate * 100).toFixed(0)}%): ${formatCurrency(sale.taxTotal, settings.currency)}`,
      `TOTAL PAID: ${formatCurrency(sale.total, settings.currency)}`,
      'PAYMENT DETAILS:',
      ...sale.payments.map((p) => ` ${p.method.toUpperCase()}: ${formatCurrency(p.amount, settings.currency)} ${p.reference ? '(' + p.reference + ')' : ''}`),
      `CHANGE GIVEN: ${formatCurrency(sale.changeGiven, settings.currency)}`,
      '--------------------------------',
      settings.receiptFooter,
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(lines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold text-slate-100">Transaction Completed</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Thermal Paper Simulation */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-950/60 flex justify-center">
          <div
            id="printable-receipt"
            className="w-full max-w-[340px] bg-white text-slate-900 p-5 font-mono text-xs rounded shadow-lg border border-slate-300"
          >
            {/* Store Header */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300 space-y-1">
              <div className="text-sm font-bold tracking-tight text-slate-950">{settings.storeName}</div>
              <div className="text-[11px] text-slate-600">{settings.legalEntity}</div>
              <div className="text-[10px] text-slate-500">{settings.address}</div>
              <div className="text-[10px] text-slate-500">Tel: {settings.phone}</div>
              <div className="text-[10px] font-semibold text-slate-700">TAX PIN / VAT: {settings.taxPinNumber}</div>
            </div>

            {/* Receipt Metadata */}
            <div className="py-2.5 border-b border-dashed border-slate-300 text-[11px] space-y-0.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt No:</span>
                <span className="font-bold text-slate-900">{sale.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span>{formatDateTime(sale.timestamp)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cashier:</span>
                <span>{sale.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Branch:</span>
                <span>{sale.branchName}</span>
              </div>
              {sale.customerName && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-semibold text-slate-900">{sale.customerName}</span>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="py-2 border-b border-dashed border-slate-300">
              <div className="flex justify-between text-[10px] font-bold text-slate-500 pb-1 border-b border-slate-200">
                <span>ITEM / QTY</span>
                <span>TOTAL</span>
              </div>
              <div className="space-y-1.5 pt-1.5">
                {sale.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <div className="max-w-[70%]">
                      <div className="font-medium text-slate-900 truncate">{item.productName}</div>
                      <div className="text-[10px] text-slate-500">
                        {item.quantity} x {formatCurrency(item.unitPrice, settings.currency)}
                        {item.discount > 0 && ` (-${formatCurrency(item.discount, settings.currency)})`}
                      </div>
                    </div>
                    <div className="font-semibold text-slate-900 tabular-nums">
                      {formatCurrency(item.total, settings.currency)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="py-2 border-b border-dashed border-slate-300 text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal</span>
                <span className="tabular-nums">{formatCurrency(sale.subtotal, settings.currency)}</span>
              </div>
              {sale.discountTotal > 0 && (
                <div className="flex justify-between text-amber-700">
                  <span>Discount</span>
                  <span className="tabular-nums">-{formatCurrency(sale.discountTotal, settings.currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Tax (Included {settings.defaultTaxRate * 100}%)</span>
                <span className="tabular-nums">{formatCurrency(sale.taxTotal, settings.currency)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-1 border-t border-slate-300 text-slate-950">
                <span>TOTAL DUE</span>
                <span className="tabular-nums">{formatCurrency(sale.total, settings.currency)}</span>
              </div>
            </div>

            {/* Payments & Change */}
            <div className="py-2 border-b border-dashed border-slate-300 text-[11px] space-y-1">
              {sale.payments.map((p, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-slate-600 capitalize">
                    {p.method}
                    {p.reference ? ` (${p.reference})` : ''}
                  </span>
                  <span className="font-semibold tabular-nums">{formatCurrency(p.amount, settings.currency)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-slate-900 pt-1">
                <span>Change Given</span>
                <span className="tabular-nums text-emerald-700">{formatCurrency(sale.changeGiven, settings.currency)}</span>
              </div>
            </div>

            {/* Thermal Barcode / QR Simulation */}
            <div className="pt-3 pb-1 text-center space-y-2">
              <div className="inline-block p-1 bg-slate-100 rounded">
                <svg className="w-40 h-8 mx-auto" viewBox="0 0 160 30">
                  {/* Stylized vector barcode bars */}
                  {[2, 5, 8, 12, 14, 18, 22, 25, 27, 32, 35, 40, 43, 48, 52, 56, 59, 64, 68, 72, 77, 80, 85, 89, 93, 98, 102, 107, 111, 115, 120, 124, 129, 134, 138, 142, 147, 151, 155].map((x, i) => (
                    <rect
                      key={i}
                      x={x}
                      y="2"
                      width={i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1}
                      height="26"
                      fill="#0f172a"
                    />
                  ))}
                </svg>
              </div>
              <div className="text-[9px] text-slate-500 tracking-wider">*{sale.receiptNumber}*</div>
              <div className="text-[9px] text-slate-500 whitespace-pre-line leading-tight">
                {settings.receiptFooter}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print Ticket (80mm)</span>
            </button>
          </div>
          <button
            onClick={onNewSale}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors shadow-sm"
          >
            <span>Next Order</span>
          </button>
        </div>
      </div>
    </div>
  );
};
