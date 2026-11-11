import React, { useState } from 'react';
import { Category, Product, StockAdjustment, StoreSettings } from '../../types/pos';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Barcode,
  Edit,
  Trash2,
  AlertTriangle,
  Printer,
  X,
  FileSpreadsheet,
  ArrowUpDown,
} from 'lucide-react';
import { posAudio } from '../../utils/audio';

interface InventoryManagerProps {
  products: Product[];
  categories: Category[];
  settings: StoreSettings;
  onSaveProducts: (products: Product[]) => void;
  onOpenPurchasing?: () => void;
  onClose: () => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  products,
  categories,
  settings,
  onSaveProducts,
  onOpenPurchasing,
  onClose,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'out'>('all');

  // Modals
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<StockAdjustment['adjustmentType']>('recount');
  const [adjustmentDelta, setAdjustmentDelta] = useState<string>('0');
  const [adjustmentReason, setAdjustmentReason] = useState<string>('');
  const [printingBarcodes, setPrintingBarcodes] = useState<Product | null>(null);

  // Form state for Add / Edit
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    sku: '',
    barcode: '',
    category: categories[0]?.id || 'cat_bev',
    costPrice: 0,
    sellingPrice: 0,
    stock: 0,
    minStockAlert: 10,
    unit: 'pcs',
    taxRate: settings.defaultTaxRate,
    imageUrl: '',
  });

  // Filtered Products
  const filtered = products.filter((p) => {
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesQuery =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search);
    const matchesStock =
      stockStatusFilter === 'all' ||
      (stockStatusFilter === 'low' && p.stock > 0 && p.stock <= p.minStockAlert) ||
      (stockStatusFilter === 'out' && p.stock <= 0);
    return matchesCat && matchesQuery && matchesStock;
  });

  const handleOpenAdd = () => {
    const randomBarcode = `600100${Math.floor(1000 + Math.random() * 9000)}`;
    const randomSku = `SKU-${Math.floor(100 + Math.random() * 900)}`;
    setFormData({
      name: '',
      sku: randomSku,
      barcode: randomBarcode,
      category: categories[0]?.id || 'cat_bev',
      costPrice: 1.0,
      sellingPrice: 2.0,
      stock: 50,
      minStockAlert: 10,
      unit: 'pcs',
      taxRate: settings.defaultTaxRate,
      imageUrl: '',
    });
    setEditingProduct(null);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setFormData(prod);
    setEditingProduct(prod);
    setIsAddOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    if (editingProduct) {
      const updated = products.map((p) =>
        p.id === editingProduct.id ? ({ ...p, ...formData } as Product) : p
      );
      onSaveProducts(updated);
    } else {
      const newProduct: Product = {
        ...formData,
        id: `prod_${Date.now()}`,
      } as Product;
      onSaveProducts([newProduct, ...products]);
    }

    posAudio.playScanBeep();
    setIsAddOpen(false);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this product from the inventory?')) {
      onSaveProducts(products.filter((p) => p.id !== id));
      posAudio.playScanBeep();
    }
  };

  // Stock Adjustment
  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;
    const delta = parseInt(adjustmentDelta, 10);
    if (isNaN(delta)) return;

    let newStock = adjustingProduct.stock;
    if (adjustmentType === 'recount') {
      newStock = Math.max(0, delta);
    } else {
      newStock = Math.max(0, adjustingProduct.stock + delta);
    }

    const updated = products.map((p) =>
      p.id === adjustingProduct.id ? { ...p, stock: newStock } : p
    );

    onSaveProducts(updated);
    posAudio.playScanBeep();
    setAdjustingProduct(null);
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'SKU', 'Barcode', 'Category', 'CostPrice', 'SellingPrice', 'Stock', 'MinAlert', 'Unit'];
    const rows = products.map((p) => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.sku,
      p.barcode,
      p.category,
      p.costPrice,
      p.sellingPrice,
      p.stock,
      p.minStockAlert,
      p.unit,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AguilaNet_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-slate-100">Product Catalog &amp; Inventory Management</h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 tabular-nums">
            {products.length} Items Total
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onOpenPurchasing && (
            <button
              type="button"
              onClick={onOpenPurchasing}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs font-semibold transition-colors border border-slate-700"
            >
              <span>Purchasing &amp; Vendors</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filters Strip */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, SKU or barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
          >
            <option value="all">All Stock Statuses</option>
            <option value="low">Low Stock Alert (&le; Min)</option>
            <option value="out">Out of Stock (0)</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Product / SKU</th>
                <th className="p-3">Barcode</th>
                <th className="p-3">Category</th>
                <th className="p-3 text-right">Cost</th>
                <th className="p-3 text-right">Retail Price</th>
                <th className="p-3 text-right">Margin %</th>
                <th className="p-3 text-center">Stock Level</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No products match the filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => {
                  const isOutOfStock = prod.stock <= 0;
                  const isLowStock = prod.stock > 0 && prod.stock <= prod.minStockAlert;
                  const marginPct =
                    prod.sellingPrice > 0
                      ? (((prod.sellingPrice - prod.costPrice) / prod.sellingPrice) * 100).toFixed(1)
                      : '0';

                  const categoryName = categories.find((c) => c.id === prod.category)?.name || prod.category;

                  return (
                    <tr key={prod.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-slate-100">{prod.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{prod.sku}</div>
                      </td>
                      <td className="p-3 font-mono text-slate-400">{prod.barcode}</td>
                      <td className="p-3 text-slate-300">{categoryName}</td>
                      <td className="p-3 text-right tabular-nums text-slate-400">
                        {formatCurrency(prod.costPrice, settings.currency)}
                      </td>
                      <td className="p-3 text-right tabular-nums font-bold text-slate-100">
                        {formatCurrency(prod.sellingPrice, settings.currency)}
                      </td>
                      <td className="p-3 text-right tabular-nums text-emerald-400 font-medium">
                        {marginPct}%
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tabular-nums ${
                            isOutOfStock
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : isLowStock
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {prod.stock} {prod.unit}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setAdjustingProduct(prod);
                              setAdjustmentDelta('0');
                              setAdjustmentReason('');
                            }}
                            title="Adjust Stock Level"
                            className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors"
                          >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPrintingBarcodes(prod)}
                            title="Generate Barcode Sticker"
                            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors"
                          >
                            <Barcode className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(prod)}
                            title="Edit Product"
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(prod.id)}
                            title="Delete Product"
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveProduct}
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800 bg-slate-950">
              <h3 className="font-bold text-slate-100 text-sm">
                {editingProduct ? 'Edit Product Details' : 'Add New Inventory Item'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Product Title / Name</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Mineral Water 500ml"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">SKU Code</label>
                  <input
                    type="text"
                    required
                    value={formData.sku || ''}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Barcode (EAN/UPC)</label>
                  <input
                    type="text"
                    required
                    value={formData.barcode || ''}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    value={formData.unit || 'pcs'}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="pcs, kg, box, bottle"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Wholesale Cost ({settings.currency.symbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.costPrice || 0}
                    onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Selling Retail Price ({settings.currency.symbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.sellingPrice || 0}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Stock on Hand</label>
                  <input
                    type="number"
                    required
                    value={formData.stock || 0}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Low Stock Alert Threshold</label>
                  <input
                    type="number"
                    required
                    value={formData.minStockAlert || 10}
                    onChange={(e) => setFormData({ ...formData, minStockAlert: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.imageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSaveAdjustment}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4"
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-100 text-sm">Stock Level Adjustment</h3>
                <p className="text-xs text-slate-400">{adjustingProduct.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setAdjustingProduct(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Current Stock on Hand:</span>
              <span className="font-bold text-cyan-400 text-sm tabular-nums">
                {adjustingProduct.stock} {adjustingProduct.unit}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Adjustment Type</label>
                <select
                  value={adjustmentType}
                  onChange={(e) => setAdjustmentType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="recount">Physical Stock Recount (Set exact count)</option>
                  <option value="shrinkage">Shrinkage / Unaccounted loss (-)</option>
                  <option value="damaged">Damaged / Broken goods (-)</option>
                  <option value="expired">Expired date discard (-)</option>
                  <option value="supplier_return">Return to Supplier (-)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {adjustmentType === 'recount' ? 'New Verified Total Count' : 'Quantity Change (- or +)'}
                </label>
                <input
                  type="number"
                  required
                  value={adjustmentDelta}
                  onChange={(e) => setAdjustmentDelta(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Adjustment Reason / Audit Note</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Broken in aisle 4 or annual inventory recount"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setAdjustingProduct(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Apply Adjustment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Barcode Label Sticker Sheet Preview */}
      {printingBarcodes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Barcode className="w-4 h-4 text-cyan-400" />
                <span>Printable Barcode Label Sticker</span>
              </div>
              <button
                onClick={() => setPrintingBarcodes(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Sticker Preview */}
            <div className="p-4 bg-white text-slate-900 rounded-lg shadow border border-slate-300 text-center font-mono space-y-2 max-w-[240px] mx-auto">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                {settings.storeName}
              </div>
              <div className="text-xs font-bold truncate text-slate-950">
                {printingBarcodes.name}
              </div>
              <div className="py-1">
                <svg className="w-36 h-10 mx-auto" viewBox="0 0 160 30">
                  {[2, 5, 8, 12, 14, 18, 22, 25, 27, 32, 35, 40, 43, 48, 52, 56, 59, 64, 68, 72, 77, 80, 85, 89, 93, 98, 102, 107, 111, 115, 120, 124, 129, 134, 138, 142, 147, 151, 155].map((x, i) => (
                    <rect
                      key={i}
                      x={x}
                      y="2"
                      width={i % 3 === 0 ? 3 : 2}
                      height="26"
                      fill="#0f172a"
                    />
                  ))}
                </svg>
                <div className="text-[10px] text-slate-600 mt-1">{printingBarcodes.barcode}</div>
              </div>
              <div className="text-base font-extrabold text-slate-950 pt-1 border-t border-slate-300">
                {formatCurrency(printingBarcodes.sellingPrice, settings.currency)}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Sticker</span>
              </button>
              <button
                onClick={() => setPrintingBarcodes(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
