import React, { useState } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { MobileHeader } from '../../components/common/MobileHeader';
import { BottomNavigation } from '../../components/common/BottomNavigation';
import { QRCodeCard } from '../../components/common/QRCodeCard';
import { QRScannerModal } from '../../components/common/QRScannerModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SourceTag } from '../../components/common/SourceTag';
import { formatDate } from '../../utils/formatters';
import { QRBatch } from '../../types';
import { QrCode, ScanLine, Plus, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const QRTraceabilityScreen: React.FC = () => {
  const { qrBatches, addQRBatch } = useAppData();
  const { t } = useLanguage();
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [selectedBatch, setSelectedBatch] = useState<QRBatch | null>(null);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
      <MobileHeader showBack={true} title={t.qrCertificates || 'QR Traceability Seals'} subtitle={t.verifiedBatches || 'Farm-to-Consumer Digital Verification'} />

      <main className="p-4 sm:p-5 space-y-4 pb-20 animate-fadeIn">
        
        {/* Scanner Action Header */}
        <div className="p-4 rounded-3xl bg-gradient-to-tr from-teal-900 via-teal-950 to-slate-950 text-white border border-teal-700/50 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
              <QrCode size={16} className="text-teal-400" />
              Digital Seal Verification
            </span>
            <span className="text-[10px] font-bold bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full">
              Tamper Proof
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Scan physical batch QR stickers or generate instant digital certificates for milk tanks, feed sacks, and silage silos.
          </p>

          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="w-full py-2.5 px-3 rounded-2xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs shadow-md shadow-teal-400/20 flex items-center justify-center gap-1.5 active:scale-95 transition"
          >
            <ScanLine size={16} /> {t.scanSample || 'Open QR Batch Scanner'}
          </button>
        </div>

        {/* Generated Batches List */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.verifiedBatches || 'Verified Dairy Batches'} ({qrBatches.length})
            </h3>
            <span className="text-xs text-teal-600 font-semibold">{t.viewAll || 'Tap to view full QR label'}</span>
          </div>

          <div className="space-y-3">
            {qrBatches.map((batch) => (
              <div
                key={batch.batchId}
                onClick={() => setSelectedBatch(batch)}
                className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card-soft hover:shadow-card-hover cursor-pointer active:scale-[0.98] transition space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-teal-600 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded-md">
                      {batch.batchId}
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1">
                      {batch.title}
                    </h4>
                    <p className="text-xs text-slate-400">{batch.farmName} • {formatDate(batch.generatedDate)}</p>
                  </div>
                  <StatusBadge status={batch.verificationStatus} size="sm" />
                </div>

                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{t.qualityGrade || 'Quality:'} <strong className="text-slate-800 dark:text-slate-200">{batch.qualityGrade}</strong></span>
                  <SourceTag source={batch.dataSource} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      <BottomNavigation />

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanned={(batch) => {
          setSelectedBatch(batch);
        }}
      />

      {/* Full QR Label Modal */}
      {selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="max-w-sm w-full relative">
            <button
              onClick={() => setSelectedBatch(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white dark:bg-slate-800 text-slate-600 shadow-md flex items-center justify-center z-10 font-bold"
            >
              ✕
            </button>
            <QRCodeCard batch={selectedBatch} />
          </div>
        </div>
      )}

    </div>
  );
};
