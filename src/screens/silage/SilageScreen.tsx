import React, { useState } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { MobileHeader } from '../../components/common/MobileHeader';
import { BottomNavigation } from '../../components/common/BottomNavigation';
import { SourceTag } from '../../components/common/SourceTag';
import { ReadAloudButton } from '../../components/common/ReadAloudButton';
import { SilageAnalysisModal } from '../../components/silage/SilageAnalysisModal';
import { QRCodeCard } from '../../components/common/QRCodeCard';
import { MOCK_IOT_SILAGE_READINGS } from '../../mocks/mockData';
import { formatDate } from '../../utils/formatters';
import {
  Activity,
  Sparkles,
  Radio,
  Wifi,
  Thermometer,
  ShieldCheck,
  QrCode,
  TrendingDown,
  Clock,
  Layers,
} from 'lucide-react';

export const SilageScreen: React.FC = () => {
  const { silageAnalyses, addSilageAnalysis, addQRBatch, qrBatches } = useAppData();
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'iot_monitor' | 'analyses_list'>('iot_monitor');
  const [activeQRBatchId, setActiveQRBatchId] = useState<string | null>(null);

  const selectedQRBatch = qrBatches.find((b) => b.batchId === activeQRBatchId);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
      <MobileHeader showBack={true} title="Silage Analysis & IoT Probes" subtitle="Fermentation & Aerobic Spoilage Radar" />

      <main className="p-4 sm:p-5 space-y-4 pb-20 animate-fadeIn">
        
        {/* Tab Toggle */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-900 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('iot_monitor')}
            className={`py-2 px-3 rounded-xl transition active:scale-95 flex items-center justify-center gap-1.5 ${
              activeTab === 'iot_monitor'
                ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Radio size={14} className="text-teal-600" /> IoT Pit Probes
          </button>
          <button
            onClick={() => setActiveTab('analyses_list')}
            className={`py-2 px-3 rounded-xl transition active:scale-95 flex items-center justify-center gap-1.5 ${
              activeTab === 'analyses_list'
                ? 'bg-white dark:bg-slate-800 text-dairy-700 dark:text-dairy-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Layers size={14} /> Tested Batches ({silageAnalyses.length})
          </button>
        </div>

        {/* Tab 1: IoT Storage Monitoring */}
        {activeTab === 'iot_monitor' && (
          <div className="space-y-4 animate-fadeIn">
            
            {/* Live Pit Telemetry Card */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-teal-900 via-slate-900 to-slate-950 text-white border border-teal-700/50 shadow-xl space-y-3.5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-teal-300 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-semibold">NovaProbe BLE #M01 • Live Sensor Telemetry</span>
                  </div>
                  <h3 className="text-base font-black text-white">Corn Silage Bunker Pit M01</h3>
                  <p className="text-xs text-slate-300">Sealed on 20 June (65 Days Storage)</p>
                </div>
                <SourceTag source="Sensor Reading" />
              </div>

              {/* Real-time Telemetry Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-0.5">
                  <span className="text-[10px] text-teal-300 block font-medium">Acidity Index</span>
                  <span className="text-xl font-extrabold text-white">3.85 pH</span>
                  <span className="text-[10px] text-emerald-400 font-semibold block">● Optimal Lactic State</span>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-0.5">
                  <span className="text-[10px] text-teal-300 block font-medium">Internal Core Temp</span>
                  <span className="text-xl font-extrabold text-white">26.2°C</span>
                  <span className="text-[10px] text-emerald-400 font-semibold block">● Stable Anaerobic Seal</span>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-0.5">
                  <span className="text-[10px] text-teal-300 block font-medium">Moisture</span>
                  <span className="text-xl font-extrabold text-white">66.4%</span>
                  <span className="text-[10px] text-teal-200 font-semibold block">● Target Range (65-70%)</span>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-0.5">
                  <span className="text-[10px] text-teal-300 block font-medium">Spoilage Risk</span>
                  <span className="text-xl font-extrabold text-emerald-400">4.2%</span>
                  <span className="text-[10px] text-emerald-300 font-semibold block">● Low Spoilage Index</span>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsAnalysisModalOpen(true)}
                  className="w-full py-2.5 px-4 rounded-2xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs shadow-md shadow-teal-400/20 flex items-center justify-center gap-1.5 active:scale-95 transition"
                >
                  <Sparkles size={15} /> Run Diagnostic on New Silage Pit
                </button>
              </div>
            </div>

            {/* 24-Hour IoT Trends Chart */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card-soft space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white">24-Hour pH & Temperature Curve</h4>
                  <p className="text-[10px] text-slate-400">Continuous 4-hour telemetry intervals</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                  Normal Variance (&lt;0.05)
                </span>
              </div>

              {/* Time Series Table */}
              <div className="space-y-1.5 pt-1">
                {MOCK_IOT_SILAGE_READINGS.map((read) => (
                  <div
                    key={read.timestamp}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 text-[11px]"
                  >
                    <span className="font-mono font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Clock size={11} /> {read.timestamp}
                    </span>
                    <span className="font-semibold text-teal-600 dark:text-teal-400">{read.ph} pH</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{read.temperature}°C</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{read.moisture}% Moisture</span>
                    <span className="font-bold text-emerald-600">Safe</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Analyses List */}
        {activeTab === 'analyses_list' && (
          <div className="space-y-3 animate-fadeIn">
            {silageAnalyses.map((sil) => (
              <div
                key={sil.id}
                className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card-soft space-y-3 text-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-teal-600 bg-teal-50 dark:bg-teal-950/80 px-2 py-0.5 rounded-md">
                      {sil.batchId}
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1">
                      {sil.silageType}
                    </h4>
                    <p className="text-xs text-slate-400">{formatDate(sil.date)} • {sil.storageDurationDays} Days Sealed</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200">
                    {sil.overallQuality}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">pH Level</span>
                    <span className="font-bold text-teal-600">{sil.phValue}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Temp</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{sil.internalTemperatureC}°C</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Mould Status</span>
                    <span className="font-bold text-emerald-600">{sil.mouldRisk}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-[11px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1">
                      <Sparkles size={12} className="text-teal-600" /> Storage Advice (AI Screening)
                    </span>
                    <ReadAloudButton textToRead={sil.storageAdvice} size="sm" />
                  </div>
                  <p className="text-teal-800 dark:text-teal-300 leading-relaxed">{sil.storageAdvice}</p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <SourceTag source="Sensor Reading" />
                  <button
                    onClick={() => setActiveQRBatchId(sil.batchId)}
                    className="py-1 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1"
                  >
                    <QrCode size={13} /> View QR Seal
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      <BottomNavigation />

      {/* Silage Analysis Modal */}
      <SilageAnalysisModal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        onAnalysisSaved={addSilageAnalysis}
        onGenerateQRBatch={addQRBatch}
      />

      {/* QR Viewer Modal */}
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
