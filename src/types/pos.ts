/**
 * Core type definitions for AguilaNet POS
 */

export type CurrencyCode = 'USD' | 'KES' | 'EUR' | 'GBP' | 'UGX' | 'TZS' | 'ZAR';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  rate: number; // against base
  decimals: number;
}

export type LanguageCode = 'en' | 'es' | 'sw' | 'fr';

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  minStockAlert: number;
  unit: string; // 'pcs' | 'kg' | 'pack' | 'box' | 'bottle'
  taxRate: number; // e.g. 0.16 for 16%
  imageUrl?: string;
  branchId?: string;
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  discount: number; // discount amount per line or total
  discountType: 'percentage' | 'fixed';
  notes?: string;
  customPrice?: number;
}

export interface HeldOrder {
  id: string;
  holdNumber: string;
  customerName?: string;
  customerId?: string;
  items: CartItem[];
  timestamp: string;
  notes?: string;
}

export type PaymentMethod = 'cash' | 'card' | 'mpesa' | 'transfer' | 'credit';

export interface PaymentSplit {
  method: PaymentMethod;
  amount: number;
  reference?: string;
  cardLast4?: string;
}

export interface Sale {
  id: string;
  receiptNumber: string;
  timestamp: string;
  cashierId: string;
  cashierName: string;
  branchId: string;
  branchName: string;
  items: {
    productId: string;
    productName: string;
    sku: string;
    barcode: string;
    quantity: number;
    unitPrice: number;
    costPrice: number;
    discount: number;
    taxRate: number;
    total: number;
  }[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  payments: PaymentSplit[];
  amountTendered: number;
  changeGiven: number;
  customerId?: string;
  customerName?: string;
  notes?: string;
  status: 'completed' | 'refunded' | 'voided';
}

export interface CashMovement {
  id: string;
  type: 'in' | 'out';
  amount: number;
  reason: string;
  timestamp: string;
  cashierName: string;
}

export interface ShiftSession {
  id: string;
  cashierId: string;
  cashierName: string;
  startTime: string;
  endTime?: string;
  openingFloat: number;
  expectedCash: number;
  actualCash?: number;
  discrepancy?: number;
  totalSales: number;
  totalCash: number;
  totalCard: number;
  totalMpesa: number;
  totalTransfer: number;
  totalCredit: number;
  totalRefunds: number;
  status: 'open' | 'closed';
  notes?: string;
  movements: CashMovement[];
}

export interface Employee {
  id: string;
  name: string;
  role: 'cashier' | 'manager' | 'admin';
  pin: string;
  avatar?: string;
  email: string;
  phone: string;
  isClockedIn: boolean;
  currentShiftId?: string;
}

export interface Timecard {
  id: string;
  employeeId: string;
  employeeName: string;
  clockIn: string;
  clockOut?: string;
  durationMinutes?: number;
  notes?: string;
  ipAddress?: string;
  status: 'clocked-in' | 'clocked-out';
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  loyaltyPoints: number;
  storeCreditBalance: number;
  creditLimit: number;
  totalSpent: number;
  visitsCount: number;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  paymentTerms: string;
  balanceDue: number;
}

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  date: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: 'draft' | 'ordered' | 'received' | 'cancelled';
  notes?: string;
}

export interface StockAdjustment {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  adjustmentType: 'shrinkage' | 'damaged' | 'expired' | 'recount' | 'supplier_return';
  quantityChange: number; // positive or negative
  previousStock: number;
  newStock: number;
  reason: string;
  timestamp: string;
  performedBy: string;
}

export interface Expense {
  id: string;
  category: 'Rent' | 'Utilities' | 'Wages' | 'Supplies' | 'Marketing' | 'Maintenance' | 'Taxes' | 'Other';
  description: string;
  amount: number;
  date: string;
  paymentMethod: string;
  recordedBy: string;
}

export interface StoreSettings {
  storeName: string;
  legalEntity: string;
  taxPinNumber: string; // e.g. KRA PIN or Tax Registration ID
  phone: string;
  email: string;
  address: string;
  website: string;
  activeBranchId: string;
  branches: { id: string; name: string; code: string; location: string }[];
  currency: CurrencyConfig;
  defaultTaxRate: number;
  isTaxInclusive: boolean;
  receiptHeader: string;
  receiptFooter: string;
  showLogoOnReceipt: boolean;
  soundEnabled: boolean;
  language: LanguageCode;
}
