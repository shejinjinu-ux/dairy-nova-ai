import React, { useState } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { useLanguage } from '../../contexts/LanguageContext';
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
  QrCode,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
} from 'lucide-react';

export const FeedQualityScreen: React.FC = () => {
  const { feedAnalyses, addFeedAnalysis, addQRBatch, qrBatches } = useAppData();
  const { t } = useLanguage();
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState<boolean>(false);
  const [activeQRBatchId, setActiveQRBatchId] = useState<string | null>(null);
  const [expandedFeedId, setExpandedFeedId] = useState<string | null>(null);

  const selectedQRBatch = qrBatches.find((b) => b.batchId === activeQRBatchId);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
      <MobileHeader
        showBack={true}
        title={t.feedCheck || 'Feed Quality Testing'}
        subtitle="AI-Enabled Rapid Nutritional & Safety Screening"
      />

      <main className="p-4 sm:p-5 space-y-4 pb-20 animate-fadeIn">
        
        {/* Core Feature Hero Action */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-950 text-white border border-emerald-600/40 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
              <Sparkles size={14} className="text-emerald-400" />
              Core AI Module
            </span>
            <SourceTag source="AI Screening" className="bg-emerald-950 text-emerald-200 border-emerald-700" />
          </div>

          <div>
            <h2 className="text-lg font-black text-white leading-tight">
              Rapid Feed Quality Testing
            </h2>
            <p className="text-xs text-emerald-100/90 leading-relaxed mt-1">
              Verify if your green fodder, straw, or concentrate is good for cattle nutrition, milk yield, and health.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAnalysisModalOpen(true)}
            className="w-full py-3 px-4 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs shadow-lg shadow-emerald-400/20 flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <Wheat size={16} /> {t.rapidFeedTest || 'Rapid Feed Quality Test'}
          </button>
        </div>

        {/* History of Feed Tests */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Tested Feed Batches ({feedAnalyses.length})
            </h3>
            {feedAnalyses.length > 0 && (
              <button
                type="button"
                onClick={() => setIsAnalysisModalOpen(true)}
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline"
              >
                <Plus size={12} /> Test New
              </button>
            )}
          </div>

          {feedAnalyses.length === 0 ? (
            /* Empty State */
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-3 shadow-card-soft">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
                <Wheat size={24} />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {t.noFeedRecordsYet || 'No feed tests yet'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  Test your green fodder, dry straw, or concentrate pellets to get instant AI nutritional ratings and feeding guidance.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAnalysisModalOpen(true)}
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 inline-flex items-center gap-1.5 active:scale-95 transition"
              >
                <Wheat size={14} /> {t.testFeedQuality || 'Test Feed Quality'}
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {feedAnalyses.map((feed) => {
                const isExpanded = expandedFeedId === feed.id;
                return (
                  <div
                    key={feed.id}
                    className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card-soft space-y-3"
                  >
                    {/* Header with Verdict Badge */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md">
                            {feed.batchId}
                          </span>
                          <span className="text-[10px] text-slate-400">{formatDate(feed.date)}</span>
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1">
                          {feed.feedName}
                        </h4>
                        <p className="text-xs text-slate-400">{feed.feedCategory}</p>
                      </div>

                      <div className="text-right">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black ${
                          feed.isGood === 'Good'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                            : feed.isGood === 'Moderate'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                        }`}>
                          {feed.isGood === 'Good' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                          {feed.isGood === 'Good' ? 'Good Feed' : feed.isGood === 'Moderate' ? 'Moderate' : 'Low Quality'}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Score: {feed.overallScore}/100</span>
                      </div>
                    </div>

                    {/* Verdict Summary */}
                    <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-xs space-y-1 text-emerald-900 dark:text-emerald-200">
                      <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1 text-[11px]">
                          <Sparkles size={12} className="text-emerald-600" /> AI Feeding Assessment
                        </span>
                        <ReadAloudButton textToRead={feed.simpleVerdict || feed.aiAdvisory} size="sm" />
                      </div>
                      <p className="text-[11px] leading-relaxed text-emerald-800 dark:text-emerald-300">
                        {feed.simpleVerdict || feed.aiAdvisory}
                      </p>
                    </div>

                    {/* Nutrients Snapshot */}
                    <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                        <span className="text-[9px] text-slate-400 block">Dry Matter</span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200">{feed.dryMatterPercent}%</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                        <span className="text-[9px] text-slate-400 block">Protein</span>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{feed.crudeProteinPercent}%</span>
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

                    {/* Expandable Detailed Parameters */}
                    {isExpanded && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs animate-fadeIn">
                        <div className="grid grid-cols-3 gap-1.5 text-center">
                          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60">
                            <span className="text-[9px] text-slate-400 block">NDF Fiber</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{feed.ndfPercent || '48.2'}%</span>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60">
                            <span className="text-[9px] text-slate-400 block">Starch</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{feed.starchPercent || '2.3'}%</span>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60">
                            <span className="text-[9px] text-slate-400 block">Moisture</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{feed.moisturePercent}%</span>
                          </div>
                        </div>

                        {feed.recommendations && feed.recommendations.length > 0 && (
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-[11px] space-y-1">
                            <strong className="text-slate-700 dark:text-slate-300 block font-semibold">Recommendations:</strong>
                            {feed.recommendations.map((rec, i) => (
                              <p key={i} className="text-slate-600 dark:text-slate-400">• {rec}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <button
                        type="button"
                        onClick={() => setExpandedFeedId(isExpanded ? null : feed.id)}
                        className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold flex items-center gap-1 text-[11px]"
                      >
                        {isExpanded ? 'Hide details' : 'View detailed NIR'}
                        {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>

                      <button
                        onClick={() => setActiveQRBatchId(feed.batchId)}
                        className="py-1 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1"
                      >
                        <QrCode size={13} /> View QR Seal
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
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

      {/* QR Code Modal */}
      {selectedQRBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Certified QR Verification Seal
              </h4>
              <button
                onClick={() => setActiveQRBatchId(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>
            <QRCodeCard batch={selectedQRBatch} />
          </div>
        </div>
      )}
    </div>
  );
};
