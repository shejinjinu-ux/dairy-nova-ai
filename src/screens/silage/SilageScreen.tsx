import React, { useState } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { MobileHeader } from '../../components/common/MobileHeader';
import { BottomNavigation } from '../../components/common/BottomNavigation';
import { SourceTag } from '../../components/common/SourceTag';
import { ReadAloudButton } from '../../components/common/ReadAloudButton';
import { SilageAnalysisModal } from '../../components/silage/SilageAnalysisModal';
import { QRCodeCard } from '../../components/common/QRCodeCard';
import { formatDate } from '../../utils/formatters';
import {
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  QrCode,
  X,
  Plus,
} from 'lucide-react';

export const SilageScreen: React.FC = () => {
  const { silageAnalyses, addSilageAnalysis, addQRBatch, qrBatches } = useAppData();
  const { t } = useLanguage();

  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState<boolean>(false);
  const [activeQRBatchId, setActiveQRBatchId] = useState<string | null>(null);
  const [expandedSilageId, setExpandedSilageId] = useState<string | null>(null);

  const selectedQRBatch = qrBatches.find((b) => b.batchId === activeQRBatchId) || null;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
      <MobileHeader
        showBack={true}
        title={t.silageCheck || 'Silage Quality Testing'}
        subtitle={t.isSilageGood || 'AI-Enabled Rapid Fermentation & Spoilage Screening'}
      />

      <main className="p-4 sm:p-5 space-y-4 pb-20 animate-fadeIn">
        
        {/* Core Feature Hero Action */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-teal-800 via-teal-950 to-slate-950 text-white border border-teal-600/40 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
              <Sparkles size={14} className="text-teal-400" />
              Dairy Nova AI
            </span>
            <SourceTag source="AI Screening" className="bg-teal-950 text-teal-200 border-teal-700" />
          </div>

          <div>
            <h2 className="text-lg font-black text-white leading-tight">
              {t.rapidSilageTest || 'Rapid Silage Quality Testing'}
            </h2>
            <p className="text-xs text-teal-100/90 leading-relaxed mt-1">
              {t.isSilageGood || 'Verify if your pit or bunker silage has optimal fermentation and safety.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAnalysisModalOpen(true)}
            className="w-full py-3 px-4 rounded-2xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-xs shadow-lg shadow-teal-400/20 flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <Layers size={16} /> {t.rapidSilageTest || 'Rapid Silage Quality Test'}
          </button>
        </div>

        {/* History of Silage Tests */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Tested Silage Pits ({silageAnalyses.length})
            </h3>
            {silageAnalyses.length > 0 && (
              <button
                type="button"
                onClick={() => setIsAnalysisModalOpen(true)}
                className="text-[11px] font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 hover:underline"
              >
                <Plus size={12} /> Test New Pit
              </button>
            )}
          </div>

          {silageAnalyses.length === 0 ? (
            /* Empty State */
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-3 shadow-card-soft">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center mx-auto">
                <Layers size={24} />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {t.noSilageRecordsYet || 'No silage tests yet'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  Test your corn, sorghum, or grass silage pit to get instant fermentation quality ratings and bunker management advice.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAnalysisModalOpen(true)}
                className="py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 inline-flex items-center gap-1.5 active:scale-95 transition"
              >
                <Layers size={14} /> {t.testSilageQuality || 'Test Silage Quality'}
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {silageAnalyses.map((silage) => {
                const isExpanded = expandedSilageId === silage.id;
                return (
                  <div
                    key={silage.id}
                    className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card-soft space-y-3"
                  >
                    {/* Header with Verdict Badge */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-teal-600 bg-teal-50 dark:bg-teal-950/80 px-2 py-0.5 rounded-md">
                            {silage.batchId}
                          </span>
                          <span className="text-[10px] text-slate-400">{formatDate(silage.date)}</span>
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1">
                          {silage.silageType}
                        </h4>
                        <p className="text-xs text-slate-400">{silage.storageDurationDays} Days Preserved</p>
                      </div>

                      <div className="text-right">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black ${
                          silage.isGood === 'Good' || silage.overallQuality.includes('Excellent') || silage.overallQuality.includes('Good')
                            ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-200'
                            : silage.isGood === 'Moderate'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                        }`}>
                          {silage.isGood === 'Good' || silage.overallQuality.includes('Lactic') ? (
                            <CheckCircle2 size={12} />
                          ) : (
                            <AlertTriangle size={12} />
                          )}
                          {silage.overallQuality}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">pH: {silage.phValue}</span>
                      </div>
                    </div>

                    {/* Verdict Summary */}
                    <div className="p-3 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 text-xs space-y-1 text-teal-900 dark:text-teal-200">
                      <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1 text-[11px]">
                          <Sparkles size={12} className="text-teal-600" /> AI Fermentation Assessment
                        </span>
                        <ReadAloudButton textToRead={silage.simpleVerdict || silage.storageAdvice} size="sm" />
                      </div>
                      <p className="text-[11px] leading-relaxed text-teal-800 dark:text-teal-300">
                        {silage.simpleVerdict || silage.storageAdvice}
                      </p>
                    </div>

                    {/* Metrics Snapshot */}
                    <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                        <span className="text-[9px] text-slate-400 block">{t.acidityPH || 'Acidity'}</span>
                        <span className="font-extrabold text-teal-600 dark:text-teal-400">{silage.phValue} pH</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                        <span className="text-[9px] text-slate-400 block">{t.fqi || 'FQI Score'}</span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200">{silage.fqiScore || '84.5'}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                        <span className="text-[9px] text-slate-400 block">{t.moisture || 'Moisture'}</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{silage.moisturePercent}%</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                        <span className="text-[9px] text-slate-400 block">{t.pitCoreTemp || 'Core Temp'}</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{silage.internalTemperatureC}°C</span>
                      </div>
                    </div>

                    {/* Expandable Details */}
                    {isExpanded && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs animate-fadeIn">
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-[11px] space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-500">{t.fermentationState || 'Fermentation State:'}</span>
                            <span className="font-bold text-teal-600">{silage.fermentationStatus}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">{t.spoilageRisk || 'Spoilage Risk:'}</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">{silage.spoilageRisk}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">{t.mouldRisk || 'Mould Risk:'}</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">{silage.mouldRisk}</span>
                          </div>
                        </div>

                        {silage.recommendations && silage.recommendations.length > 0 && (
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-[11px] space-y-1">
                            <strong className="text-slate-700 dark:text-slate-300 block font-semibold">{t.recommendationsLabel || 'Recommendations:'}</strong>
                            {silage.recommendations.map((rec, i) => (
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
                        onClick={() => setExpandedSilageId(isExpanded ? null : silage.id)}
                        className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold flex items-center gap-1 text-[11px]"
                      >
                        {isExpanded ? (t.hideDetails || 'Hide details') : (t.viewDetailedNIR || 'View detailed fermentation')}
                        {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>

                      <button
                        onClick={() => setActiveQRBatchId(silage.batchId)}
                        className="py-1 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1"
                      >
                        <QrCode size={13} /> {t.viewQRSeal || 'View QR Seal'}
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

      {/* Silage Analysis Modal */}
      <SilageAnalysisModal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        onAnalysisSaved={addSilageAnalysis}
        onGenerateQRBatch={addQRBatch}
      />

      {/* QR Modal */}
      {selectedQRBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Certified Silage QR Seal
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
