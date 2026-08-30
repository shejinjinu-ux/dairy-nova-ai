import React, { useState } from 'react';
import { QRBatch } from '../../types';
import { qrApi } from '../../services/api/qrApi';
import { useLanguage } from '../../contexts/LanguageContext';
import { QRCodeCard } from './QRCodeCard';
import { X, ScanLine, Camera, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanned?: (batch: QRBatch) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanned,
}) => {
  const { t } = useLanguage();
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [isLookingUp, setIsLookingUp] = useState<boolean>(false);
  const [scannedBatch, setScannedBatch] = useState<QRBatch | null>(null);
  const [manualCode, setManualCode] = useState<string>('');

  if (!isOpen) return null;

  const handleSimulateScan = async (code: string = 'DN-BATCH-2026-F884') => {
    setIsScanning(false);
    setIsLookingUp(true);
    try {
      const batch = await qrApi.lookupBatch(code);
      setScannedBatch(batch);
      if (batch && onScanned) {
        onScanned(batch);
      }
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleReset = () => {
    setScannedBatch(null);
    setIsScanning(true);
    setManualCode('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 flex items-center justify-center">
              <ScanLine size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">{t.qrTraceability || 'QR Batch Scanner'}</h3>
              <p className="text-[10px] text-slate-500">{t.qrCertificates || 'Scan Dairy Traceability Label'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scanner Viewport or Result */}
        {scannedBatch ? (
          <div className="space-y-3">
            <div className="bg-emerald-50 dark:bg-emerald-950/60 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              {t.verifiedBatches || 'Batch Verified & Traceability Audit Loaded!'}
            </div>
            <QRCodeCard batch={scannedBatch} />
            <button
              onClick={handleReset}
              className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 active:scale-95 transition"
            >
              {t.scanSample || 'Scan Another Code'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Animated Camera Viewfinder */}
            <div className="relative aspect-square rounded-2xl bg-slate-950 overflow-hidden flex flex-col items-center justify-center border-2 border-dashed border-teal-500/40">
              
              {/* Corner brackets */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-teal-400" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-teal-400" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-teal-400" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-teal-400" />

              {/* Animated Laser Scanning Line */}
              {isScanning && !isLookingUp && (
                <div className="absolute inset-x-8 h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_12px_#2dd4bf] animate-bounce" />
              )}

              {isLookingUp ? (
                <div className="flex flex-col items-center gap-2 text-teal-400 z-10">
                  <Loader2 size={32} className="animate-spin" />
                  <span className="text-xs font-semibold">{t.decodingSeal || 'Decoding Dairy Seal...'}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-slate-400 z-10">
                  <Camera size={28} className="text-slate-500 animate-pulse" />
                  <span className="text-[11px] font-medium text-slate-300">{t.alignQrCode || 'Align QR code inside box'}</span>
                </div>
              )}
            </div>

            {/* Quick Demo Scan Buttons */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block text-center">
                {t.qrCertificates || 'Simulate Live QR Scan'}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSimulateScan('DN-BATCH-2026-F884')}
                  disabled={isLookingUp}
                  className="p-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-semibold text-left active:scale-95 transition"
                >
                  <span className="block font-bold">🌿 {t.dryFeed || 'Feed Batch'} #884</span>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400">Super Napier CO-5</span>
                </button>

                <button
                  onClick={() => handleSimulateScan('DN-BATCH-2026-S441')}
                  disabled={isLookingUp}
                  className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold text-left active:scale-95 transition"
                >
                  <span className="block font-bold">🌽 {t.silageSample || 'Silage Pit'} M01</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Corn Silage Pit #441</span>
                </button>
              </div>
            </div>

            {/* Manual Code Input */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder={t.searchFeedTestsPlaceholder || "Or enter Batch ID manually..."}
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  onClick={() => handleSimulateScan(manualCode || 'DN-BATCH-2026-M154')}
                  disabled={isLookingUp}
                  className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl active:scale-95 transition"
                >
                  Lookup
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
