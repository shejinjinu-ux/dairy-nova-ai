import React, { useState } from 'react';
import { QRBatch } from '../../types';
import { generateQRMatrix } from '../../utils/qrHelper';
import { useLanguage } from '../../contexts/LanguageContext';
import { SourceTag } from './SourceTag';
import { StatusBadge } from './StatusBadge';
import { Share2, Download, Check, ShieldCheck, QrCode } from 'lucide-react';

interface QRCodeCardProps {
  batch: QRBatch;
  className?: string;
}

export const QRCodeCard: React.FC<QRCodeCardProps> = ({ batch, className = '' }) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState<boolean>(false);
  const [downloaded, setDownloaded] = useState<boolean>(false);

  const matrix = generateQRMatrix(batch.qrPayload || batch.batchId);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Dairy Nova AI QR Batch: ${batch.batchId}`,
          text: `Verified Dairy Batch: ${batch.title} - ${batch.qualityGrade}`,
          url: batch.qrPayload,
        });
      } else {
        await navigator.clipboard.writeText(batch.qrPayload);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Ignored
    }
  };

  const handleDownload = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <div className={`p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card-soft space-y-3.5 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="font-mono text-[10px] font-bold text-slate-400 block">{batch.batchId}</span>
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">{batch.title}</h4>
        </div>
        <StatusBadge status={batch.verificationStatus} size="sm" />
      </div>

      {/* SVG QR Code Simulation */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center shadow-inner">
        <div className="w-36 h-36">
          <svg viewBox="0 0 25 25" className="w-full h-full shape-rendering-crispEdges">
            {matrix.map((row, r) =>
              row.map((cell, c) => (
                <rect
                  key={`${r}-${c}`}
                  x={c}
                  y={r}
                  width={1}
                  height={1}
                  fill={cell ? '#0f172a' : '#ffffff'}
                />
              ))
            )}
          </svg>
        </div>
        <span className="text-[10px] font-semibold text-slate-400 mt-2 flex items-center gap-1">
          <ShieldCheck size={12} className="text-emerald-500" />
          {t.qrCertificates || 'Tamper-Proof Digital Dairy Seal'}
        </span>
      </div>

      {/* Details Grid */}
      <div className="space-y-2 text-xs bg-slate-50 dark:bg-slate-950/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">{t.qualityGrade || 'Quality Grade:'}</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">{batch.qualityGrade}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">{t.adulterationStatus || 'Adulteration Status:'}</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{batch.adulterationFlags}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">{t.dataSource || 'Data Source:'}</span>
          <SourceTag source={batch.dataSource} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">{t.testDate || 'Test Date:'}</span>
          <span className="font-medium text-slate-700 dark:text-slate-300">{batch.generatedDate}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={handleDownload}
          className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 active:scale-95 transition"
        >
          {downloaded ? <Check size={14} className="text-emerald-500" /> : <Download size={14} />}
          {downloaded ? 'Saved!' : 'Save Label'}
        </button>

        <button
          onClick={handleShare}
          className="py-2.5 px-3 rounded-xl bg-dairy-600 hover:bg-dairy-700 text-white text-xs font-semibold shadow-md shadow-dairy-600/30 flex items-center justify-center gap-1.5 active:scale-95 transition"
        >
          {copied ? <Check size={14} className="text-white" /> : <Share2 size={14} />}
          {copied ? 'Link Copied!' : 'Share QR'}
        </button>
      </div>

    </div>
  );
};
