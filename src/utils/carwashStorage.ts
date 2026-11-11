import {
  BranchDetails,
  CarwashExpense,
  CarwashService,
  CleanerStaff,
  CustomerCreditAccount,
  UserAccount,
  VehicleVisit,
  AttendanceRecord,
  CashUpReconciliation,
} from '../types/carwash';

export const KIKUYU_BRANCH: BranchDetails = {
  id: 1,
  name: 'Diamond Space Kikuyu',
  code: 'KIKUYU-001',
  town: 'Kikuyu',
  address: 'Kikuyu Town, Kiambu County, Kenya',
  latitude: -1.246902,
  longitude: 36.660771,
  attendanceRadius: 100, // 100 metres
  active: true,
};

export const INITIAL_SERVICES: CarwashService[] = [
  // Sedan / Small Cars
  {
    id: 'srv_car_body',
    name: 'Body Wash & Foam Rinse (Sedan)',
    category: 'car',
    serviceAreas: ['top', 'body'],
    basePrice: 250,
    vatRate: 0.16,
    description: 'High-pressure foam wash, wheel arches rinse and microfiber chamois dry.',
    estimatedMinutes: 20,
  },
  {
    id: 'srv_car_under',
    name: 'Underwash / Chassis Pressure Clean (Sedan)',
    category: 'car',
    serviceAreas: ['under'],
    basePrice: 200,
    vatRate: 0.16,
    description: 'Undercarriage ramp wash to remove mud, road grime and salt.',
    estimatedMinutes: 15,
  },
  {
    id: 'srv_car_vacuum',
    name: 'Interior Vacuum & Dashboard Dusting (Sedan)',
    category: 'car',
    serviceAreas: ['vacuum'],
    basePrice: 200,
    vatRate: 0.16,
    description: 'Deep vacuum of seats, carpets, trunk, plus dash polish.',
    estimatedMinutes: 20,
  },
  {
    id: 'srv_car_engine',
    name: 'Engine Bay Wash & Degrease (Sedan)',
    category: 'car',
    serviceAreas: ['engine'],
    basePrice: 250,
    vatRate: 0.16,
    description: 'Specialized grease remover, low pressure rinse with sensor protection.',
    estimatedMinutes: 15,
  },
  {
    id: 'srv_car_full',
    name: 'Full Executive Package (Sedan)',
    category: 'car',
    serviceAreas: ['top', 'body', 'under', 'engine', 'vacuum'],
    basePrice: 800,
    vatRate: 0.16,
    description: 'Complete bumper-to-bumper: Body + Underwash + Engine + Interior Vacuum + Tire Shine.',
    estimatedMinutes: 45,
  },
  {
    id: 'srv_car_wax',
    name: 'Carnauba Hand Wax & Buffing (Sedan)',
    category: 'car',
    serviceAreas: ['wax', 'buffing'],
    basePrice: 500,
    vatRate: 0.16,
    description: 'Protective hand wax coating and machine buffing for deep gloss shine.',
    estimatedMinutes: 30,
  },

  // SUV / 4x4 / Pickups
  {
    id: 'srv_suv_body',
    name: 'SUV Body Wash & Foam Rinse',
    category: 'suv',
    serviceAreas: ['top', 'body'],
    basePrice: 350,
    vatRate: 0.16,
    description: 'High-pressure foam exterior wash for SUV / 4x4 / Double Cab.',
    estimatedMinutes: 25,
  },
  {
    id: 'srv_suv_under',
    name: 'SUV Underwash Chassis Blast',
    category: 'suv',
    serviceAreas: ['under'],
    basePrice: 300,
    vatRate: 0.16,
    description: 'Ramp heavy mud removal and chassis pressure wash.',
    estimatedMinutes: 20,
  },
  {
    id: 'srv_suv_vacuum',
    name: 'SUV Interior Deep Vacuum',
    category: 'suv',
    serviceAreas: ['vacuum'],
    basePrice: 250,
    vatRate: 0.16,
    description: '7-seater / 5-seater floor mats, seat folds, and trunk vacuuming.',
    estimatedMinutes: 25,
  },
  {
    id: 'srv_suv_engine',
    name: 'SUV Engine Bay Steam Clean',
    category: 'suv',
    serviceAreas: ['engine'],
    basePrice: 300,
    vatRate: 0.16,
    description: 'Heavy duty diesel/petrol engine bay steam & dress.',
    estimatedMinutes: 20,
  },
  {
    id: 'srv_suv_full',
    name: 'SUV Full Executive Package',
    category: 'suv',
    serviceAreas: ['top', 'body', 'under', 'engine', 'vacuum'],
    basePrice: 1100,
    vatRate: 0.16,
    description: 'Top, Body, Under, Engine, Vacuum, Tire shine & Fragrance.',
    estimatedMinutes: 60,
  },

  // Bodaboda / Motorcycles
  {
    id: 'srv_boda_full',
    name: 'Bodaboda / Motorcycle Full Wash',
    category: 'motorcycle',
    serviceAreas: ['top', 'body', 'engine'],
    basePrice: 150,
    vatRate: 0.16,
    description: 'Full bike degrease, engine cleaning, spoke polishing and seat shine.',
    estimatedMinutes: 15,
  },

  // Matatus / Mini-Buses
  {
    id: 'srv_bus_body',
    name: 'Matatu / Mini-Bus Body & Interior',
    category: 'bus',
    serviceAreas: ['top', 'body', 'vacuum'],
    basePrice: 700,
    vatRate: 0.16,
    description: '14-seater / 33-seater exterior wash, aisle mopping and window glass shine.',
    estimatedMinutes: 35,
  },
  {
    id: 'srv_bus_full',
    name: 'Matatu Full Service Package',
    category: 'bus',
    serviceAreas: ['top', 'body', 'under', 'engine', 'vacuum'],
    basePrice: 1200,
    vatRate: 0.16,
    description: 'Full body, high pressure underwash, engine steam and complete cabin cleaning.',
    estimatedMinutes: 60,
  },

  // Trucks / Lorries
  {
    id: 'srv_truck_full',
    name: 'Commercial Truck / Tipper Full Wash',
    category: 'truck',
    serviceAreas: ['top', 'body', 'under'],
    basePrice: 1500,
    vatRate: 0.16,
    description: 'Heavy machinery chassis blast, cabin exterior and mud flaps rinse.',
    estimatedMinutes: 70,
  },
];

export const INITIAL_STAFF: CleanerStaff[] = [
  // Day Shift Cleaners (30% commission rate)
  { id: 'cln_1', staffNumber: 'NC-CLN-01', name: 'John Kamau', role: 'CLEANER', assignedShift: 'DAY', phone: '+254 712 110 001', isClockedIn: true, totalCommissionsToday: 720, vehiclesCompletedToday: 5 },
  { id: 'cln_2', staffNumber: 'NC-CLN-02', name: 'Peter Omondi', role: 'CLEANER', assignedShift: 'DAY', phone: '+254 712 110 002', isClockedIn: true, totalCommissionsToday: 690, vehiclesCompletedToday: 4 },
  { id: 'cln_3', staffNumber: 'NC-CLN-03', name: 'Samuel Mwangi', role: 'CLEANER', assignedShift: 'DAY', phone: '+254 712 110 003', isClockedIn: true, totalCommissionsToday: 840, vehiclesCompletedToday: 6 },
  { id: 'cln_4', staffNumber: 'NC-CLN-04', name: 'Brian Kiprono', role: 'CLEANER', assignedShift: 'DAY', phone: '+254 712 110 004', isClockedIn: true, totalCommissionsToday: 510, vehiclesCompletedToday: 3 },
  { id: 'cln_5', staffNumber: 'NC-CLN-05', name: 'James Mutua', role: 'CLEANER', assignedShift: 'DAY', phone: '+254 712 110 005', isClockedIn: true, totalCommissionsToday: 630, vehiclesCompletedToday: 4 },
  { id: 'cln_6', staffNumber: 'NC-CLN-06', name: 'Denis Otieno', role: 'CLEANER', assignedShift: 'DAY', phone: '+254 712 110 006', isClockedIn: true, totalCommissionsToday: 480, vehiclesCompletedToday: 3 },
  { id: 'cln_7', staffNumber: 'NC-CLN-07', name: 'Francis Kimani', role: 'CLEANER', assignedShift: 'DAY', phone: '+254 712 110 007', isClockedIn: false, totalCommissionsToday: 0, vehiclesCompletedToday: 0 },
  { id: 'cln_8', staffNumber: 'NC-CLN-08', name: 'Patrick Njoroge', role: 'DETAILER', assignedShift: 'DAY', phone: '+254 712 110 008', isClockedIn: true, totalCommissionsToday: 950, vehiclesCompletedToday: 3 },

  // Night Shift Cleaners (35% commission rate)
  { id: 'cln_9', staffNumber: 'NC-CLN-09', name: 'Kelvin Maina', role: 'CLEANER', assignedShift: 'NIGHT', phone: '+254 712 110 009', isClockedIn: false, totalCommissionsToday: 0, vehiclesCompletedToday: 0 },
  { id: 'cln_10', staffNumber: 'NC-CLN-10', name: 'Evans Ochieng', role: 'CLEANER', assignedShift: 'NIGHT', phone: '+254 712 110 010', isClockedIn: false, totalCommissionsToday: 0, vehiclesCompletedToday: 0 },
  { id: 'cln_11', staffNumber: 'NC-CLN-11', name: 'Victor Cheruiyot', role: 'CLEANER', assignedShift: 'NIGHT', phone: '+254 712 110 011', isClockedIn: false, totalCommissionsToday: 0, vehiclesCompletedToday: 0 },
  { id: 'cln_12', staffNumber: 'NC-CLN-12', name: 'Moses Kariuki', role: 'CLEANER', assignedShift: 'NIGHT', phone: '+254 712 110 012', isClockedIn: false, totalCommissionsToday: 0, vehiclesCompletedToday: 0 },
];

export const INITIAL_SUPERVISOR: UserAccount = {
  id: 'usr_sup_1',
  staffNumber: 'NC-SUP-01',
  name: 'Joseph Karanja',
  role: 'SUPERVISOR',
  email: 'supervisor@diamondspacelimited.com',
  phone: '+254 722 900 100',
  pin: '1234',
  assignedShift: 'DAY',
};

export const INITIAL_CREDIT_ACCOUNTS: CustomerCreditAccount[] = [
  {
    id: 'cred_1',
    customerName: 'Kikuyu Express Matatu Sacco',
    phone: '+254 720 334 455',
    companyName: 'Kikuyu Express Sacco Ltd',
    creditLimit: 50000,
    outstandingBalance: 14200,
    totalInvoiced: 86400,
    totalPaid: 72200,
    visitsCount: 74,
    notes: 'Fleet account of 12 Matatus. Billed bi-weekly with official VAT receipt.',
  },
  {
    id: 'cred_2',
    customerName: 'Dr. Anne Mwangi',
    phone: '+254 733 987 654',
    companyName: 'Kikuyu Health Consultants',
    creditLimit: 15000,
    outstandingBalance: 3200,
    totalInvoiced: 21500,
    totalPaid: 18300,
    visitsCount: 16,
    notes: 'Monthly corporate settle via Bank / M-Pesa.',
  },
  {
    id: 'cred_3',
    customerName: 'County Transport Services',
    phone: '+254 700 882 119',
    companyName: 'Kiambu County Depot',
    creditLimit: 100000,
    outstandingBalance: 24500,
    totalInvoiced: 154000,
    totalPaid: 129500,
    visitsCount: 92,
    notes: 'County inspection vehicles & pickups.',
  },
];

export const INITIAL_VISITS: VehicleVisit[] = [
  // 1. Vehicle Currently in Wash Bay
  {
    id: 'vis_101',
    visitNumber: 'VIS-2026-0341',
    registrationPlate: 'KDA 123A',
    vehicleType: 'car',
    customerName: 'Samuel Gitau',
    customerPhone: '+254 721 554 321',
    isCreditCustomer: false,
    no_plastic_mat: false,
    no_woolen_mat: true,
    special_concerns: 'Handle trunk release gently, scratch on rear bumper.',
    services: [
      { serviceId: 'srv_car_body', serviceName: 'Body Wash & Foam Rinse (Sedan)', price: 250, vat: 40 },
      { serviceId: 'srv_car_vacuum', serviceName: 'Interior Vacuum & Dashboard Dusting (Sedan)', price: 200, vat: 32 },
    ],
    assignedCleaners: [INITIAL_STAFF[0], INITIAL_STAFF[1]], // John Kamau & Peter Omondi
    applicableShift: 'DAY',
    commissionRate: 0.30,
    subtotal: 450,
    bargainingDiscount: 0,
    loyaltyBenefit: 0,
    commissionBase: 450,
    totalCommission: 135, // 450 * 0.30
    cleanerAllocations: [
      { cleanerId: 'cln_1', cleanerName: 'John Kamau', assignedShift: 'DAY', allocatedAmount: 67.5 },
      { cleanerId: 'cln_2', cleanerName: 'Peter Omondi', assignedShift: 'DAY', allocatedAmount: 67.5 },
    ],
    vatRate: 0.16,
    vatTotal: 72,
    total: 522,
    status: 'in_progress',
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
    supervisorName: 'Joseph Karanja',
    payments: [],
    amountPaid: 0,
    outstandingBalance: 522,
  },

  // 2. SUV Finished & Ready for Payment
  {
    id: 'vis_102',
    visitNumber: 'VIS-2026-0342',
    registrationPlate: 'KDG 456X',
    vehicleType: 'suv',
    customerName: 'Catherine Wanjiru',
    customerPhone: '+254 722 889 001',
    isCreditCustomer: false,
    no_plastic_mat: false,
    no_woolen_mat: false,
    special_concerns: 'Extra mud under chassis from countryside trip.',
    services: [
      { serviceId: 'srv_suv_full', serviceName: 'SUV Full Executive Package', price: 1100, vat: 176 },
    ],
    assignedCleaners: [INITIAL_STAFF[2], INITIAL_STAFF[3]], // Samuel Mwangi & Brian Kiprono
    applicableShift: 'DAY',
    commissionRate: 0.30,
    subtotal: 1100,
    bargainingDiscount: 100, // Customer bargained 100 KSh off
    loyaltyBenefit: 0,
    commissionBase: 1000, // 1100 - 100
    totalCommission: 300, // 1000 * 0.30
    cleanerAllocations: [
      { cleanerId: 'cln_3', cleanerName: 'Samuel Mwangi', assignedShift: 'DAY', allocatedAmount: 150 },
      { cleanerId: 'cln_4', cleanerName: 'Brian Kiprono', assignedShift: 'DAY', allocatedAmount: 150 },
    ],
    vatRate: 0.16,
    vatTotal: 160,
    total: 1160,
    status: 'ready_for_payment',
    createdAt: new Date(Date.now() - 50 * 60000).toISOString(),
    supervisorName: 'Joseph Karanja',
    payments: [],
    amountPaid: 0,
    outstandingBalance: 1160,
  },

  // 3. Matatu on Corporate Credit Account (Completed & Delivered)
  {
    id: 'vis_103',
    visitNumber: 'VIS-2026-0343',
    registrationPlate: 'KCA 789B',
    vehicleType: 'bus',
    customerName: 'Kikuyu Express Matatu Sacco',
    customerPhone: '+254 720 334 455',
    isCreditCustomer: true,
    no_plastic_mat: true,
    no_woolen_mat: true,
    special_concerns: 'Matatu Fleet #14 - Quick turnaround for 11am trip to Nairobi.',
    services: [
      { serviceId: 'srv_bus_body', serviceName: 'Matatu / Mini-Bus Body & Interior', price: 700, vat: 112 },
    ],
    assignedCleaners: [INITIAL_STAFF[4], INITIAL_STAFF[5]], // James Mutua & Denis Otieno
    applicableShift: 'DAY',
    commissionRate: 0.30,
    subtotal: 700,
    bargainingDiscount: 0,
    loyaltyBenefit: 0,
    commissionBase: 700,
    totalCommission: 210, // 700 * 0.30
    cleanerAllocations: [
      { cleanerId: 'cln_5', cleanerName: 'James Mutua', assignedShift: 'DAY', allocatedAmount: 105 },
      { cleanerId: 'cln_6', cleanerName: 'Denis Otieno', assignedShift: 'DAY', allocatedAmount: 105 },
    ],
    vatRate: 0.16,
    vatTotal: 112,
    total: 812,
    status: 'completed',
    createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
    completedAt: new Date(Date.now() - 35 * 60000).toISOString(),
    supervisorName: 'Joseph Karanja',
    payments: [
      {
        id: 'pay_1',
        method: 'credit',
        amount: 812,
        reference: 'CREDIT-INV-0343',
        timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
        recordedBy: 'Joseph Karanja',
      },
    ],
    amountPaid: 812,
    outstandingBalance: 0,
    receiptNumber: 'REC-NC-2026-0343',
  },

  // 4. Completed Paid Visit with Split Payment (Cash + M-Pesa)
  {
    id: 'vis_104',
    visitNumber: 'VIS-2026-0344',
    registrationPlate: 'KBZ 101Y',
    vehicleType: 'car',
    customerName: 'Paul Kinuthia',
    customerPhone: '+254 711 223 344',
    isCreditCustomer: false,
    services: [
      { serviceId: 'srv_car_full', serviceName: 'Full Executive Package (Sedan)', price: 800, vat: 128 },
    ],
    assignedCleaners: [INITIAL_STAFF[0], INITIAL_STAFF[7]], // John Kamau & Patrick Njoroge (Detailer)
    applicableShift: 'DAY',
    commissionRate: 0.30,
    subtotal: 800,
    bargainingDiscount: 0,
    loyaltyBenefit: 0,
    commissionBase: 800,
    totalCommission: 240,
    cleanerAllocations: [
      { cleanerId: 'cln_1', cleanerName: 'John Kamau', assignedShift: 'DAY', allocatedAmount: 120 },
      { cleanerId: 'cln_8', cleanerName: 'Patrick Njoroge', assignedShift: 'DAY', allocatedAmount: 120 },
    ],
    vatRate: 0.16,
    vatTotal: 128,
    total: 928,
    status: 'completed',
    createdAt: new Date(Date.now() - 140 * 60000).toISOString(),
    completedAt: new Date(Date.now() - 75 * 60000).toISOString(),
    supervisorName: 'Joseph Karanja',
    payments: [
      {
        id: 'pay_split_1',
        method: 'cash',
        amount: 500,
        timestamp: new Date(Date.now() - 75 * 60000).toISOString(),
        recordedBy: 'Joseph Karanja',
      },
      {
        id: 'pay_split_2',
        method: 'mpesa',
        amount: 428,
        reference: 'QW928174GH',
        mpesaPhone: '254711223344',
        timestamp: new Date(Date.now() - 75 * 60000).toISOString(),
        recordedBy: 'Joseph Karanja',
      },
    ],
    amountPaid: 928,
    outstandingBalance: 0,
    receiptNumber: 'REC-NC-2026-0344',
  },
];

export const INITIAL_EXPENSES: CarwashExpense[] = [
  {
    id: 'exp_1',
    category: 'Water Tanker Refill',
    description: '10,000 Litres Clean Borehole Water Tanker Bowser',
    amount: 2500,
    paymentMethod: 'mpesa',
    date: new Date(Date.now() - 5 * 3600000).toISOString(),
    recordedBy: 'Joseph Karanja',
  },
  {
    id: 'exp_2',
    category: 'Detergent & Shampoo',
    description: '20L Commercial Snow Foam Carwash Shampoo & Degreaser',
    amount: 3200,
    paymentMethod: 'cash',
    date: new Date(Date.now() - 24 * 3600000).toISOString(),
    recordedBy: 'Mercy Wambui',
  },
  {
    id: 'exp_3',
    category: 'Electricity & Tokens',
    description: 'KPLC Prepaid Electricity Tokens for Pressure Pumps',
    amount: 1500,
    paymentMethod: 'mpesa',
    date: new Date(Date.now() - 12 * 3600000).toISOString(),
    recordedBy: 'Joseph Karanja',
  },
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att_1',
    staffId: 'cln_1',
    staffName: 'John Kamau',
    staffNumber: 'NC-CLN-01',
    role: 'CLEANER',
    shift: 'DAY',
    clockIn: new Date(Date.now() - 4.5 * 3600000).toISOString(),
    attendanceStatus: 'ON_TIME',
    checkoutStatus: 'OPEN',
    gpsLatitude: -1.246890,
    gpsLongitude: 36.660750,
    distanceMetres: 18,
    isGpsOverride: false,
    notes: 'Kikuyu Yard Bay 1',
  },
  {
    id: 'att_2',
    staffId: 'cln_2',
    staffName: 'Peter Omondi',
    staffNumber: 'NC-CLN-02',
    role: 'CLEANER',
    shift: 'DAY',
    clockIn: new Date(Date.now() - 4.4 * 3600000).toISOString(),
    attendanceStatus: 'ON_TIME',
    checkoutStatus: 'OPEN',
    gpsLatitude: -1.246910,
    gpsLongitude: 36.660790,
    distanceMetres: 22,
    isGpsOverride: false,
    notes: 'Kikuyu Yard Bay 2',
  },
  {
    id: 'att_3',
    staffId: 'cln_8',
    staffName: 'Patrick Njoroge',
    staffNumber: 'NC-CLN-08',
    role: 'DETAILER',
    shift: 'DAY',
    clockIn: new Date(Date.now() - 4.0 * 3600000).toISOString(),
    attendanceStatus: 'LATE',
    checkoutStatus: 'OPEN',
    gpsLatitude: -1.246902,
    gpsLongitude: 36.660771,
    distanceMetres: 0,
    isGpsOverride: true,
    approvedBySupervisor: 'Joseph Karanja',
    notes: 'Approved late clock-in by supervisor due to road traffic.',
  },
];

export const INITIAL_CASHUP: CashUpReconciliation = {
  id: 'csh_today_day',
  shiftType: 'DAY',
  date: new Date().toISOString().split('T')[0],
  supervisorName: 'Joseph Karanja',
  openingFloat: 3000, // 3,000 KSh starting float in drawer
  cashSales: 500,
  mpesaSales: 428,
  creditSales: 812,
  totalSales: 1740,
  expensesPaid: 0,
  cleanerCommissionsPaid: 0,
  expectedCashInDrawer: 3500, // 3000 float + 500 cash
  actualCashCounted: 3500,
  variance: 0,
  status: 'open',
  notes: 'Day shift ongoing. Active cleaning bays running.',
};

// LocalStorage Persistence Keys
const CARWASH_STORAGE_KEYS = {
  SERVICES: 'nev_carwash_services',
  STAFF: 'nev_carwash_staff',
  VISITS: 'nev_carwash_visits',
  CREDIT_ACCOUNTS: 'nev_carwash_credit_accounts',
  EXPENSES: 'nev_carwash_expenses',
  ATTENDANCE: 'nev_carwash_attendance',
  CASHUP: 'nev_carwash_cashup',
};

export const CarwashStorage = {
  getServices(): CarwashService[] {
    const raw = localStorage.getItem(CARWASH_STORAGE_KEYS.SERVICES);
    return raw ? JSON.parse(raw) : INITIAL_SERVICES;
  },
  saveServices(services: CarwashService[]) {
    localStorage.setItem(CARWASH_STORAGE_KEYS.SERVICES, JSON.stringify(services));
  },

  getStaff(): CleanerStaff[] {
    const raw = localStorage.getItem(CARWASH_STORAGE_KEYS.STAFF);
    return raw ? JSON.parse(raw) : INITIAL_STAFF;
  },
  saveStaff(staff: CleanerStaff[]) {
    localStorage.setItem(CARWASH_STORAGE_KEYS.STAFF, JSON.stringify(staff));
  },

  getVisits(): VehicleVisit[] {
    const raw = localStorage.getItem(CARWASH_STORAGE_KEYS.VISITS);
    return raw ? JSON.parse(raw) : INITIAL_VISITS;
  },
  saveVisits(visits: VehicleVisit[]) {
    localStorage.setItem(CARWASH_STORAGE_KEYS.VISITS, JSON.stringify(visits));
  },

  getCreditAccounts(): CustomerCreditAccount[] {
    const raw = localStorage.getItem(CARWASH_STORAGE_KEYS.CREDIT_ACCOUNTS);
    return raw ? JSON.parse(raw) : INITIAL_CREDIT_ACCOUNTS;
  },
  saveCreditAccounts(accounts: CustomerCreditAccount[]) {
    localStorage.setItem(CARWASH_STORAGE_KEYS.CREDIT_ACCOUNTS, JSON.stringify(accounts));
  },

  getExpenses(): CarwashExpense[] {
    const raw = localStorage.getItem(CARWASH_STORAGE_KEYS.EXPENSES);
    return raw ? JSON.parse(raw) : INITIAL_EXPENSES;
  },
  saveExpenses(expenses: CarwashExpense[]) {
    localStorage.setItem(CARWASH_STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  },

  getAttendance(): AttendanceRecord[] {
    const raw = localStorage.getItem(CARWASH_STORAGE_KEYS.ATTENDANCE);
    return raw ? JSON.parse(raw) : INITIAL_ATTENDANCE;
  },
  saveAttendance(records: AttendanceRecord[]) {
    localStorage.setItem(CARWASH_STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
  },

  getCashUp(): CashUpReconciliation {
    const raw = localStorage.getItem(CARWASH_STORAGE_KEYS.CASHUP);
    return raw ? JSON.parse(raw) : INITIAL_CASHUP;
  },
  saveCashUp(cashup: CashUpReconciliation) {
    localStorage.setItem(CARWASH_STORAGE_KEYS.CASHUP, JSON.stringify(cashup));
  },

  resetDefaults() {
    localStorage.clear();
    window.location.reload();
  },
};
