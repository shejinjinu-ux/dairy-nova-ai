import React from 'react';
import { Bluetooth, Radio, X, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface DevicePairingSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onDeviceConnected?: (deviceData: { deviceName: string; sensorReading: Record<string, number> }) => void;
  deviceType?: 'nir_scanner' | 'silage_probe' | 'milk_analyzer';
}

export const DevicePairingSheet: React.FC<DevicePairingSheetProps> = ({
  isOpen,
  onClose,
  deviceType = 'nir_scanner',
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 flex items-center justify-center">
              <Radio size={20} className="text-teal-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {t.sensorIntegrationTitle || '📡 Sensor Integration'}
              </h3>
              <p className="text-[10px] text-slate-500">
                Hardware IoT & Portable NIR Probes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
          >
            <X size={18} />
          </button>
        </div>

        {/* Honest Sensor Status Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Connection Status</span>
            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-md">
              {t.sensorStatusNotConnected || 'Not connected'}
            </span>
          </div>

          <h4 className="font-bold text-slate-900 dark:text-white text-xs">
            Supported Hardware Sensors
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            {t.sensorIntegrationDesc || 'Connect supported feed/silage sensors for automated readings.'}
          </p>

          <div className="space-y-1.5 pt-1 text-[11px]">
            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span>🔬 Handheld NIR Optical Scanner (900-1700nm)</span>
              <span className="text-[9px] text-teal-600 font-bold">Supported</span>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span>🌡️ Silage Pit Core pH & Temperature Probe</span>
              <span className="text-[9px] text-teal-600 font-bold">Supported</span>
            </div>
          </div>
        </div>

        {/* Notice */}
        <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[11px] text-teal-900 dark:text-teal-200 flex items-start gap-2">
          <Info size={15} className="text-teal-600 shrink-0 mt-0.5" />
          <span>
            No physical sensor connected right now. You can continue testing using manual entry or camera sample photo.
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 active:scale-95 transition"
        >
          Continue with Manual / Camera Test
        </button>

      </div>
    </div>
  );
};
