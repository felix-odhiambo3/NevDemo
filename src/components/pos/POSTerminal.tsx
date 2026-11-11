import React, { useState, useEffect, useRef } from 'react';
import {
  Product,
  Category,
  CartItem,
  Customer,
  HeldOrder,
  PaymentSplit,
  Sale,
  ShiftSession,
  StoreSettings,
} from '../../types/pos';
import { formatCurrency } from '../../utils/formatters';
import { posAudio } from '../../utils/audio';
import {
  Search,
  Barcode,
  Plus,
  Minus,
  Trash2,
  PauseCircle,
  FolderOpen,
  UserCheck,
  Percent,
  CheckCircle,
  Tag,
  Package,
  Layers,
  Sparkles,
} from 'lucide-react';
import { CheckoutModal } from './CheckoutModal';
import { ThermalReceiptModal } from './ThermalReceiptModal';
import { HeldOrdersModal } from './HeldOrdersModal';

interface POSTerminalProps {
  products: Product[];
  categories: Category[];
  customers: Customer[];
  settings: StoreSettings;
  currentShift: ShiftSession;
  heldOrders: HeldOrder[];
  onSaveProducts: (products: Product[]) => void;
  onRecordSale: (sale: Sale) => void;
  onSaveHeldOrders: (held: HeldOrder[]) => void;
  onUpdateCustomer: (customer: Customer) => void;
}

export const POSTerminal: React.FC<POSTerminalProps> = ({
  products,
  categories,
  customers,
  settings,
  currentShift,
  heldOrders,
  onSaveProducts,
  onRecordSale,
  onSaveHeldOrders,
  onUpdateCustomer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('cust_walkin');
  const [orderDiscountPercent, setOrderDiscountPercent] = useState<number>(0);
  
  // Modals
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isHeldOpen, setIsHeldOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [isCustomItemOpen, setIsCustomItemOpen] = useState(false);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');

  // Barcode input ref
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Focus barcode search on load
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      p.barcode.includes(query);
    return matchesCat && matchesQuery;
  });

  // Handle barcode scanner enter key
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Check exact barcode match first, then SKU
    const matched = products.find(
      (p) => p.barcode === searchQuery.trim() || p.sku.toLowerCase() === searchQuery.toLowerCase().trim()
    );

    if (matched) {
      handleAddToCart(matched);
      setSearchQuery('');
    } else {
      // If not exact barcode, check if there's only 1 matching product in search results
      if (filteredProducts.length === 1) {
        handleAddToCart(filteredProducts[0]);
        setSearchQuery('');
      } else {
        posAudio.playError();
      }
    }
  };

  // Add product to cart
  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      posAudio.playError();
      return;
    }

    posAudio.playScanBeep();
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        const newQty = updated[existingIndex].quantity + 1;
        if (newQty > product.stock) {
          posAudio.playError();
          return prevCart;
        }
        updated[existingIndex].quantity = newQty;
        return updated;
      } else {
        return [
          ...prevCart,
          {
            product,
            quantity: 1,
            discount: 0,
            discountType: 'fixed',
          },
        ];
      }
    });
  };

  // Update line quantity
  const handleUpdateQty = (productId: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            if (nextQty > item.product.stock) {
              posAudio.playError();
              return item;
            }
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  // Remove line from cart
  const handleRemoveLine = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Add custom line item (e.g. custom charge)
  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(customItemPrice);
    if (!customItemName.trim() || isNaN(price) || price <= 0) return;

    const customProduct: Product = {
      id: `custom_${Date.now()}`,
      name: customItemName.trim(),
      sku: 'MISC-00',
      barcode: `CUST${Math.floor(1000 + Math.random() * 9000)}`,
      category: 'cat_tech',
      costPrice: 0,
      sellingPrice: price,
      stock: 9999,
      minStockAlert: 0,
      unit: 'pcs',
      taxRate: settings.defaultTaxRate,
    };

    handleAddToCart(customProduct);
    setCustomItemName('');
    setCustomItemPrice('');
    setIsCustomItemOpen(false);
  };

  // Calculate Cart Financials
  const calculateTotals = () => {
    let subtotal = 0;
    let itemDiscountsTotal = 0;
    let taxTotal = 0;

    cart.forEach((item) => {
      const lineBase = item.product.sellingPrice * item.quantity;
      const lineDiscount = item.discountType === 'percentage' 
        ? lineBase * (item.discount / 100) 
        : item.discount;
      const lineAfterDiscount = Math.max(0, lineBase - lineDiscount);

      subtotal += lineBase;
      itemDiscountsTotal += lineDiscount;

      // Tax calculation
      const effectiveTaxRate = item.product.taxRate;
      if (settings.isTaxInclusive) {
        // Tax is included in selling price: Tax = Gross - Gross / (1 + rate)
        const itemTax = lineAfterDiscount - lineAfterDiscount / (1 + effectiveTaxRate);
        taxTotal += itemTax;
      } else {
        taxTotal += lineAfterDiscount * effectiveTaxRate;
      }
    });

    const orderDiscountAmount = (subtotal - itemDiscountsTotal) * (orderDiscountPercent / 100);
    const totalDiscounts = itemDiscountsTotal + orderDiscountAmount;

    let finalTotal = subtotal - totalDiscounts;
    if (!settings.isTaxInclusive) {
      finalTotal += taxTotal;
    }

    return {
      subtotal,
      totalDiscounts,
      taxTotal,
      finalTotal: Math.max(0, finalTotal),
    };
  };

  const { subtotal, totalDiscounts, taxTotal, finalTotal } = calculateTotals();

  // Hold / Suspend order
  const handleHoldOrder = () => {
    if (cart.length === 0) return;

    const holdNumber = `HOLD-${Math.floor(100 + Math.random() * 900)}`;
    const newHeld: HeldOrder = {
      id: `held_${Date.now()}`,
      holdNumber,
      customerName: selectedCustomer.name !== 'Walk-in Customer' ? selectedCustomer.name : undefined,
      customerId: selectedCustomer.id !== 'cust_walkin' ? selectedCustomer.id : undefined,
      items: [...cart],
      timestamp: new Date().toISOString(),
    };

    onSaveHeldOrders([...heldOrders, newHeld]);
    setCart([]);
    posAudio.playScanBeep();
  };

  // Resume suspended order
  const handleResumeOrder = (held: HeldOrder) => {
    setCart(held.items);
    if (held.customerId) {
      setSelectedCustomerId(held.customerId);
    }
    onSaveHeldOrders(heldOrders.filter((h) => h.id !== held.id));
    setIsHeldOpen(false);
    posAudio.playScanBeep();
  };

  // Finalize Sale
  const handleCompleteSale = (payments: PaymentSplit[], changeAmount: number, notes?: string) => {
    const saleId = `sale_${Date.now()}`;
    const receiptNumber = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const saleItems = cart.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      sku: item.product.sku,
      barcode: item.product.barcode,
      quantity: item.quantity,
      unitPrice: item.product.sellingPrice,
      costPrice: item.product.costPrice,
      discount: item.discount,
      taxRate: item.product.taxRate,
      total: item.product.sellingPrice * item.quantity - item.discount,
    }));

    const amountTendered = payments.reduce((sum, p) => sum + p.amount, 0);

    const newSale: Sale = {
      id: saleId,
      receiptNumber,
      timestamp: new Date().toISOString(),
      cashierId: currentShift.cashierId,
      cashierName: currentShift.cashierName,
      branchId: settings.activeBranchId,
      branchName: settings.branches.find((b) => b.id === settings.activeBranchId)?.name || 'Main Store',
      items: saleItems,
      subtotal,
      discountTotal: totalDiscounts,
      taxTotal,
      total: finalTotal,
      payments,
      amountTendered,
      changeGiven: changeAmount,
      customerId: selectedCustomer.id !== 'cust_walkin' ? selectedCustomer.id : undefined,
      customerName: selectedCustomer.name !== 'Walk-in Customer' ? selectedCustomer.name : undefined,
      notes,
      status: 'completed',
    };

    // Deduct stock from inventory
    const updatedProducts = products.map((prod) => {
      const soldItem = cart.find((item) => item.product.id === prod.id);
      if (soldItem) {
        return {
          ...prod,
          stock: Math.max(0, prod.stock - soldItem.quantity),
        };
      }
      return prod;
    });

    // Update customer loyalty points & store credit if applicable
    if (selectedCustomer.id !== 'cust_walkin') {
      const pointsEarned = Math.floor(finalTotal);
      const isCreditPayment = payments.find((p) => p.method === 'credit');
      const creditUsed = isCreditPayment ? isCreditPayment.amount : 0;

      onUpdateCustomer({
        ...selectedCustomer,
        loyaltyPoints: selectedCustomer.loyaltyPoints + pointsEarned,
        storeCreditBalance: Math.max(0, selectedCustomer.storeCreditBalance - creditUsed),
        totalSpent: selectedCustomer.totalSpent + finalTotal,
        visitsCount: selectedCustomer.visitsCount + 1,
      });
    }

    onSaveProducts(updatedProducts);
    onRecordSale(newSale);
    setCompletedSale(newSale);
    setIsCheckoutOpen(false);
    setCart([]);
    setOrderDiscountPercent(0);
    setSelectedCustomerId('cust_walkin');
    posAudio.playSuccess();
  };

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-slate-900">
      {/* LEFT / CENTER: Products Grid & Quick Search (65% width) */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-slate-800 bg-slate-900/60">
        {/* Top Controls: Search Bar & Barcode Gun Listener */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center gap-3">
          <form onSubmit={handleBarcodeSubmit} className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              ref={barcodeInputRef}
              type="text"
              placeholder="Scan barcode gun or type SKU / item name (Press Enter)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-24 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 font-medium"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-500 pointer-events-none">
              <Barcode className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-mono uppercase bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                AUTO
              </span>
            </div>
          </form>

          {/* Quick Custom Item Button */}
          <button
            type="button"
            onClick={() => setIsCustomItemOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors border border-slate-700 whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Custom Item</span>
          </button>
        </div>

        {/* Category Pills Strip */}
        <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-950/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              selectedCategory === 'all'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Catalog</span>
            <span className="text-[10px] opacity-75 font-mono">({products.length})</span>
          </button>

          {categories.map((cat) => {
            const count = products.filter((p) => p.category === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span>{cat.name}</span>
                <span className="text-[10px] opacity-75 font-mono">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          {filteredProducts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500">
              <Package className="w-12 h-12 text-slate-700 mb-2" />
              <p className="text-sm font-medium">No matching products found.</p>
              <p className="text-xs text-slate-600">Try searching a different SKU, name, or change category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
              {filteredProducts.map((product) => {
                const isOutOfStock = product.stock <= 0;
                const isLowStock = product.stock > 0 && product.stock <= product.minStockAlert;

                return (
                  <button
                    key={product.id}
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => handleAddToCart(product)}
                    className={`group relative text-left p-3 rounded-xl border transition-all flex flex-col justify-between bg-slate-950/70 hover:bg-slate-900 focus:outline-none ${
                      isOutOfStock
                        ? 'opacity-40 border-slate-800 cursor-not-allowed'
                        : isLowStock
                        ? 'border-amber-900/60 hover:border-amber-500/80 shadow-sm'
                        : 'border-slate-800 hover:border-cyan-500/60 hover:shadow-md'
                    }`}
                  >
                    <div>
                      {/* Image / Fallback Container */}
                      <div className="w-full h-24 mb-2.5 rounded-lg overflow-hidden bg-slate-900 relative border border-slate-800">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              // CSS fallback if image fails
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-600">
                            <Tag className="w-6 h-6" />
                          </div>
                        )}

                        {/* Stock badge */}
                        <div className="absolute top-1.5 right-1.5">
                          {isOutOfStock ? (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-950/90 text-rose-300 border border-rose-800">
                              OUT
                            </span>
                          ) : isLowStock ? (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-950/90 text-amber-300 border border-amber-800">
                              {product.stock} Left
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-950/80 text-slate-300 border border-slate-700 tabular-nums">
                              {product.stock} {product.unit}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Product Name & SKU */}
                      <div className="font-semibold text-xs text-slate-100 line-clamp-2 leading-snug group-hover:text-cyan-300 transition-colors">
                        {product.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {product.sku}
                      </div>
                    </div>

                    {/* Price in Active Store Currency */}
                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-400 tabular-nums">
                        {formatCurrency(product.sellingPrice, settings.currency)}
                      </span>
                      <span className="p-1 rounded bg-slate-800 text-slate-300 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
                        <Plus className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Active Order Cart Drawer (35% width, min 380px) */}
      <div className="w-full lg:w-96 xl:w-[420px] bg-slate-950 border-t lg:border-t-0 border-slate-800 flex flex-col justify-between shrink-0 shadow-2xl">
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-100">Current Order</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 tabular-nums">
                {cartItemsCount} items
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Held Orders Recall Badge */}
              <button
                type="button"
                onClick={() => setIsHeldOpen(true)}
                className="relative flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-300 bg-amber-950/40 hover:bg-amber-950/70 border border-amber-900/60 rounded-lg transition-colors"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Recall</span>
                {heldOrders.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500 text-slate-950">
                    {heldOrders.length}
                  </span>
                )}
              </button>

              {/* Park Current Order */}
              <button
                type="button"
                onClick={handleHoldOrder}
                disabled={cart.length === 0}
                title="Hold current order"
                className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-850 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <PauseCircle className="w-4 h-4" />
              </button>

              {/* Clear Cart */}
              <button
                type="button"
                onClick={() => setCart([])}
                disabled={cart.length === 0}
                title="Clear order"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-850 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Customer Selector */}
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.loyaltyPoints > 0 ? `(${c.loyaltyPoints} pts)` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cart Line Items */}
        <div className="flex-1 p-4 overflow-y-auto space-y-2.5">
          {cart.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500">
              <Package className="w-10 h-10 text-slate-800 mb-2" />
              <p className="text-xs font-semibold text-slate-400">Order is currently empty</p>
              <p className="text-[11px] text-slate-600 mt-1 max-w-[200px]">
                Scan a barcode with your barcode gun or click products to ring them up.
              </p>
            </div>
          ) : (
            cart.map((item) => {
              const lineTotal = item.product.sellingPrice * item.quantity - item.discount;
              return (
                <div
                  key={item.product.id}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-100 truncate">{item.product.name}</div>
                    <div className="text-[11px] text-slate-400 tabular-nums">
                      {formatCurrency(item.product.sellingPrice, settings.currency)}
                      {item.discount > 0 && (
                        <span className="text-amber-400 ml-1">(-{formatCurrency(item.discount, settings.currency)})</span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(item.product.id, -1)}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-1.5 text-xs font-bold text-slate-100 tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(item.product.id, 1)}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Line Total & Delete */}
                  <div className="text-right">
                    <div className="font-bold text-slate-100 tabular-nums">
                      {formatCurrency(lineTotal, settings.currency)}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLine(item.product.id)}
                      className="text-[10px] text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      remove
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Cart Bottom Summary & Checkout Button */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 space-y-3">
          {/* Discount presets & Subtotals */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span className="tabular-nums font-medium">{formatCurrency(subtotal, settings.currency)}</span>
            </div>

            {/* Discount selector button */}
            <div className="flex justify-between items-center text-slate-400">
              <div className="flex items-center gap-1">
                <span>Discount</span>
                <div className="flex items-center gap-1 ml-2">
                  {[0, 5, 10, 15].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setOrderDiscountPercent(pct)}
                      className={`px-1.5 py-0.5 text-[10px] rounded font-semibold transition-colors ${
                        orderDiscountPercent === pct
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
              <span className="tabular-nums text-amber-400 font-medium">
                {totalDiscounts > 0 ? `-${formatCurrency(totalDiscounts, settings.currency)}` : '—'}
              </span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Tax (VAT {settings.defaultTaxRate * 100}%)</span>
              <span className="tabular-nums font-medium">{formatCurrency(taxTotal, settings.currency)}</span>
            </div>

            {/* Huge Total */}
            <div className="flex justify-between items-baseline pt-2 border-t border-slate-800">
              <span className="text-sm font-bold text-slate-200">TOTAL DUE</span>
              <span className="text-2xl font-extrabold text-cyan-400 tabular-nums">
                {formatCurrency(finalTotal, settings.currency)}
              </span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            type="button"
            onClick={() => setIsCheckoutOpen(true)}
            disabled={cart.length === 0}
            className="w-full py-3.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-cyan-950/60 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed group cursor-pointer"
          >
            <span>Charge / Checkout</span>
            <span className="font-mono text-xs opacity-80">(Space / Enter)</span>
          </button>
        </div>
      </div>

      {/* Custom Item Modal */}
      {isCustomItemOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form
            onSubmit={handleAddCustomItem}
            className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100">Add Custom Open Line Item</h3>
              <button
                type="button"
                onClick={() => setIsCustomItemOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Item Description / Name</label>
                <input
                  type="text"
                  placeholder="e.g. Special Delivery Fee or Custom Work"
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Unit Price ({settings.currency.symbol})</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={customItemPrice}
                  onChange={(e) => setCustomItemPrice(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCustomItemOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-lg transition-colors"
              >
                Add to Cart
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          totalDue={finalTotal}
          settings={settings}
          customer={selectedCustomer}
          onClose={() => setIsCheckoutOpen(false)}
          onCompleteSale={handleCompleteSale}
        />
      )}

      {/* Held Orders Modal */}
      {isHeldOpen && (
        <HeldOrdersModal
          heldOrders={heldOrders}
          settings={settings}
          onResumeOrder={handleResumeOrder}
          onDeleteHeldOrder={(id) => onSaveHeldOrders(heldOrders.filter((h) => h.id !== id))}
          onClose={() => setIsHeldOpen(false)}
        />
      )}

      {/* Thermal Receipt Modal */}
      {completedSale && (
        <ThermalReceiptModal
          sale={completedSale}
          settings={settings}
          onClose={() => setCompletedSale(null)}
          onNewSale={() => setCompletedSale(null)}
        />
      )}
    </div>
  );
};
