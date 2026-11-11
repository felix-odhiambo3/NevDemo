import React, { useState } from 'react';
import { Employee, Timecard } from '../../types/pos';
import { formatDateTime } from '../../utils/formatters';
import { posAudio } from '../../utils/audio';
import { Clock, KeyRound, CheckCircle2, User, X, LogIn, LogOut, ShieldCheck } from 'lucide-react';

interface ClockInOutModalProps {
  employees: Employee[];
  timecards: Timecard[];
  onUpdateTimecards: (timecards: Timecard[]) => void;
  onUpdateEmployees: (employees: Employee[]) => void;
  onClose: () => void;
}

export const ClockInOutModal: React.FC<ClockInOutModalProps> = ({
  employees,
  timecards,
  onUpdateTimecards,
  onUpdateEmployees,
  onClose,
}) => {
  const [pin, setPin] = useState('');
  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || '');
  const [shiftNote, setShiftNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'punch' | 'logs'>('punch');

  const selectedEmployee = employees.find((e) => e.id === selectedEmpId) || employees[0];

  const handleKeypadPress = (num: string) => {
    if (pin.length < 6) {
      setPin(pin + num);
      setErrorMsg('');
    }
  };

  const handleClearPin = () => {
    setPin('');
    setErrorMsg('');
  };

  const handlePunchClock = (action: 'in' | 'out') => {
    if (!selectedEmployee) return;

    if (pin !== selectedEmployee.pin) {
      posAudio.playError();
      setErrorMsg('Invalid Security PIN. Please verify your cashier code.');
      return;
    }

    const now = new Date();
    const simulatedIp = '192.168.1.104';

    if (action === 'in') {
      const newCard: Timecard = {
        id: `tc_${Date.now()}`,
        employeeId: selectedEmployee.id,
        employeeName: selectedEmployee.name,
        clockIn: now.toISOString(),
        status: 'clocked-in',
        notes: shiftNote.trim() || undefined,
        ipAddress: simulatedIp,
      };

      const updatedTimecards = [newCard, ...timecards];
      const updatedEmployees = employees.map((e) =>
        e.id === selectedEmployee.id ? { ...e, isClockedIn: true } : e
      );

      onUpdateTimecards(updatedTimecards);
      onUpdateEmployees(updatedEmployees);
      posAudio.playSuccess();
      setSuccessMsg(`Welcome, ${selectedEmployee.name}! Clocked in successfully.`);
    } else {
      // Find open timecard for this employee
      const openIndex = timecards.findIndex(
        (tc) => tc.employeeId === selectedEmployee.id && tc.status === 'clocked-in'
      );

      let updatedTimecards = [...timecards];
      if (openIndex > -1) {
        const openCard = updatedTimecards[openIndex];
        const inTime = new Date(openCard.clockIn).getTime();
        const durationMins = Math.round((now.getTime() - inTime) / 60000);

        updatedTimecards[openIndex] = {
          ...openCard,
          clockOut: now.toISOString(),
          durationMinutes: Math.max(1, durationMins),
          status: 'clocked-out',
          notes: shiftNote.trim() || openCard.notes,
        };
      }

      const updatedEmployees = employees.map((e) =>
        e.id === selectedEmployee.id ? { ...e, isClockedIn: false } : e
      );

      onUpdateTimecards(updatedTimecards);
      onUpdateEmployees(updatedEmployees);
      posAudio.playSuccess();
      setSuccessMsg(`Goodbye, ${selectedEmployee.name}! Shift ended & logged.`);
    }

    setPin('');
    setShiftNote('');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-base font-bold text-slate-100">Staff Timecard &amp; Attendance</h2>
              <p className="text-xs text-slate-400">PIN-authenticated biometric shift punch &amp; hours tracker</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-6 py-2 border-b border-slate-800 bg-slate-950/40 flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('punch')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-colors ${
              activeTab === 'punch'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Clock In / Out Punch
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-colors ${
              activeTab === 'logs'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Attendance Timesheet Logs
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'punch' ? (
            <div className="space-y-4">
              {/* Messages */}
              {successMsg && (
                <div className="p-3 bg-emerald-950/50 border border-emerald-800 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}
              {errorMsg && (
                <div className="p-3 bg-rose-950/50 border border-rose-800 rounded-xl text-rose-300 text-xs">
                  {errorMsg}
                </div>
              )}

              {/* Employee Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Select Staff Member</label>
                <div className="grid grid-cols-3 gap-2">
                  {employees.map((emp) => {
                    const isSelected = emp.id === selectedEmpId;
                    return (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => {
                          setSelectedEmpId(emp.id);
                          setPin('');
                          setErrorMsg('');
                        }}
                        className={`p-3 rounded-xl border text-left text-xs transition-all ${
                          isSelected
                            ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="font-semibold text-slate-100 truncate">{emp.name}</div>
                        <div className="text-[10px] text-slate-500 capitalize">{emp.role}</div>
                        <div className="mt-2 flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              emp.isClockedIn ? 'bg-emerald-400' : 'bg-slate-600'
                            }`}
                          />
                          <span className="text-[10px]">
                            {emp.isClockedIn ? 'On Duty' : 'Off Duty'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PIN Code Keypad */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 max-w-xs mx-auto space-y-3">
                <div className="text-center">
                  <span className="text-xs text-slate-400 block font-medium">ENTER CASHIER PIN</span>
                  <div className="h-10 flex items-center justify-center gap-2 mt-1">
                    {[0, 1, 2, 3].map((_, i) => (
                      <div
                        key={i}
                        className={`w-3.5 h-3.5 rounded-full border ${
                          pin.length > i
                            ? 'bg-cyan-400 border-cyan-400'
                            : 'border-slate-700 bg-slate-900'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                    <button
                      key={digit}
                      type="button"
                      onClick={() => handleKeypadPress(digit)}
                      className="p-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold text-sm transition-colors"
                    >
                      {digit}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleClearPin}
                    className="p-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-rose-400 text-xs font-semibold"
                  >
                    CLR
                  </button>
                  <button
                    type="button"
                    onClick={() => handleKeypadPress('0')}
                    className="p-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold text-sm"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={() => setPin(selectedEmployee?.pin || '1234')}
                    className="p-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 text-[10px] font-semibold"
                    title="Auto-fill demo PIN"
                  >
                    DEMO
                  </button>
                </div>
              </div>

              {/* Shift Notes */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Shift Handover Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Taking over register 1, closing night inventory..."
                  value={shiftNote}
                  onChange={(e) => setShiftNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Punch Actions */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handlePunchClock('in')}
                  disabled={selectedEmployee?.isClockedIn}
                  className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Clock In Shift</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePunchClock('out')}
                  disabled={!selectedEmployee?.isClockedIn}
                  className="py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Clock Out Shift</span>
                </button>
              </div>
            </div>
          ) : (
            /* TAB 2: Attendance Timesheets Table */
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-300">Staff Shift Punch History</h4>
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3">Staff Member</th>
                      <th className="p-3">Clock In</th>
                      <th className="p-3">Clock Out</th>
                      <th className="p-3">Total Worked</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {timecards.map((tc) => (
                      <tr key={tc.id} className="hover:bg-slate-900/50">
                        <td className="p-3 font-medium text-slate-200">
                          {tc.employeeName}
                          {tc.notes && <div className="text-[10px] text-slate-500 italic mt-0.5">{tc.notes}</div>}
                        </td>
                        <td className="p-3 text-slate-400">{formatDateTime(tc.clockIn)}</td>
                        <td className="p-3 text-slate-400">
                          {tc.clockOut ? formatDateTime(tc.clockOut) : '—'}
                        </td>
                        <td className="p-3 font-mono font-medium text-slate-200">
                          {tc.durationMinutes ? `${(tc.durationMinutes / 60).toFixed(1)} hrs` : 'In progress'}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              tc.status === 'clocked-in'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {tc.status === 'clocked-in' ? 'ACTIVE' : 'COMPLETED'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
