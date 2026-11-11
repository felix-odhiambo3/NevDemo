import React, { useState } from 'react';
import { Expense, Product, Sale, StoreSettings } from '../../types/pos';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Download,
  Calendar,
  Layers,
  CreditCard,
  Flame,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

interface AnalyticsDashboardProps {
  sales: Sale[];
  products: Product[];
  expenses: Expense[];
  settings: StoreSettings;
  onClose: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  sales,
  products,
  expenses,
  settings,
  onClose,
}) => {
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'all'>('all');

  // Filter sales by date range
  const now = Date.now();
  const filteredSales = sales.filter((sale) => {
    const saleTime = new Date(sale.timestamp).getTime();
    if (dateRange === 'today') return now - saleTime <= 24 * 3600000;
    if (dateRange === '7days') return now - saleTime <= 7 * 24 * 3600000;
    if (dateRange === '30days') return now - saleTime <= 30 * 24 * 3600000;
    return true;
  });

  // Calculate Metrics
  const totalRevenue = filteredSales.reduce((acc, s) => acc + s.total, 0);
  const totalCOGS = filteredSales.reduce((acc, s) => {
    return acc + s.items.reduce((sum, it) => sum + (it.costPrice * it.quantity), 0);
  }, 0);
  const grossProfit = totalRevenue - totalCOGS;
  const grossMarginPct = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0';

  const totalExpenseAmount = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const netOperatingProfit = grossProfit - totalExpenseAmount;

  const totalOrdersCount = filteredSales.length;
  const averageOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;
  const totalItemsSold = filteredSales.reduce((acc, s) => {
    return acc + s.items.reduce((sum, it) => sum + it.quantity, 0);
  }, 0);

  // Payment Breakdown
  const paymentsBreakdown: Record<string, number> = {};
  filteredSales.forEach((s) => {
    s.payments.forEach((p) => {
      paymentsBreakdown[p.method] = (paymentsBreakdown[p.method] || 0) + p.amount;
    });
  });

  // Top Selling Items (Star Products)
  const productPerformance: Record<string, { name: string; quantity: number; revenue: number }> = {};
  filteredSales.forEach((s) => {
    s.items.forEach((it) => {
      if (!productPerformance[it.productId]) {
        productPerformance[it.productId] = { name: it.productName, quantity: 0, revenue: 0 };
      }
      productPerformance[it.productId].quantity += it.quantity;
      productPerformance[it.productId].revenue += it.total;
    });
  });

  const sortedProducts = Object.values(productPerformance).sort((a, b) => b.revenue - a.revenue);
  const starProducts = sortedProducts.slice(0, 5);

  // Slow moving / zero sales stock items
  const zeroSalesProducts = products
    .filter((p) => !productPerformance[p.id])
    .slice(0, 4);

  // Export Daily Register to CSV
  const handleExportRegisterCSV = () => {
    const headers = ['Receipt', 'Timestamp', 'Cashier', 'Branch', 'Subtotal', 'Tax', 'Total', 'PaymentMethods'];
    const rows = filteredSales.map((s) => [
      s.receiptNumber,
      `"${s.timestamp}"`,
      s.cashierName,
      s.branchName,
      s.subtotal,
      s.taxTotal,
      s.total,
      `"${s.payments.map((p) => p.method + ':' + p.amount).join(';')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AguilaNet_Sales_Report_${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-slate-100">Executive Business Reports &amp; Analytics</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Time range selector */}
          <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setDateRange('today')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                dateRange === 'today' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateRange('7days')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                dateRange === '7days' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setDateRange('30days')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                dateRange === '30days' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setDateRange('all')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                dateRange === 'all' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Time
            </button>
          </div>

          <button
            onClick={handleExportRegisterCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Analytics View */}
      <div className="flex-1 p-5 overflow-y-auto space-y-5">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">Gross Revenue</span>
            <span className="text-xl font-extrabold text-cyan-400 tabular-nums">
              {formatCurrency(totalRevenue, settings.currency)}
            </span>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-emerald-900/50">
            <span className="text-[11px] text-emerald-400 block font-medium">Gross Profit ({grossMarginPct}%)</span>
            <span className="text-xl font-extrabold text-emerald-400 tabular-nums">
              {formatCurrency(grossProfit, settings.currency)}
            </span>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">Net Operating Profit</span>
            <span
              className={`text-xl font-extrabold tabular-nums ${
                netOperatingProfit >= 0 ? 'text-slate-100' : 'text-rose-400'
              }`}
            >
              {formatCurrency(netOperatingProfit, settings.currency)}
            </span>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">Orders Count</span>
            <span className="text-xl font-bold text-slate-100 tabular-nums">{totalOrdersCount}</span>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">Average Basket (AOV)</span>
            <span className="text-xl font-bold text-slate-100 tabular-nums">
              {formatCurrency(averageOrderValue, settings.currency)}
            </span>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">Units Sold</span>
            <span className="text-xl font-bold text-slate-100 tabular-nums">{totalItemsSold}</span>
          </div>
        </div>

        {/* Visual Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Star Products vs Dead Stock (7 cols) */}
          <div className="lg:col-span-7 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-100 uppercase tracking-wider">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Top Star Products (Revenue Leaders)</span>
              </div>
            </div>

            <div className="space-y-3">
              {starProducts.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No sales recorded in this timeframe.
                </div>
              ) : (
                starProducts.map((sp, i) => {
                  const sharePct = totalRevenue > 0 ? ((sp.revenue / totalRevenue) * 100).toFixed(1) : '0';
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-200">
                          {i + 1}. {sp.name}
                        </span>
                        <div className="text-right">
                          <span className="font-bold text-cyan-400 tabular-nums">
                            {formatCurrency(sp.revenue, settings.currency)}
                          </span>
                          <span className="text-slate-500 text-[10px] ml-1.5 font-mono">({sp.quantity} sold)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-cyan-500 h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, Math.max(8, parseFloat(sharePct)))}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Slow Moving Stock Warning */}
            {zeroSalesProducts.length > 0 && (
              <div className="pt-3 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 mb-2">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Stagnant Inventory (0 Sales in Period)</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {zeroSalesProducts.map((p) => (
                    <div key={p.id} className="p-2 bg-slate-900/80 rounded border border-slate-800">
                      <div className="font-medium text-slate-200 truncate">{p.name}</div>
                      <div className="text-[10px] text-slate-500">
                        {p.stock} {p.unit} in stock · Cost: {formatCurrency(p.costPrice, settings.currency)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Payment Method Distribution (5 cols) */}
          <div className="lg:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-100 uppercase tracking-wider">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Payment Methods Collected</span>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {Object.entries(paymentsBreakdown).length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No payment data recorded.
                </div>
              ) : (
                Object.entries(paymentsBreakdown).map(([method, amt]) => {
                  const pct = totalRevenue > 0 ? ((amt / totalRevenue) * 100).toFixed(1) : '0';
                  return (
                    <div key={method} className="p-3 bg-slate-900 rounded-lg border border-slate-800/80 space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-200 capitalize">
                          {method === 'mpesa' ? 'M-Pesa / Mobile Money' : method}
                        </span>
                        <div className="text-right">
                          <span className="font-bold text-slate-100 tabular-nums">
                            {formatCurrency(amt, settings.currency)}
                          </span>
                          <span className="text-slate-400 text-[10px] ml-1 font-mono">({pct}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-400 h-full rounded-full"
                          style={{ width: `${Math.min(100, parseFloat(pct))}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions Sales Register Table */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Recent Sales Register Logs
            </h3>
            <span className="text-xs text-slate-500">{filteredSales.length} Transactions</span>
          </div>

          <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Receipt #</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Cashier</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-cyan-400">{sale.receiptNumber}</td>
                    <td className="p-3 text-slate-400">{formatDateTime(sale.timestamp)}</td>
                    <td className="p-3 text-slate-300">{sale.cashierName}</td>
                    <td className="p-3 text-slate-300">{sale.customerName || 'Walk-in'}</td>
                    <td className="p-3 text-slate-400">{sale.items.length} lines</td>
                    <td className="p-3 text-slate-300 capitalize">
                      {sale.payments.map((p) => p.method).join(', ')}
                    </td>
                    <td className="p-3 text-right font-bold text-slate-100 tabular-nums">
                      {formatCurrency(sale.total, settings.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
