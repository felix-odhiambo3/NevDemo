import React, { useState } from 'react';
import { ShiftType } from '../../types/carwash';
import { KIKUYU_BRANCH } from '../../utils/carwashStorage';
import {
  Car,
  Layers,
  DollarSign,
  Clock,
  BarChart3,
  Building2,
  Lock,
  Volume2,
  VolumeX,
  Sparkles,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { posAudio } from '../../utils/audio';

export type CarwashNavView = 'bays' | 'reports';

interface NavbarProps {
  currentView: CarwashNavView;
  onChangeView: (view: CarwashNavView) => void;
  activeShift: ShiftType;
  onChangeShift: (shift: ShiftType) => void;
  onOpenNewVehicle: () => void;
  onOpenCashUp: () => void;
  onOpenAttendance: () => void;
  onOpenCreditAccounts: () => void;
  onOpenServices: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onChangeView,
  activeShift,
  onChangeShift,
  onOpenNewVehicle,
  onOpenCashUp,
  onOpenAttendance,
  onOpenCreditAccounts,
  onOpenServices,
}) => {
  const [soundOn, setSoundOn] = useState(posAudio.enabled);
  const [isLocked, setIsLocked] = useState(false);
  const [unlockPin, setUnlockPin] = useState('');
  const [lockError, setLockError] = useState('');

  const toggleSound = () => {
    const next = !soundOn;
    posAudio.enabled = next;
    setSoundOn(next);
    if (next) posAudio.playScanBeep();
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (unlockPin === '1234' || unlockPin === '0000') {
      setIsLocked(false);
      setUnlockPin('');
      setLockError('');
      posAudio.playSuccess();
    } else {
      posAudio.playError();
      setLockError('Invalid Supervisor PIN (default 1234)');
    }
  };

  return (
    <>
      <header className="h-14 bg-slate-950 border-b border-slate-800 px-4 md:px-6 flex items-center justify-between gap-4 shrink-0 select-none">
        {/* Zone 1: Single element brand wordmark with NEV CARWASH / Diamond Space Limited */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            onClick={() => onChangeView('bays')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-950 font-extrabold text-slate-950 text-xs tracking-tighter">
              NC
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold tracking-tight text-white whitespace-nowrap group-hover:text-cyan-400 transition-colors">
                  NEV CARWASH
                </span>
                <span className="hidden xl:inline text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                  {KIKUYU_BRANCH.code}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 tracking-tight whitespace-nowrap -mt-0.5 hidden sm:block">
                Powered by Diamond Space Limited
              </div>
            </div>
          </div>

          {/* Shift Switcher (DAY 30% / NIGHT 35%) */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[11px]">
            <button
              type="button"
              onClick={() => onChangeShift('DAY')}
              className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                activeShift === 'DAY'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ☀ Day (30%)
            </button>
            <button
              type="button"
              onClick={() => onChangeShift('NIGHT')}
              className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                activeShift === 'NIGHT'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🌙 Night (35%)
            </button>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-400">
          <button
            type="button"
            onClick={() => onChangeView('bays')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              currentView === 'bays'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold'
                : 'hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Washing Bays</span>
          </button>

          <button
            type="button"
            onClick={onOpenServices}
            className="px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 hover:text-slate-200 hover:bg-slate-900"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tariff Rates</span>
          </button>

          <button
            type="button"
            onClick={onOpenCashUp}
            className="px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 hover:text-slate-200 hover:bg-slate-900"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Cash-Up &amp; Commission</span>
          </button>

          <button
            type="button"
            onClick={onOpenAttendance}
            className="px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 hover:text-slate-200 hover:bg-slate-900"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>GPS Attendance</span>
          </button>

          <button
            type="button"
            onClick={onOpenCreditAccounts}
            className="px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 hover:text-slate-200 hover:bg-slate-900"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Fleet Accounts</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeView('reports')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              currentView === 'reports'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold'
                : 'hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analytics &amp; Costs</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action + Quick Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenNewVehicle}
            className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-950 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Check-In Vehicle</span>
          </button>

          {/* Sound Mute/Unmute */}
          <button
            type="button"
            onClick={toggleSound}
            title={soundOn ? 'Sound FX Enabled' : 'Sound FX Muted'}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Lock Register */}
          <button
            type="button"
            onClick={() => setIsLocked(true)}
            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-900 rounded-lg transition-colors"
            title="Lock Supervisor Terminal"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Screen Lock Overlay */}
      {isLocked && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4">
          <form
            onSubmit={handleUnlock}
            className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-center space-y-4"
          >
            <div className="w-12 h-12 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-slate-100 text-base">NEV CARWASH Supervisor Locked</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Diamond Space Limited · Kikuyu Yard Terminal
              </p>
            </div>

            {lockError && <div className="text-xs text-rose-400 font-semibold">{lockError}</div>}

            <div>
              <input
                type="password"
                placeholder="Enter Supervisor PIN (1234)"
                autoFocus
                value={unlockPin}
                onChange={(e) => setUnlockPin(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-center text-lg font-mono text-white tracking-widest focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              Unlock Terminal
            </button>
          </form>
        </div>
      )}
    </>
  );
};
