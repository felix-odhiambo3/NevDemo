/**
 * NEV CARWASH MANAGEMENT SYSTEM
 * Diamond Space Limited — Kikuyu Branch (KIKUYU-001)
 * Operations, Multi-Cleaner Commission Engine, GPS Attendance, M-Pesa & Fleet Management
 */

import React, { useState } from 'react';
import {
  CarwashExpense,
  CarwashService,
  CleanerStaff,
  CustomerCreditAccount,
  ShiftType,
  VehicleVisit,
  AttendanceRecord,
  CashUpReconciliation,
} from './types/carwash';
import { CarwashStorage } from './utils/carwashStorage';
import { Navbar, CarwashNavView } from './components/layout/Navbar';
import { CarwashBayDashboard } from './components/carwash/CarwashBayDashboard';
import { VehicleEntryModal } from './components/carwash/VehicleEntryModal';
import { CommissionAndCashUpModal } from './components/carwash/CommissionAndCashUpModal';
import { AttendanceModal } from './components/carwash/AttendanceModal';
import { CreditAccountsModal } from './components/carwash/CreditAccountsModal';
import { ServicesManagerModal } from './components/carwash/ServicesManagerModal';
import { CarwashAnalyticsAndExpenses } from './components/carwash/CarwashAnalyticsAndExpenses';

export default function App() {
  // Global Carwash State backed by LocalStorage
  const [visits, setVisits] = useState<VehicleVisit[]>(() => CarwashStorage.getVisits());
  const [services, setServices] = useState<CarwashService[]>(() => CarwashStorage.getServices());
  const [staff, setStaff] = useState<CleanerStaff[]>(() => CarwashStorage.getStaff());
  const [creditAccounts, setCreditAccounts] = useState<CustomerCreditAccount[]>(() =>
    CarwashStorage.getCreditAccounts()
  );
  const [expenses, setExpenses] = useState<CarwashExpense[]>(() => CarwashStorage.getExpenses());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() =>
    CarwashStorage.getAttendance()
  );
  const [cashUp, setCashUp] = useState<CashUpReconciliation>(() => CarwashStorage.getCashUp());

  // Active View & Shift Mode (DAY: 30%, NIGHT: 35%)
  const [currentView, setCurrentView] = useState<CarwashNavView>('bays');
  const [activeShift, setActiveShift] = useState<ShiftType>('DAY');

  // Modal Controls
  const [isNewVehicleOpen, setIsNewVehicleOpen] = useState(false);
  const [isCashUpOpen, setIsCashUpOpen] = useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [isCreditOpen, setIsCreditOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  // Persistence Handlers
  const handleSaveVisits = (updated: VehicleVisit[]) => {
    setVisits(updated);
    CarwashStorage.saveVisits(updated);
  };

  const handleSaveServices = (updated: CarwashService[]) => {
    setServices(updated);
    CarwashStorage.saveServices(updated);
  };

  const handleUpdateStaff = (updated: CleanerStaff[]) => {
    setStaff(updated);
    CarwashStorage.saveStaff(updated);
  };

  const handleUpdateCreditAccounts = (updated: CustomerCreditAccount[]) => {
    setCreditAccounts(updated);
    CarwashStorage.saveCreditAccounts(updated);
  };

  const handleSaveExpenses = (updated: CarwashExpense[]) => {
    setExpenses(updated);
    CarwashStorage.saveExpenses(updated);
  };

  const handleSaveAttendance = (updated: AttendanceRecord[]) => {
    setAttendance(updated);
    CarwashStorage.saveAttendance(updated);
  };

  const handleSaveCashUp = (updated: CashUpReconciliation) => {
    setCashUp(updated);
    CarwashStorage.saveCashUp(updated);
  };

  // Add newly checked-in vehicle to visits
  const handleCheckInVehicle = (newVisit: VehicleVisit) => {
    const updatedVisits = [newVisit, ...visits];
    handleSaveVisits(updatedVisits);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-900 text-slate-100 font-sans">
      {/* Top Bar Navigation */}
      <Navbar
        currentView={currentView}
        onChangeView={(v) => setCurrentView(v)}
        activeShift={activeShift}
        onChangeShift={(s) => setActiveShift(s)}
        onOpenNewVehicle={() => setIsNewVehicleOpen(true)}
        onOpenCashUp={() => setIsCashUpOpen(true)}
        onOpenAttendance={() => setIsAttendanceOpen(true)}
        onOpenCreditAccounts={() => setIsCreditOpen(true)}
        onOpenServices={() => setIsServicesOpen(true)}
      />

      {/* Main Operational Workspace */}
      <main className="flex-1 flex overflow-hidden relative">
        {currentView === 'bays' && (
          <CarwashBayDashboard
            visits={visits}
            services={services}
            staff={staff}
            creditAccounts={creditAccounts}
            activeShift={activeShift}
            onSaveVisits={handleSaveVisits}
            onUpdateCreditAccounts={handleUpdateCreditAccounts}
            onUpdateStaff={handleUpdateStaff}
          />
        )}

        {currentView === 'reports' && (
          <CarwashAnalyticsAndExpenses
            visits={visits}
            expenses={expenses}
            staff={staff}
            onSaveExpenses={handleSaveExpenses}
            onClose={() => setCurrentView('bays')}
          />
        )}
      </main>

      {/* Modal: Check-In New Vehicle (with AI Scanner simulation & Multi-cleaner assignment) */}
      {isNewVehicleOpen && (
        <VehicleEntryModal
          services={services}
          staff={staff}
          creditAccounts={creditAccounts}
          activeShift={activeShift}
          onSaveVisit={handleCheckInVehicle}
          onClose={() => setIsNewVehicleOpen(false)}
        />
      )}

      {/* Modal: Cash-Up & Cleaner Commission Reconciliation */}
      {isCashUpOpen && (
        <CommissionAndCashUpModal
          cashUp={cashUp}
          staff={staff}
          visits={visits}
          activeShift={activeShift}
          onSaveCashUp={handleSaveCashUp}
          onClose={() => setIsCashUpOpen(false)}
        />
      )}

      {/* Modal: Staff Attendance & GPS Geofence */}
      {isAttendanceOpen && (
        <AttendanceModal
          staff={staff}
          attendanceRecords={attendance}
          activeShift={activeShift}
          onSaveAttendance={handleSaveAttendance}
          onUpdateStaff={handleUpdateStaff}
          onClose={() => setIsAttendanceOpen(false)}
        />
      )}

      {/* Modal: Fleet & Corporate Credit Accounts */}
      {isCreditOpen && (
        <CreditAccountsModal
          creditAccounts={creditAccounts}
          visits={visits}
          onSaveCreditAccounts={handleUpdateCreditAccounts}
          onClose={() => setIsCreditOpen(false)}
        />
      )}

      {/* Modal: Carwash Tariffs & Prices Manager */}
      {isServicesOpen && (
        <ServicesManagerModal
          services={services}
          onSaveServices={handleSaveServices}
          onClose={() => setIsServicesOpen(false)}
        />
      )}
    </div>
  );
}
