import {
  Product,
  Category,
  Customer,
  Supplier,
  Sale,
  ShiftSession,
  Employee,
  Timecard,
  PurchaseOrder,
  StockAdjustment,
  Expense,
  StoreSettings,
  CurrencyConfig
} from '../types/pos';

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', symbol: '$', rate: 1.0, decimals: 2 },
  { code: 'KES', symbol: 'KSh ', rate: 130.0, decimals: 0 },
  { code: 'EUR', symbol: '€', rate: 0.92, decimals: 2 },
  { code: 'GBP', symbol: '£', rate: 0.79, decimals: 2 },
  { code: 'UGX', symbol: 'USh ', rate: 3750, decimals: 0 },
  { code: 'TZS', symbol: 'TSh ', rate: 2600, decimals: 0 },
  { code: 'ZAR', symbol: 'R ', rate: 18.2, decimals: 2 }
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat_bev', name: 'Beverages', iconName: 'Coffee' },
  { id: 'cat_snack', name: 'Snacks & Bakery', iconName: 'Cookie' },
  { id: 'cat_groc', name: 'Groceries & Pantry', iconName: 'ShoppingBag' },
  { id: 'cat_dairy', name: 'Dairy & Fresh', iconName: 'Milk' },
  { id: 'cat_care', name: 'Personal Care', iconName: 'Sparkles' },
  { id: 'cat_tech', name: 'Accessories & Misc', iconName: 'Zap' },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    name: 'Mineral Water 500ml',
    sku: 'WAT-500',
    barcode: '6001001001',
    category: 'cat_bev',
    costPrice: 0.35,
    sellingPrice: 0.85,
    stock: 142,
    minStockAlert: 25,
    unit: 'bottle',
    taxRate: 0.16,
    imageUrl: 'https://images.unsplash.com/photo-1559839914-ba2ae93165a7?auto=format&fit=crop&w=400&q=80',
    branchId: 'branch_main'
  },
  {
    id: 'prod_2',
    name: 'Sparkling Soda Cola 330ml Can',
    sku: 'SOD-COL-330',
    barcode: '6001001002',
    category: 'cat_bev',
    costPrice: 0.50,
    sellingPrice: 1.25,
    stock: 98,
    minStockAlert: 20,
    unit: 'can',
    taxRate: 0.16,
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80',
    branchId: 'branch_main'
  },
  {
    id: 'prod_3',
    name: 'Fresh Whole Milk 1L Tetra',
    sku: 'MLK-WHL-1L',
    barcode: '6001001003',
    category: 'cat_dairy',
    costPrice: 0.90,
    sellingPrice: 1.65,
    stock: 34,
    minStockAlert: 15,
    unit: 'pack',
    taxRate: 0.16,
    imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80',
    branchId: 'branch_main'
  },
  {
    id: 'prod_4',
    name: 'Artisan Sourdough Loaf 500g',
    sku: 'BAK-SRD-500',
    barcode: '6001001004',
    category: 'cat_snack',
    costPrice: 1.20,
    sellingPrice: 2.80,
    stock: 18,
    minStockAlert: 10,
    unit: 'loaf',
    taxRate: 0.0,
    imageUrl: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=400&q=80',
    branchId: 'branch_main'
  },
  {
    id: 'prod_5',
    name: 'Salted Roasted Cashews 150g',
    sku: 'SNK-CSH-150',
    barcode: '6001001005',
    category: 'cat_snack',
    costPrice: 2.10,
    sellingPrice: 4.50,
    stock: 8, // Low stock test!
    minStockAlert: 12,
    unit: 'pack',
    taxRate: 0.16,
    imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=400&q=80',
    branchId: 'branch_main'
  },
  {
    id: 'prod_6',
    name: 'Premium Basmati Rice 2kg',
    sku: 'GRC-RCE-2KG',
    barcode: '6001001006',
    category: 'cat_groc',
    costPrice: 3.40,
    sellingPrice: 5.80,
    stock: 45,
    minStockAlert: 10,
    unit: 'bag',
    taxRate: 0.0,
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
    branchId: 'branch_main'
  },
  {
    id: 'prod_7',
    name: 'Pure Virgin Olive Oil 500ml',
    sku: 'GRC-OLV-500',
    barcode: '6001001007',
    category: 'cat_groc',
    costPrice: 4.80,
    sellingPrice: 8.90,
    stock: 22,
    minStockAlert: 8,
    unit: 'bottle',
    taxRate: 0.16,
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80',
    branchId: 'branch_main'
  },
  {
    id: 'prod_8',
    name: 'Organic Dark Chocolate 85% 100g',
    sku: 'SNK-CHO-100',
    barcode: '6001001008',
    category: 'cat_snack',
    costPrice: 1.40,
    sellingPrice: 3.20,
    stock: 54,
    minStockAlert: 15,
    unit: 'bar',
    taxRate: 0.16,
    imageUrl: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=400&q=80',
    branchId: 'branch_main'
  },
  {
    id: 'prod_9',
    name: 'Antibacterial Hand Wash 500ml',
    sku: 'CAR-HWS-500',
    barcode: '6001001009',
    category: 'cat_care',
    costPrice: 1.80,
    sellingPrice: 3.75,
    stock: 40,
    minStockAlert: 10,
    unit: 'bottle',
    taxRate: 0.16,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80',
    branchId: 'branch_main'
  },
  {
    id: 'prod_10',
    name: 'Fast USB-C Braided Cable 2M',
    sku: 'TCH-USBC-2M',
    barcode: '6001001010',
    category: 'cat_tech',
    costPrice: 2.50,
    sellingPrice: 6.99,
    stock: 29,
    minStockAlert: 8,
    unit: 'pcs',
    taxRate: 0.16,
    imageUrl: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=400&q=80',
    branchId: 'branch_main'
  },
  {
    id: 'prod_11',
    name: 'Almond Butter Crunch 250g',
    sku: 'GRC-ALM-250',
    barcode: '6001001011',
    category: 'cat_snack',
    costPrice: 3.20,
    sellingPrice: 6.25,
    stock: 19,
    minStockAlert: 10,
    unit: 'jar',
    taxRate: 0.16,
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80',
    branchId: 'branch_main'
  },
  {
    id: 'prod_12',
    name: 'Roasted Arabica Coffee Beans 500g',
    sku: 'BEV-COF-500',
    barcode: '6001001012',
    category: 'cat_bev',
    costPrice: 5.50,
    sellingPrice: 11.50,
    stock: 35,
    minStockAlert: 10,
    unit: 'bag',
    taxRate: 0.16,
    imageUrl: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=400&q=80',
    branchId: 'branch_main'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust_walkin',
    name: 'Walk-in Customer',
    phone: '',
    email: '',
    loyaltyPoints: 0,
    storeCreditBalance: 0,
    creditLimit: 0,
    totalSpent: 0,
    visitsCount: 0
  },
  {
    id: 'cust_1',
    name: 'Elena Rostova',
    phone: '+254 712 345 678',
    email: 'elena.rostova@example.com',
    loyaltyPoints: 340,
    storeCreditBalance: 25.0,
    creditLimit: 200,
    totalSpent: 480.50,
    visitsCount: 14,
    notes: 'Prefers organic coffee and bakery items.'
  },
  {
    id: 'cust_2',
    name: 'Marcus Vance',
    phone: '+254 722 890 123',
    email: 'marcus.v@example.com',
    loyaltyPoints: 120,
    storeCreditBalance: 0,
    creditLimit: 150,
    totalSpent: 215.00,
    visitsCount: 6
  },
  {
    id: 'cust_3',
    name: 'Amara Kiprop',
    phone: '+254 733 456 789',
    email: 'amara.kiprop@example.com',
    loyaltyPoints: 780,
    storeCreditBalance: 50.0,
    creditLimit: 500,
    totalSpent: 1120.00,
    visitsCount: 28,
    notes: 'VIP Wholesale Corporate Account - Parklands Clinic'
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp_1',
    name: 'Alex Chen',
    role: 'manager',
    pin: '1234',
    email: 'alex.chen@aguilanetpos.com',
    phone: '+254 700 112 233',
    isClockedIn: true,
    currentShiftId: 'shift_active'
  },
  {
    id: 'emp_2',
    name: 'Sarah Jenkins',
    role: 'cashier',
    pin: '0000',
    email: 'sarah.j@aguilanetpos.com',
    phone: '+254 700 445 566',
    isClockedIn: false
  },
  {
    id: 'emp_3',
    name: 'David Mwangi',
    role: 'cashier',
    pin: '1111',
    email: 'david.m@aguilanetpos.com',
    phone: '+254 700 778 899',
    isClockedIn: false
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup_1',
    name: 'Highland Pure Beverages Ltd',
    contactPerson: 'Peter Kamau',
    phone: '+254 720 001 002',
    email: 'orders@highlandbeverages.co.ke',
    address: 'Industrial Area, Nairobi',
    paymentTerms: 'Net 30 Days',
    balanceDue: 350.00
  },
  {
    id: 'sup_2',
    name: 'Brookside & Alpine Dairy Co',
    contactPerson: 'Grace Wanjiku',
    phone: '+254 720 003 004',
    email: 'supply@brookside.co.ke',
    address: 'Ruíru Logistics Park',
    paymentTerms: 'Weekly Cash',
    balanceDue: 0
  },
  {
    id: 'sup_3',
    name: 'Global Pantry & Imports Inc',
    contactPerson: 'Tariq Hassan',
    phone: '+254 720 005 006',
    email: 'accounts@globalpantry.com',
    address: 'Mombasa Road Depot 4',
    paymentTerms: 'Net 15 Days',
    balanceDue: 820.00
  }
];

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'AguilaNet Retail Hub',
  legalEntity: 'AguilaNet Systems Ltd',
  taxPinNumber: 'P051982344X',
  phone: '+254 20 800 9000',
  email: 'support@aguilanetpos.com',
  address: 'Parklands Road, Suite 4B, Nairobi, Kenya',
  website: 'https://aguilanetpos.com',
  activeBranchId: 'branch_main',
  branches: [
    { id: 'branch_main', name: 'Parklands Flagship Store', code: 'PKL-01', location: 'Parklands, Nairobi' },
    { id: 'branch_cbd', name: 'CBD Kenyatta Ave Branch', code: 'CBD-02', location: 'CBD, Nairobi' },
    { id: 'branch_wh', name: 'Central Warehouse & Hub', code: 'WHS-01', location: 'Industrial Area' },
  ],
  currency: SUPPORTED_CURRENCIES[0], // USD default
  defaultTaxRate: 0.16,
  isTaxInclusive: true,
  receiptHeader: '*** AGUILANET POS OFFICIAL TAX INVOICE ***\nTHANK YOU FOR SHOPPING WITH US',
  receiptFooter: 'GOODS ONCE SOLD CAN BE EXCHANGED WITHIN 48 HOURS WITH ORIGINAL RECEIPT\nPOWERED BY AGUILANET POS CLOUD',
  showLogoOnReceipt: true,
  soundEnabled: true,
  language: 'en'
};

export const INITIAL_ACTIVE_SHIFT: ShiftSession = {
  id: 'shift_active',
  cashierId: 'emp_1',
  cashierName: 'Alex Chen',
  startTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  openingFloat: 150.00,
  expectedCash: 150.00,
  totalSales: 0,
  totalCash: 0,
  totalCard: 0,
  totalMpesa: 0,
  totalTransfer: 0,
  totalCredit: 0,
  totalRefunds: 0,
  status: 'open',
  notes: 'Morning shift opened with standard $150.00 float count.',
  movements: [
    {
      id: 'mov_1',
      type: 'in',
      amount: 150.00,
      reason: 'Opening Register Float',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      cashierName: 'Alex Chen'
    }
  ]
};

// Generate a few baseline historical sales for charts
export const generateSeedSales = (): Sale[] => {
  const baseTime = Date.now();
  return [
    {
      id: 'sale_101',
      receiptNumber: 'REC-2026-0891',
      timestamp: new Date(baseTime - 3.5 * 3600000).toISOString(),
      cashierId: 'emp_1',
      cashierName: 'Alex Chen',
      branchId: 'branch_main',
      branchName: 'Parklands Flagship Store',
      items: [
        { productId: 'prod_1', productName: 'Mineral Water 500ml', sku: 'WAT-500', barcode: '6001001001', quantity: 2, unitPrice: 0.85, costPrice: 0.35, discount: 0, taxRate: 0.16, total: 1.70 },
        { productId: 'prod_4', productName: 'Artisan Sourdough Loaf 500g', sku: 'BAK-SRD-500', barcode: '6001001004', quantity: 1, unitPrice: 2.80, costPrice: 1.20, discount: 0, taxRate: 0.0, total: 2.80 }
      ],
      subtotal: 4.50,
      discountTotal: 0,
      taxTotal: 0.23,
      total: 4.50,
      payments: [{ method: 'cash', amount: 5.00 }],
      amountTendered: 5.00,
      changeGiven: 0.50,
      customerId: 'cust_1',
      customerName: 'Elena Rostova',
      status: 'completed'
    },
    {
      id: 'sale_102',
      receiptNumber: 'REC-2026-0892',
      timestamp: new Date(baseTime - 2.8 * 3600000).toISOString(),
      cashierId: 'emp_1',
      cashierName: 'Alex Chen',
      branchId: 'branch_main',
      branchName: 'Parklands Flagship Store',
      items: [
        { productId: 'prod_7', productName: 'Pure Virgin Olive Oil 500ml', sku: 'GRC-OLV-500', barcode: '6001001007', quantity: 1, unitPrice: 8.90, costPrice: 4.80, discount: 0, taxRate: 0.16, total: 8.90 },
        { productId: 'prod_6', productName: 'Premium Basmati Rice 2kg', sku: 'GRC-RCE-2KG', barcode: '6001001006', quantity: 1, unitPrice: 5.80, costPrice: 3.40, discount: 0, taxRate: 0.0, total: 5.80 }
      ],
      subtotal: 14.70,
      discountTotal: 0,
      taxTotal: 1.23,
      total: 14.70,
      payments: [{ method: 'card', amount: 14.70, cardLast4: '4192', reference: 'AUTH-89214' }],
      amountTendered: 14.70,
      changeGiven: 0,
      customerId: 'cust_2',
      customerName: 'Marcus Vance',
      status: 'completed'
    },
    {
      id: 'sale_103',
      receiptNumber: 'REC-2026-0893',
      timestamp: new Date(baseTime - 1.5 * 3600000).toISOString(),
      cashierId: 'emp_1',
      cashierName: 'Alex Chen',
      branchId: 'branch_main',
      branchName: 'Parklands Flagship Store',
      items: [
        { productId: 'prod_12', productName: 'Roasted Arabica Coffee Beans 500g', sku: 'BEV-COF-500', barcode: '6001001012', quantity: 2, unitPrice: 11.50, costPrice: 5.50, discount: 2.00, taxRate: 0.16, total: 21.00 },
        { productId: 'prod_8', productName: 'Organic Dark Chocolate 85% 100g', sku: 'SNK-CHO-100', barcode: '6001001008', quantity: 3, unitPrice: 3.20, costPrice: 1.40, discount: 0, taxRate: 0.16, total: 9.60 }
      ],
      subtotal: 32.60,
      discountTotal: 2.00,
      taxTotal: 4.22,
      total: 30.60,
      payments: [{ method: 'mpesa', amount: 30.60, reference: 'QW928174GH' }],
      amountTendered: 30.60,
      changeGiven: 0,
      customerId: 'cust_3',
      customerName: 'Amara Kiprop',
      status: 'completed'
    }
  ];
};

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp_1',
    category: 'Utilities',
    description: 'High-speed Fiber Internet & Terminal SIM',
    amount: 45.00,
    date: new Date(Date.now() - 24 * 3600000).toISOString(),
    paymentMethod: 'Bank Wire',
    recordedBy: 'Alex Chen'
  },
  {
    id: 'exp_2',
    category: 'Supplies',
    description: 'Thermal Receipt Paper Rolls (Pack of 50)',
    amount: 28.00,
    date: new Date(Date.now() - 12 * 3600000).toISOString(),
    paymentMethod: 'Cash',
    recordedBy: 'Alex Chen'
  }
];

export const INITIAL_TIMECARDS: Timecard[] = [
  {
    id: 'tc_1',
    employeeId: 'emp_1',
    employeeName: 'Alex Chen',
    clockIn: new Date(Date.now() - 4.5 * 3600000).toISOString(),
    status: 'clocked-in',
    ipAddress: '192.168.1.104',
    notes: 'Morning shift opening manager'
  },
  {
    id: 'tc_0',
    employeeId: 'emp_2',
    employeeName: 'Sarah Jenkins',
    clockIn: new Date(Date.now() - 28 * 3600000).toISOString(),
    clockOut: new Date(Date.now() - 20 * 3600000).toISOString(),
    durationMinutes: 480,
    status: 'clocked-out',
    ipAddress: '192.168.1.102',
    notes: 'Completed full 8hr afternoon register shift'
  }
];

// LocalStorage Helper
const STORAGE_KEYS = {
  PRODUCTS: 'aguilanet_pos_products',
  CATEGORIES: 'aguilanet_pos_categories',
  CUSTOMERS: 'aguilanet_pos_customers',
  SUPPLIERS: 'aguilanet_pos_suppliers',
  SALES: 'aguilanet_pos_sales',
  CURRENT_SHIFT: 'aguilanet_pos_current_shift',
  SHIFT_HISTORY: 'aguilanet_pos_shift_history',
  EMPLOYEES: 'aguilanet_pos_employees',
  TIMECARDS: 'aguilanet_pos_timecards',
  PURCHASE_ORDERS: 'aguilanet_pos_purchase_orders',
  STOCK_ADJUSTMENTS: 'aguilanet_pos_stock_adjustments',
  EXPENSES: 'aguilanet_pos_expenses',
  SETTINGS: 'aguilanet_pos_settings',
  HELD_ORDERS: 'aguilanet_pos_held_orders',
};

export const PosStorage = {
  getProducts(): Product[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return raw ? JSON.parse(raw) : INITIAL_PRODUCTS;
  },
  saveProducts(products: Product[]) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  getCategories(): Category[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return raw ? JSON.parse(raw) : INITIAL_CATEGORIES;
  },
  saveCategories(categories: Category[]) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },

  getCustomers(): Customer[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return raw ? JSON.parse(raw) : INITIAL_CUSTOMERS;
  },
  saveCustomers(customers: Customer[]) {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  },

  getSuppliers(): Supplier[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
    return raw ? JSON.parse(raw) : INITIAL_SUPPLIERS;
  },
  saveSuppliers(suppliers: Supplier[]) {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
  },

  getSales(): Sale[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SALES);
    return raw ? JSON.parse(raw) : generateSeedSales();
  },
  saveSales(sales: Sale[]) {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  },

  getCurrentShift(): ShiftSession {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_SHIFT);
    return raw ? JSON.parse(raw) : INITIAL_ACTIVE_SHIFT;
  },
  saveCurrentShift(shift: ShiftSession) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_SHIFT, JSON.stringify(shift));
  },

  getShiftHistory(): ShiftSession[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SHIFT_HISTORY);
    return raw ? JSON.parse(raw) : [];
  },
  saveShiftHistory(history: ShiftSession[]) {
    localStorage.setItem(STORAGE_KEYS.SHIFT_HISTORY, JSON.stringify(history));
  },

  getEmployees(): Employee[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    return raw ? JSON.parse(raw) : INITIAL_EMPLOYEES;
  },
  saveEmployees(employees: Employee[]) {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  },

  getTimecards(): Timecard[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TIMECARDS);
    return raw ? JSON.parse(raw) : INITIAL_TIMECARDS;
  },
  saveTimecards(timecards: Timecard[]) {
    localStorage.setItem(STORAGE_KEYS.TIMECARDS, JSON.stringify(timecards));
  },

  getExpenses(): Expense[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return raw ? JSON.parse(raw) : INITIAL_EXPENSES;
  },
  saveExpenses(expenses: Expense[]) {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  },

  getSettings(): StoreSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : INITIAL_SETTINGS;
  },
  saveSettings(settings: StoreSettings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  getHeldOrders(): any[] {
    const raw = localStorage.getItem(STORAGE_KEYS.HELD_ORDERS);
    return raw ? JSON.parse(raw) : [];
  },
  saveHeldOrders(orders: any[]) {
    localStorage.setItem(STORAGE_KEYS.HELD_ORDERS, JSON.stringify(orders));
  },

  resetToDefaults() {
    localStorage.clear();
    window.location.reload();
  }
};
