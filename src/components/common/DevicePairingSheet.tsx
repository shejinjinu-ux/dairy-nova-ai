import React, { useState, useEffect } from 'react';
import { Bluetooth, CheckCircle2, RefreshCw, X, Radio, Battery, Cpu } from 'lucide-react';

interface DevicePairingSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onDeviceConnected: (deviceData: { deviceName: string; sensorReading: Record<string, number> }) => void;
  deviceType?: 'nir_scanner' | 'silage_probe' | 'milk_analyzer';
}

export const DevicePairingSheet: React.FC<DevicePairingSheetProps> = ({
  isOpen,
  onClose,
  onDeviceConnected,
  deviceType = 'nir_scanner',
}) => {
  const [pairingState, setPairingState] = useState<'scanning' | 'connecting' | 'connected'>('scanning');
  const [selectedDevice, setSelectedDevice] = useState<string>('NovaNIR-Spectro-900X');

  useEffect(() => {
    if (isOpen) {
      setPairingState('scanning');
      const timer1 = setTimeout(() => {
        setPairingState('connecting');
      }, 1200);

      const timer2 = setTimeout(() => {
        setPairingState('connected');
      }, 2400);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApplyReadings = () => {
    onDeviceConnected({
      deviceName: selectedDevice,
      sensorReading: {
        crudeProtein: 14.8,
        moisture: 11.5,
        fiber: 22.4,
        energy: 68.0,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 flex items-center justify-center">
              <Bluetooth size={20} className={pairingState === 'connecting' ? 'animate-bounce' : ''} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Portable Scanner Pairing</h3>
              <p className="text-[10px] text-slate-500">Bluetooth Low Energy (BLE 5.2)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X size={18} />
          </button>
        </div>

        {/* State Visualizer */}
        {pairingState === 'scanning' && (
          <div className="py-6 text-center space-y-3">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-teal-400/20 animate-ping" />
              <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center relative z-10 shadow-lg shadow-teal-600/30">
                <Radio size={24} className="animate-pulse" />
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Searching for nearby Dairy Nova sensors...</p>
            <p className="text-[11px] text-slate-400">Hold probe near feed sample</p>
          </div>
        )}

        {pairingState === 'connecting' && (
          <div className="py-6 text-center space-y-3">
            <RefreshCw size={32} className="animate-spin text-teal-600 mx-auto" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pairing with {selectedDevice}...</p>
            <p className="text-[11px] text-slate-400">Calibrating optical spectrometer (900-1700nm)</p>
          </div>
        )}

        {pairingState === 'connected' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{selectedDevice}</h4>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">● Sensor Paired & Calibrated</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                BLE Active
              </span>
            </div>

            {/* Live Telemetry Snapshot */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Crude Protein (NIR)</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">14.8%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Moisture Index</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">11.5%</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleApplyReadings}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-md shadow-teal-600/30 active:scale-95 transition"
            >
              Import Sensor Readings into Analysis
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
