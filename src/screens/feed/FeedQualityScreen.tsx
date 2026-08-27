import React, { useState } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { MobileHeader } from '../../components/common/MobileHeader';
import { BottomNavigation } from '../../components/common/BottomNavigation';
import { SourceTag } from '../../components/common/SourceTag';
import { ReadAloudButton } from '../../components/common/ReadAloudButton';
import { FeedAnalysisModal } from '../../components/feed/FeedAnalysisModal';
import { QRCodeCard } from '../../components/common/QRCodeCard';
import { formatDate } from '../../utils/formatters';
import {
  Wheat,
  Sparkles,
  Plus,
  Bluetooth,
  ShieldCheck,
  AlertTriangle,
  QrCode,
  CheckCircle2,
} from 'lucide-react';

export const FeedQualityScreen: React.FC = () => {
  const { feedAnalyses, addFeedAnalysis, addQRBatch, qrBatches } = useAppData();
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState<boolean>(false);
  const [activeQRBatchId, setActiveQRBatchId] = useState<string | null>(null);

  const selectedQRBatch = qrBatches.find((b) => b.batchId === activeQRBatchId);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
      <MobileHeader showBack={true} title="Feed Quality & NIR Screening" subtitle="Proximate Nutrients & Adulteration Checks" />

      <main className="p-4 sm:p-5 space-y-4 pb-20 animate-fadeIn">
        
        {/* Launch Feed Analysis Banner */}
        <div className="p-4 rounded-3xl bg-gradient-to-tr from-amber-900 via-amber-950 to-slate-950 text-white border border-amber-700/50 shadow-lg space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-400" />
              Portable NIR & Optical AI Analysis
            </span>
            <SourceTag source="AI Screening" className="bg-amber-950 text-amber-200 border-amber-700" />
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Screen crude protein, moisture, silica sand adulteration, and aflatoxin contamination risk instantly.
          </p>

          <button
            type="button"
            onClick={() => setIsAnalysisModalOpen(true)}
            className="w-full py-2.5 px-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md shadow-amber-400/20 flex items-center justify-center gap-1.5 active:scale-95 transition"
          >
            <Wheat size={16} /> Analyze New Feed Batch
          </button>
        </div>

        {/* History of Feed Tests */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Tested Feed Batches ({feedAnalyses.length})
            </h3>
            <span className="text-[11px] font-semibold text-teal-600">Traceable QR Certified</span>
          </div>

          <div className="space-y-3.5">
            {feedAnalyses.map((feed) => (
              <div
                key={feed.id}
                className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card-soft space-y-3"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-teal-600 bg-teal-50 dark:bg-teal-950/80 px-2 py-0.5 rounded-md">
                      {feed.batchId}
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1">
                      {feed.feedName}
                    </h4>
                    <p className="text-xs text-slate-400">{feed.feedCategory} • {formatDate(feed.date)}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-dairy-600 dark:text-dairy-400 block">
                      {feed.overallScore}/100
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">{feed.qualityGrade}</span>
                  </div>
                </div>

                {/* Nutrients Snapshot */}
                <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[9px] text-slate-400 block">Protein</span>
                    <span className="font-extrabold text-dairy-600">{feed.crudeProteinPercent}%</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[9px] text-slate-400 block">Moisture</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{feed.moisturePercent}%</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[9px] text-slate-400 block">Fiber</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{feed.crudeFiberPercent}%</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[9px] text-slate-400 block">TDN Energy</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{feed.tdnEnergyPercent}%</span>
                  </div>
                </div>

                {/* AI Advisory */}
                <div className="p-3 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 text-xs space-y-1 text-teal-900 dark:text-teal-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1 text-[11px]">
                      <Sparkles size={12} className="text-teal-600" /> AI Feed Advisory
                    </span>
                    <ReadAloudButton textToRead={feed.aiAdvisory} size="sm" />
                  </div>
                  <p className="text-[11px] leading-relaxed text-teal-800 dark:text-teal-300">{feed.aiAdvisory}</p>
                </div>

                {/* Source & Actions */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <SourceTag source={feed.inputSource === 'Portable Scanner Simulation' ? 'Sensor Reading' : 'AI Screening'} />

                  <button
                    onClick={() => setActiveQRBatchId(feed.batchId)}
                    className="py-1 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1"
                  >
                    <QrCode size={13} /> View QR Seal
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>

      </main>

      <BottomNavigation />

      {/* Feed Analysis Modal */}
      <FeedAnalysisModal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        onAnalysisSaved={addFeedAnalysis}
        onGenerateQRBatch={addQRBatch}
      />

      {/* QR Code Viewer Modal */}
      {selectedQRBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="max-w-sm w-full relative">
            <button
              onClick={() => setActiveQRBatchId(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white dark:bg-slate-800 text-slate-600 shadow-md flex items-center justify-center z-10"
            >
              ✕
            </button>
            <QRCodeCard batch={selectedQRBatch} />
          </div>
        </div>
      )}

    </div>
  );
};
