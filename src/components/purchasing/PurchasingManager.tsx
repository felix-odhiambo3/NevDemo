import React, { useState } from 'react';
import { Product, PurchaseOrder, Supplier, StoreSettings } from '../../types/pos';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { Truck, Plus, CheckCircle, Clock, Search, X, PackageCheck } from 'lucide-react';
import { posAudio } from '../../utils/audio';

interface PurchasingManagerProps {
  products: Product[];
  suppliers: Supplier[];
  settings: StoreSettings;
  onSaveProducts: (products: Product[]) => void;
  onSaveSuppliers: (suppliers: Supplier[]) => void;
  onClose: () => void;
}

export const PurchasingManager: React.FC<PurchasingManagerProps> = ({
  products,
  suppliers,
  settings,
  onSaveProducts,
  onSaveSuppliers,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'suppliers'>('orders');
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([
    {
      id: 'po_101',
      poNumber: 'PO-2026-004',
      supplierId: suppliers[0]?.id || 'sup_1',
      supplierName: suppliers[0]?.name || 'Highland Pure Beverages Ltd',
      date: new Date(Date.now() - 48 * 3600000).toISOString(),
      items: [
        {
          productId: products[0]?.id || 'prod_1',
          productName: products[0]?.name || 'Mineral Water 500ml',
          sku: 'WAT-500',
          quantity: 100,
          unitCost: 0.35,
          total: 35.0,
        },
      ],
      totalAmount: 35.0,
      status: 'received',
      notes: 'Delivered in good order to central loading bay',
    },
  ]);

  // New PO State
  const [isNewPOOpen, setIsNewPOOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [poItems, setPoItems] = useState<{ productId: string; quantity: number; unitCost: number }[]>([]);
  const [poNotes, setPoNotes] = useState('');

  // Add Supplier Modal
  const [isAddSupOpen, setIsAddSupOpen] = useState(false);
  const [newSupName, setNewSupName] = useState('');
  const [newSupContact, setNewSupContact] = useState('');
  const [newSupPhone, setNewSupPhone] = useState('');
  const [newSupEmail, setNewSupEmail] = useState('');
  const [newSupAddress, setNewSupAddress] = useState('');
  const [newSupTerms, setNewSupTerms] = useState('Net 30 Days');

  const handleAddItemToPO = (prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;
    setPoItems([
      ...poItems,
      {
        productId: prod.id,
        quantity: 50,
        unitCost: prod.costPrice,
      },
    ]);
  };

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (poItems.length === 0) return;

    const sup = suppliers.find((s) => s.id === selectedSupplierId) || suppliers[0];
    const itemsFormatted = poItems.map((item) => {
      const prod = products.find((p) => p.id === item.productId)!;
      return {
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        quantity: item.quantity,
        unitCost: item.unitCost,
        total: item.quantity * item.unitCost,
      };
    });

    const totalAmount = itemsFormatted.reduce((acc, it) => acc + it.total, 0);

    const newPO: PurchaseOrder = {
      id: `po_${Date.now()}`,
      poNumber: `PO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      supplierId: sup.id,
      supplierName: sup.name,
      date: new Date().toISOString(),
      items: itemsFormatted,
      totalAmount,
      status: 'ordered',
      notes: poNotes.trim() || undefined,
    };

    setPurchaseOrders([newPO, ...purchaseOrders]);
    setIsNewPOOpen(false);
    setPoItems([]);
    setPoNotes('');
    posAudio.playScanBeep();
  };

  // Receive goods & automatically increment inventory stock
  const handleReceiveShipment = (po: PurchaseOrder) => {
    const updatedProducts = products.map((prod) => {
      const poItem = po.items.find((item) => item.productId === prod.id);
      if (poItem) {
        // Increment stock and update cost
        return {
          ...prod,
          stock: prod.stock + poItem.quantity,
          costPrice: poItem.unitCost, // update wholesale cost
        };
      }
      return prod;
    });

    const updatedPOs = purchaseOrders.map((p) =>
      p.id === po.id ? { ...p, status: 'received' as const } : p
    );

    onSaveProducts(updatedProducts);
    setPurchaseOrders(updatedPOs);
    posAudio.playSuccess();
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupName.trim()) return;

    const newSup: Supplier = {
      id: `sup_${Date.now()}`,
      name: newSupName.trim(),
      contactPerson: newSupContact.trim(),
      phone: newSupPhone.trim(),
      email: newSupEmail.trim(),
      address: newSupAddress.trim(),
      paymentTerms: newSupTerms,
      balanceDue: 0,
    };

    onSaveSuppliers([...suppliers, newSup]);
    setIsAddSupOpen(false);
    setNewSupName('');
    setNewSupContact('');
    setNewSupPhone('');
    setNewSupEmail('');
    setNewSupAddress('');
    posAudio.playScanBeep();
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-slate-100">Purchasing &amp; Supplier Deliveries</h2>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'orders' ? (
            <button
              onClick={() => setIsNewPOOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create Purchase Order</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAddSupOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Supplier</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-2 border-b border-slate-800 bg-slate-950/40 flex items-center gap-2 text-xs">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-3 py-1.5 font-semibold rounded-lg transition-colors ${
            activeTab === 'orders'
              ? 'bg-cyan-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Purchase Orders &amp; Stock In
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-3 py-1.5 font-semibold rounded-lg transition-colors ${
            activeTab === 'suppliers'
              ? 'bg-cyan-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Vendors &amp; Supplier Directory
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'orders' ? (
          <div className="space-y-3">
            {purchaseOrders.map((po) => (
              <div
                key={po.id}
                className="p-4 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-cyan-400">{po.poNumber}</span>
                    <span className="font-semibold text-slate-100">{po.supplierName}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        po.status === 'received'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {po.status === 'received' ? 'RECEIVED & STOCKED' : 'PENDING DELIVERY'}
                    </span>
                  </div>
                  <div className="text-slate-400">
                    Ordered: {formatDateTime(po.date)} ·{' '}
                    <span className="text-slate-300 font-semibold">{po.items.length} product lines</span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex flex-wrap gap-2 pt-1">
                    {po.items.map((it, idx) => (
                      <span key={idx} className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {it.quantity}x {it.productName}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-slate-100 tabular-nums">
                      {formatCurrency(po.totalAmount, settings.currency)}
                    </div>
                  </div>

                  {po.status !== 'received' ? (
                    <button
                      type="button"
                      onClick={() => handleReceiveShipment(po)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      <PackageCheck className="w-3.5 h-3.5" />
                      <span>Receive Shipment</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 text-emerald-400 font-semibold text-xs">
                      <CheckCircle className="w-4 h-4" />
                      <span>Stock Updated</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Suppliers Directory */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {suppliers.map((sup) => (
              <div
                key={sup.id}
                className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex justify-between items-start">
                  <div className="font-bold text-slate-100 text-sm">{sup.name}</div>
                  <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-400 border border-slate-800">
                    {sup.paymentTerms}
                  </span>
                </div>
                <div className="space-y-1 text-slate-400">
                  <div>Contact: {sup.contactPerson}</div>
                  <div>Phone: {sup.phone}</div>
                  <div>Email: {sup.email}</div>
                  <div>Address: {sup.address}</div>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-slate-500 text-[11px]">Payable Balance Due:</span>
                  <span className="font-bold text-slate-200 tabular-nums">
                    {formatCurrency(sup.balanceDue, settings.currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New PO Modal */}
      {isNewPOOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <form
            onSubmit={handleCreatePO}
            className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4"
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm">Create New Purchase Order</h3>
              <button
                type="button"
                onClick={() => setIsNewPOOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Vendor / Supplier</label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-medium"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.paymentTerms})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-300 font-semibold">Order Items</label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddItemToPO(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-cyan-400"
                  >
                    <option value="">+ Add Product Line...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Stock: {p.stock})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto p-1 bg-slate-950 rounded-lg border border-slate-800">
                  {poItems.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 text-xs">
                      No items added yet. Pick a product from the dropdown above.
                    </div>
                  ) : (
                    poItems.map((item, idx) => {
                      const prod = products.find((p) => p.id === item.productId)!;
                      return (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-slate-900 rounded">
                          <span className="flex-1 font-medium text-slate-200 truncate">{prod.name}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400">Qty:</span>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const next = [...poItems];
                                next[idx].quantity = parseInt(e.target.value, 10) || 1;
                                setPoItems(next);
                              }}
                              className="w-16 bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-center font-mono text-white"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400">Cost:</span>
                            <input
                              type="number"
                              step="0.01"
                              value={item.unitCost}
                              onChange={(e) => {
                                const next = [...poItems];
                                next[idx].unitCost = parseFloat(e.target.value) || 0;
                                setPoItems(next);
                              }}
                              className="w-20 bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-center font-mono text-white"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setPoItems(poItems.filter((_, i) => i !== idx))}
                            className="text-rose-400 hover:text-rose-300 p-1"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Delivery Instructions / PO Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Standard freight to loading dock 2, inspect seal on arrival"
                  value={poNotes}
                  onChange={(e) => setPoNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsNewPOOpen(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={poItems.length === 0}
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-colors shadow-sm disabled:opacity-40"
              >
                Issue Purchase Order
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Supplier Modal */}
      {isAddSupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSaveSupplier}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-3.5 text-xs"
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm">Add Vendor / Supplier</h3>
              <button
                type="button"
                onClick={() => setIsAddSupOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Company / Supplier Name</label>
              <input
                type="text"
                required
                value={newSupName}
                onChange={(e) => setNewSupName(e.target.value)}
                placeholder="e.g. Unilever East Africa"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Contact Representative</label>
                <input
                  type="text"
                  value={newSupContact}
                  onChange={(e) => setNewSupContact(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newSupPhone}
                  onChange={(e) => setNewSupPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email</label>
              <input
                type="email"
                value={newSupEmail}
                onChange={(e) => setNewSupEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Address / Depot</label>
              <input
                type="text"
                value={newSupAddress}
                onChange={(e) => setNewSupAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Credit / Payment Terms</label>
              <select
                value={newSupTerms}
                onChange={(e) => setNewSupTerms(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Cash on Delivery (COD)">Cash on Delivery (COD)</option>
                <option value="Net 7 Days">Net 7 Days</option>
                <option value="Net 15 Days">Net 15 Days</option>
                <option value="Net 30 Days">Net 30 Days</option>
                <option value="Net 60 Days">Net 60 Days</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddSupOpen(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Save Supplier
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
