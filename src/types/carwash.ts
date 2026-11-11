/**
 * NEV CARWASH — Diamond Space Limited
 * Domain Types & Business Models
 */

export type VehicleCategory = 'car' | 'suv' | 'motorcycle' | 'bus' | 'truck' | 'other';

export type ServiceArea = 'top' | 'body' | 'under' | 'engine' | 'vacuum' | 'wax' | 'buffing' | 'carpet';

export type ShiftType = 'DAY' | 'NIGHT';

export type UserRole = 'OWNER' | 'ADMIN' | 'SUPERVISOR' | 'ACCOUNTS' | 'CLEANER' | 'DETAILER';

export type PaymentMethod = 'cash' | 'mpesa' | 'credit' | 'split';

export type VisitStatus = 'waiting' | 'in_progress' | 'quality_check' | 'ready_for_payment' | 'completed';

export interface CarwashService {
  id: string;
  name: string;
  category: VehicleCategory;
  serviceAreas: ServiceArea[];
  basePrice: number; // KSh exclusive of VAT
  vatRate: number; // 0.16
  description: string;
  estimatedMinutes: number;
}

export interface CleanerStaff {
  id: string;
  staffNumber: string;
  name: string;
  role: 'CLEANER' | 'DETAILER';
  assignedShift: ShiftType;
  phone: string;
  isClockedIn: boolean;
  totalCommissionsToday: number;
  vehiclesCompletedToday: number;
}

export interface UserAccount {
  id: string;
  staffNumber: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  pin: string;
  assignedShift: ShiftType;
}

export interface PaymentTransaction {
  id: string;
  method: 'cash' | 'mpesa' | 'credit';
  amount: number;
  reference?: string; // M-Pesa transaction code e.g. QW928174GH
  mpesaPhone?: string;
  timestamp: string;
  recordedBy: string;
}

export interface CleanerCommissionAllocation {
  cleanerId: string;
  cleanerName: string;
  assignedShift: ShiftType;
  allocatedAmount: number; // Equal share of total vehicle commission
}

export interface VehicleVisit {
  id: string;
  visitNumber: string; // e.g. VIS-2026-0891
  registrationPlate: string; // e.g. KDA 123A
  vehicleType: VehicleCategory;
  customerName: string;
  customerPhone: string;
  isCreditCustomer: boolean;
  
  // Optional Carwash Inspection Fields (Section 4.1)
  no_plastic_mat?: boolean;
  no_woolen_mat?: boolean;
  special_concerns?: string;

  // Services Selected
  services: {
    serviceId: string;
    serviceName: string;
    price: number;
    vat: number;
  }[];

  // Assigned Cleaners & Commission Engine (Section 5)
  assignedCleaners: CleanerStaff[];
  applicableShift: ShiftType; // DAY (30%) or NIGHT (35%)
  commissionRate: number; // 0.30 or 0.35
  
  // Financial breakdown
  subtotal: number; // Base service sum before tax/discount
  bargainingDiscount: number; // Reduces commission base
  loyaltyBenefit: number; // Does NOT reduce cleaner commission base
  commissionBase: number; // subtotal - bargainingDiscount
  totalCommission: number; // commissionBase * commissionRate
  cleanerAllocations: CleanerCommissionAllocation[];
  
  vatRate: number; // 0.16
  vatTotal: number;
  total: number; // Total customer bill

  // Status & Timestamps
  status: VisitStatus;
  createdAt: string;
  completedAt?: string;
  supervisorName: string;

  // Payments
  payments: PaymentTransaction[];
  amountPaid: number;
  outstandingBalance: number;
  receiptNumber?: string;
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  staffNumber: string;
  role: UserRole;
  shift: ShiftType;
  clockIn: string;
  clockOut?: string;
  durationMinutes?: number;
  attendanceStatus: 'ON_TIME' | 'LATE' | 'PENDING' | 'ABSENT';
  checkoutStatus: 'NOT_STARTED' | 'OPEN' | 'MANUAL' | 'AUTO';
  gpsLatitude: number;
  gpsLongitude: number;
  distanceMetres: number;
  isGpsOverride: boolean;
  approvedBySupervisor?: string;
  notes?: string;
}

export interface BranchDetails {
  id: number;
  name: string;
  code: string;
  town: string;
  address: string;
  latitude: number;
  longitude: number;
  attendanceRadius: number; // 100m
  active: boolean;
}

export interface CashUpReconciliation {
  id: string;
  shiftType: ShiftType;
  date: string;
  supervisorName: string;
  openingFloat: number;
  cashSales: number;
  mpesaSales: number;
  creditSales: number;
  totalSales: number;
  expensesPaid: number;
  cleanerCommissionsPaid: number;
  expectedCashInDrawer: number;
  actualCashCounted: number;
  variance: number; // actual - expected
  status: 'open' | 'closed';
  notes?: string;
  closedAt?: string;
}

export interface CarwashExpense {
  id: string;
  category: 'Detergent & Shampoo' | 'Water Tanker Refill' | 'Electricity & Tokens' | 'Machine Maintenance' | 'Towels & Consumables' | 'Staff Allowance' | 'Other';
  description: string;
  amount: number;
  paymentMethod: 'cash' | 'mpesa';
  date: string;
  recordedBy: string;
}

export interface CustomerCreditAccount {
  id: string;
  customerName: string;
  phone: string;
  email?: string;
  companyName?: string;
  creditLimit: number;
  outstandingBalance: number;
  totalInvoiced: number;
  totalPaid: number;
  visitsCount: number;
  notes?: string;
}
