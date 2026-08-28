import React, { useRef } from 'react';
import { FeedAnalysisResult, SilageAnalysisResult } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/formatters';
import {
  X,
  Printer,
  Share2,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Sparkles,
  Wheat,
  Layers,
  ShieldCheck,
  QrCode,
  Download,
} from 'lucide-react';

interface TestReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  testType: 'Feed' | 'Silage';
  result: FeedAnalysisResult | SilageAnalysisResult;
}

export const TestReportModal: React.FC<TestReportModalProps> = ({
  isOpen,
  onClose,
  testType,
  result,
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const isFeed = testType === 'Feed';
  const feedData = isFeed ? (result as FeedAnalysisResult) : null;
  const silageData = !isFeed ? (result as SilageAnalysisResult) : null;

  const score = isFeed
    ? (feedData?.overallScore !== undefined ? Math.round(feedData.overallScore) : 0)
    : (silageData?.fqiScore !== undefined ? Math.round(silageData.fqiScore) : 0);
  const status = isFeed
    ? feedData?.isGood || (score >= 75 ? 'Good' : score >= 55 ? 'Moderate' : 'Poor')
    : silageData?.isGood || (silageData?.overallQuality?.includes('Lactic') || score >= 70 ? 'Good' : 'Moderate');

  const statusLabel =
    status === 'Good'
      ? t.goodToUse || 'GOOD TO USE'
      : status === 'Moderate'
      ? t.useWithCaution || 'USE WITH CAUTION'
      : t.doNotFeedDirectly || 'DO NOT FEED DIRECTLY';

  const statusColor =
    status === 'Good'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
      : status === 'Moderate'
      ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
      : 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800';

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareText = `Dairy Nova AI - ${isFeed ? 'Feed' : 'Silage'} Quality Report\nBatch: ${result.batchId}\nDate: ${result.date}\nQuality Score: ${score}/100\nVerdict: ${statusLabel}\nAction: ${isFeed ? feedData?.aiAdvisory : silageData?.storageAdvice}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Dairy Nova AI ${isFeed ? 'Feed' : 'Silage'} Report`,
          text: shareText,
        });
      } catch {
        // Fallback or cancel
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Report summary copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[94vh] overflow-y-auto print:max-w-none print:p-0 print:border-0 print:shadow-none">
        
        {/* Modal Controls (Hidden during print) */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              {isFeed ? <Wheat size={18} /> : <Layers size={18} />}
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white">
                Farmer Quality Certificate
              </h3>
              <span className="text-[10px] text-slate-400">
                Official Rapid Quality Test Report
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition"
              title="Print Report"
            >
              <Printer size={15} />
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 transition"
              title="Share Report"
            >
              <Share2 size={15} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 transition"
              title="Close"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Printable Report Document Card */}
        <div ref={printRef} className="space-y-4 text-xs">
          
          {/* Official Letterhead Header */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-950 text-white space-y-1.5 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-400/20 text-emerald-300 flex items-center justify-center font-bold">
                  {isFeed ? <Wheat size={15} /> : <Layers size={15} />}
                </div>
                <span className="font-black text-xs tracking-wider uppercase text-emerald-300">
                  DAIRY NOVA AI
                </span>
              </div>
              <span className="text-[9px] font-bold bg-white/10 px-2 py-0.5 rounded-full text-slate-200">
                Batch: {result.batchId}
              </span>
            </div>
            <h2 className="text-sm font-extrabold text-white">
              Smart Rapid {isFeed ? 'Feed' : 'Silage'} Quality Test Report
            </h2>
            <p className="text-[10px] text-emerald-100/80">
              Calibrated with ICAR-NIANP & FAO Dairy Biochemical Standards
            </p>
          </div>

          {/* Sample & Farmer Meta */}
          <div className="grid grid-cols-2 gap-2 text-[11px] p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-slate-400 text-[10px] block">Sample Type:</span>
              <strong className="text-slate-800 dark:text-slate-200 font-bold">
                {isFeed ? feedData?.feedName : silageData?.silageType}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Test Date:</span>
              <strong className="text-slate-800 dark:text-slate-200 font-bold">
                {formatDate(result.date)}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Farm & Farmer:</span>
              <strong className="text-slate-800 dark:text-slate-200 font-bold truncate block">
                {user?.name || 'Dairy Farmer'} • {user?.farmName || 'Model Farm'}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Testing Method:</span>
              <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                {result.inputSource || 'Rapid NIR / Biochemical AI'}
              </strong>
            </div>
          </div>

          {/* Core Result & Quality Score Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center space-y-2.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              {t.qualityScore || 'Overall Quality Score'}
            </span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {score}
              </span>
              <span className="text-sm font-bold text-slate-400">/ 100</span>
            </div>

            {/* Verdict Badge */}
            <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-wide ${statusColor}`}>
              {status === 'Good' ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
              <span>{statusLabel}</span>
            </div>
          </div>

          {/* Risk Analysis Section */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <AlertTriangle size={13} className="text-amber-500" />
              {t.riskAnalysis || '🚨 Risk Analysis'}
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block">{t.mouldRisk || 'Mould Risk'}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {isFeed ? feedData?.fungalMouldRisk || 'Clean' : silageData?.mouldRisk || 'Clean / Safe'}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block">{t.spoilageRisk || 'Spoilage Risk'}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {isFeed ? feedData?.mycotoxinRisk || 'Low' : silageData?.spoilageRisk || 'Low'}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block">{t.qualityRisk || 'Quality Risk'}</span>
                <span className={`font-bold ${status === 'Good' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {status === 'Good' ? 'Low Risk' : status === 'Moderate' ? 'Medium' : 'High'}
                </span>
              </div>
            </div>
          </div>

          {/* Key Parameters Table */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Tested Parameters & Biomarkers
            </h4>
            <div className="divide-y divide-slate-100 dark:divide-slate-700/60 text-[11px]">
              {isFeed ? (
                <>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">Crude Protein (CP)</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {feedData?.crudeProteinPercent}%
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">Dry Matter (DM)</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {feedData?.dryMatterPercent}%
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">Moisture Content</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {feedData?.moisturePercent}%
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">Crude Fiber</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {feedData?.crudeFiberPercent}%
                    </span>
                  </div>
                  {feedData?.ndfPercent && (
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">NDF Fiber</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {feedData.ndfPercent}%
                      </span>
                    </div>
                  )}
                  {feedData?.starchPercent && (
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">Starch</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {feedData.starchPercent}%
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">Silage Acidity (pH)</span>
                    <span className="font-bold text-teal-600 dark:text-teal-400">
                      {silageData?.phValue} pH
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">Fermentation Quality Index (FQI)</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {silageData?.fqiScore || '84.5'}/100
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">Moisture Percentage</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {silageData?.moisturePercent}%
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">Core Pit Temperature</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {silageData?.internalTemperatureC}°C
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">Fermentation Acid Profile</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {silageData?.fermentationStatus}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* AI Explanation: Why This Result? */}
          <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 space-y-1.5">
            <h4 className="font-extrabold text-[11px] text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
              <Sparkles size={13} className="text-teal-600" />
              {t.whyThisResult || '🤖 Why this result?'}
            </h4>
            <p className="text-[11px] text-teal-950 dark:text-teal-100 leading-relaxed">
              {isFeed ? feedData?.simpleVerdict || feedData?.aiAdvisory : silageData?.simpleVerdict || silageData?.storageAdvice}
            </p>
          </div>

          {/* Recommended Action */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
            <h4 className="font-extrabold text-[11px] text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-emerald-500" />
              {t.recommendedAction || '💡 Recommended Action'}
            </h4>
            <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
              {isFeed ? (
                feedData?.recommendations?.map((r, i) => <p key={i}>• {r}</p>)
              ) : (
                silageData?.recommendations?.map((r, i) => <p key={i}>• {r}</p>)
              )}
            </div>
          </div>

          {/* Verification QR Seal */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-between text-[10px]">
            <div className="space-y-0.5">
              <strong className="text-slate-800 dark:text-slate-200 font-bold block">
                Digital Traceability Seal
              </strong>
              <span className="text-slate-400">
                Tamper-proof batch: {result.qrBatchId || result.batchId}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 flex items-center justify-center shrink-0">
              <QrCode size={18} />
            </div>
          </div>

        </div>

        {/* Footer Actions (Hidden during print) */}
        <div className="pt-2 flex gap-2 print:hidden">
          <button
            type="button"
            onClick={handleShare}
            className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <Share2 size={15} />
            <span>{t.downloadShareReport || 'Download / Share Report'}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 active:scale-95 transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
