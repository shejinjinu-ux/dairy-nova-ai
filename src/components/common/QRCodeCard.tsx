import React, { useState } from 'react';
import { QRBatch } from '../../types';
import { generateQRMatrix } from '../../utils/qrHelper';
import { SourceTag } from './SourceTag';
import { StatusBadge } from './StatusBadge';
import { Share2, Download, Check, ShieldCheck, QrCode } from 'lucide-react';

interface QRCodeCardProps {
  batch: QRBatch;
  className?: string;
}

export const QRCodeCard: React.FC<QRCodeCardProps> = ({ batch, className = '' }) => {
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
      await navigator.clipboard.writeText(batch.qrPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownload = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 ${className}`}>
      
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md">
            {batch.itemType} Traceability Label
          </span>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">{batch.title}</h3>
          <p className="text-xs text-slate-500 font-mono">Batch #{batch.batchId}</p>
        </div>
        <StatusBadge status={batch.verificationStatus} size="sm" />
      </div>

      {/* QR Code Matrix Centerpiece */}
      <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center relative">
        <div className="bg-white p-3 rounded-xl shadow-md border border-slate-200/80 inline-block">
          <svg viewBox="0 0 25 25" className="w-36 h-36">
            {matrix.map((row, r) =>
              row.map((filled, c) => (
                <rect
                  key={`${r}-${c}`}
                  x={c}
                  y={r}
                  width="1"
                  height="1"
                  fill={filled ? '#0f172a' : '#ffffff'}
                />
              ))
            )}
          </svg>
        </div>
        <span className="text-[10px] font-semibold text-slate-400 mt-2 flex items-center gap-1">
          <ShieldCheck size={12} className="text-emerald-500" />
          Tamper-Proof Digital Dairy Seal
        </span>
      </div>

      {/* Details Grid */}
      <div className="space-y-2 text-xs bg-slate-50 dark:bg-slate-950/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Quality Grade:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">{batch.qualityGrade}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Adulteration Status:</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{batch.adulterationFlags}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Data Source:</span>
          <SourceTag source={batch.dataSource} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Test Date:</span>
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
