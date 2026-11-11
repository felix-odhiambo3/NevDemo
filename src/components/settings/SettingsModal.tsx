import React, { useState } from 'react';
import { CurrencyCode, LanguageCode, StoreSettings } from '../../types/pos';
import { SUPPORTED_CURRENCIES, PosStorage } from '../../utils/storage';
import { Settings, Save, RotateCcw, Volume2, Globe, Building2, Receipt, X } from 'lucide-react';
import { posAudio } from '../../utils/audio';

interface SettingsModalProps {
  settings: StoreSettings;
  onSaveSettings: (settings: StoreSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSaveSettings,
  onClose,
}) => {
  const [formData, setFormData] = useState<StoreSettings>({ ...settings });

  const handleCurrencyChange = (code: string) => {
    const matched = SUPPORTED_CURRENCIES.find((c) => c.code === code) || SUPPORTED_CURRENCIES[0];
    setFormData({
      ...formData,
      currency: matched,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    posAudio.enabled = formData.soundEnabled;
    onSaveSettings(formData);
    posAudio.playSuccess();
    onClose();
  };

  const handleFactoryReset = () => {
    if (confirm('WARNING: This will reset all products, sales, timecards, and customers back to pristine AguilaNet factory seed defaults. Proceed?')) {
      PosStorage.resetToDefaults();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100">System Configuration &amp; Store Setup</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {/* Store Profile */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Business Profile &amp; Fiscal Identity</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Trading Store Name</label>
                <input
                  type="text"
                  required
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Legal Registered Entity</label>
                <input
                  type="text"
                  required
                  value={formData.legalEntity}
                  onChange={(e) => setFormData({ ...formData, legalEntity: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tax Registration PIN / VAT #</label>
                <input
                  type="text"
                  required
                  value={formData.taxPinNumber}
                  onChange={(e) => setFormData({ ...formData, taxPinNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Store Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Store Physical Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Localization & Currency */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Currency, Tax &amp; Localization</span>
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Active Currency</label>
                <select
                  value={formData.currency.code}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-medium"
                >
                  {SUPPORTED_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Default Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={(formData.defaultTaxRate * 100).toFixed(0)}
                  onChange={(e) =>
                    setFormData({ ...formData, defaultTaxRate: (parseFloat(e.target.value) || 0) / 100 })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Interface Language</label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value as LanguageCode })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="en">English (US/UK/KE)</option>
                  <option value="es">Español (América / España)</option>
                  <option value="sw">Kiswahili (East Africa)</option>
                  <option value="fr">Français</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.isTaxInclusive}
                  onChange={(e) => setFormData({ ...formData, isTaxInclusive: e.target.checked })}
                  className="w-4 h-4 rounded text-cyan-600 bg-slate-950 border-slate-700 focus:ring-0"
                />
                <span>Prices are Tax-Inclusive (VAT included in retail price)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300 ml-4">
                <input
                  type="checkbox"
                  checked={formData.soundEnabled}
                  onChange={(e) => setFormData({ ...formData, soundEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-cyan-600 bg-slate-950 border-slate-700 focus:ring-0"
                />
                <span>Enable Cashier Audio Sound Effects (Beeps &amp; Chimes)</span>
              </label>
            </div>
          </div>

          {/* Receipt Customizer */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-cyan-400" />
              <span>Thermal Receipt Template Configuration</span>
            </h3>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Header Welcome Line</label>
              <input
                type="text"
                value={formData.receiptHeader}
                onChange={(e) => setFormData({ ...formData, receiptHeader: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Footer Policy / Exchange Note</label>
              <textarea
                rows={2}
                value={formData.receiptFooter}
                onChange={(e) => setFormData({ ...formData, receiptFooter: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Danger Zone */}
          <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
            <div>
              <span className="font-bold text-rose-400 block">Factory Reset Demo Data</span>
              <span className="text-[11px] text-slate-500">Restore default demo products, staff, and initial shift.</span>
            </div>
            <button
              type="button"
              onClick={handleFactoryReset}
              className="flex items-center gap-1 px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-lg text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Data</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
