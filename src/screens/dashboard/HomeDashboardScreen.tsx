import React, { useState } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { MobileHeader } from '../../components/common/MobileHeader';
import { BottomNavigation } from '../../components/common/BottomNavigation';
import { MetricCard } from '../../components/common/MetricCard';
import { AIAdvisoryCard } from '../../components/ai/AIAdvisoryCard';
import { HealthAlertCard } from '../../components/health/HealthAlertCard';
import { DiseaseScreeningModal } from '../../components/health/DiseaseScreeningModal';
import { AddAnimalModal } from '../../components/animals/AddAnimalModal';
import { RecordMilkModal } from '../../components/milk/RecordMilkModal';
import { FeedAnalysisModal } from '../../components/feed/FeedAnalysisModal';
import { SilageAnalysisModal } from '../../components/silage/SilageAnalysisModal';
import {
  Layers,
  Milk,
  Syringe,
  AlertTriangle,
  PlusCircle,
  Stethoscope,
  Sparkles,
  Wheat,
  Activity,
  ArrowRight,
  TrendingUp,
  Plus,
} from 'lucide-react';

export const HomeDashboardScreen: React.FC = () => {
  const {
    animals,
    healthAlerts,
    vaccinations,
    milkRecords,
    navigate,
    addAnimal,
    recordMilk,
    addHealthAlert,
    resolveHealthAlert,
    addFeedAnalysis,
    addSilageAnalysis,
    addQRBatch,
  } = useAppData();
  const { user } = useAuth();
  const { t } = useLanguage();

  // Modals state
  const [isAddAnimalOpen, setIsAddAnimalOpen] = useState<boolean>(false);
  const [isDiseaseScreeningOpen, setIsDiseaseScreeningOpen] = useState<boolean>(false);
  const [isRecordMilkOpen, setIsRecordMilkOpen] = useState<boolean>(false);
  const [isFeedAnalysisOpen, setIsFeedAnalysisOpen] = useState<boolean>(false);
  const [isSilageAnalysisOpen, setIsSilageAnalysisOpen] = useState<boolean>(false);

  const attentionAnimalsCount = animals.filter(
    (a) => a.healthStatus === 'Needs Attention' || a.healthStatus === 'Critical Alert'
  ).length;

  const upcomingVaccinesCount = vaccinations.filter(
    (v) => v.status === 'Upcoming' || v.status === 'Due' || v.status === 'Overdue'
  ).length;

  const activeAlerts = healthAlerts.filter((a) => a.status === 'active').slice(0, 2);

  // Dynamic milk computation from actual recorded milk logs
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayRecordedYield = milkRecords
    .filter((r) => r.date === todayDateStr)
    .reduce((sum, r) => sum + r.quantityLiters, 0);

  const totalYieldSum = milkRecords.reduce((sum, r) => sum + r.quantityLiters, 0);
  const todayMilkDisplay = Number(todayRecordedYield.toFixed(1));

  // Compute last 7 days milk data dynamically
  const last7DaysMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split('T')[0];
    last7DaysMap[dateKey] = 0;
  }

  milkRecords.forEach((rec) => {
    if (last7DaysMap[rec.date] !== undefined) {
      last7DaysMap[rec.date] += rec.quantityLiters;
    }
  });

  const chartDays = Object.entries(last7DaysMap).map(([dateStr, yieldL]) => {
    const dateObj = new Date(dateStr);
    const label = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    return { dateStr, label, yieldL: Number(yieldL.toFixed(1)) };
  });

  const maxChartYield = Math.max(...chartDays.map((d) => d.yieldL), 10);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
      <MobileHeader showGreeting={true} />

      <main className="p-4 sm:p-5 space-y-4 animate-fadeIn">
        
        {/* PRIMARY CORE MODULES: Rapid Feed & Silage Quality Testing Hero Banner */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles size={14} className="text-emerald-500" /> Rapid Quality Testing
            </h3>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-extrabold bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
              Primary System
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Feed Quality Hero Card */}
            <div
              onClick={() => setIsFeedAnalysisOpen(true)}
              className="p-4 rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-950 text-white shadow-lg border border-emerald-500/40 cursor-pointer hover:border-emerald-400 transition active:scale-98 space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 group-hover:scale-105 transition-transform">
                  <Wheat size={20} />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wide bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  NIR AI Testing
                </span>
              </div>
              <div>
                <h4 className="font-black text-sm text-white flex items-center justify-between">
                  <span>{t.rapidFeedTest || 'Rapid Feed Quality Test'}</span>
                  <ArrowRight size={14} className="text-emerald-300 group-hover:translate-x-1 transition-transform" />
                </h4>
                <p className="text-[11px] text-emerald-100/80 leading-relaxed mt-0.5">
                  Screen crude protein, dry matter, fiber, and nutritional safety for cattle.
                </p>
              </div>
            </div>

            {/* Silage Quality Hero Card */}
            <div
              onClick={() => setIsSilageAnalysisOpen(true)}
              className="p-4 rounded-3xl bg-gradient-to-br from-teal-800 via-slate-900 to-slate-950 text-white shadow-lg border border-teal-500/40 cursor-pointer hover:border-teal-400 transition active:scale-98 space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-teal-400/20 border border-teal-400/30 flex items-center justify-center text-teal-300 group-hover:scale-105 transition-transform">
                  <Layers size={20} />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wide bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-400/30">
                  Fermentation AI
                </span>
              </div>
              <div>
                <h4 className="font-black text-sm text-white flex items-center justify-between">
                  <span>{t.rapidSilageTest || 'Rapid Silage Quality Test'}</span>
                  <ArrowRight size={14} className="text-teal-300 group-hover:translate-x-1 transition-transform" />
                </h4>
                <p className="text-[11px] text-teal-100/80 leading-relaxed mt-0.5">
                  Test pH, fermentation quality index (FQI), temperature, and pit spoilage.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Summary 4-KPI Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <MetricCard
            label={t.totalAnimals}
            value={animals.length}
            unit="Cattle"
            icon={Layers}
            colorScheme="emerald"
            onClick={() => navigate('animals')}
          />
          <MetricCard
            label={t.todayMilk}
            value={todayMilkDisplay}
            unit="Liters"
            icon={Milk}
            colorScheme="teal"
            onClick={() => navigate('milk')}
          />
          <MetricCard
            label={t.upcomingVaccinations}
            value={upcomingVaccinesCount}
            unit="Due"
            icon={Syringe}
            colorScheme="amber"
            onClick={() => navigate('vaccinations')}
          />
          <MetricCard
            label={t.attentionNeeded}
            value={attentionAnimalsCount}
            unit="Animals"
            icon={AlertTriangle}
            colorScheme={attentionAnimalsCount > 0 ? 'rose' : 'emerald'}
            onClick={() => navigate('health')}
          />
        </div>

        {/* Empty state prompt for brand new farmers with no cattle */}
        {animals.length === 0 && (
          <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-slate-500/10 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
                No Cattle Registered Yet
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Register your cow or buffalo to get AI feed balancing and health screening.
              </p>
            </div>
            <button
              onClick={() => setIsAddAnimalOpen(true)}
              className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 shadow-sm flex items-center gap-1.5 active:scale-95 transition"
            >
              <PlusCircle size={14} />
              <span>Add Cattle</span>
            </button>
          </div>
        )}

        {/* Supporting Quick Actions Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Supporting Features
            </h3>
            <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">Fast Launch</span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            
            {/* 1. Add Animal */}
            <button
              type="button"
              onClick={() => setIsAddAnimalOpen(true)}
              className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center gap-1.5 active:scale-95 transition hover:border-emerald-500 group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <PlusCircle size={18} />
              </div>
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 leading-tight">
                {t.addAnimal}
              </span>
            </button>

            {/* 2. Disease Check */}
            <button
              type="button"
              onClick={() => setIsDiseaseScreeningOpen(true)}
              className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center gap-1.5 active:scale-95 transition hover:border-teal-500 group"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Stethoscope size={18} />
              </div>
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 leading-tight">
                {t.diseaseCheck}
              </span>
            </button>

            {/* 3. Record Milk */}
            <button
              type="button"
              onClick={() => setIsRecordMilkOpen(true)}
              className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center gap-1.5 active:scale-95 transition hover:border-emerald-500 group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Milk size={18} />
              </div>
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 leading-tight">
                {t.recordMilk}
              </span>
            </button>

            {/* 4. Vaccinations */}
            <button
              type="button"
              onClick={() => navigate('vaccinations')}
              className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center gap-1.5 active:scale-95 transition hover:border-amber-500 group"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Syringe size={18} />
              </div>
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 leading-tight">
                {t.vaccinations}
              </span>
            </button>

            {/* 5. Breeds Catalog */}
            <button
              type="button"
              onClick={() => navigate('breeds')}
              className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm col-span-2 flex items-center justify-center gap-2 active:scale-95 transition hover:border-emerald-500 group"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                <Activity size={16} />
              </div>
              <div className="text-left">
                <strong className="block text-[11px] text-slate-800 dark:text-slate-200 font-bold">41 Indian Breeds</strong>
                <span className="text-[9px] text-slate-400">Genetics & milk stats</span>
              </div>
            </button>

            {/* 6. Ask Dairy Nova AI */}
            <button
              type="button"
              onClick={() => navigate('ai-chat')}
              className="p-2.5 rounded-2xl bg-gradient-to-tr from-teal-50 to-emerald-50 dark:from-teal-950/60 dark:to-emerald-950/60 border border-teal-300 dark:border-teal-700 shadow-sm col-span-2 flex items-center justify-center gap-2 active:scale-95 transition group"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-md shadow-teal-600/30">
                <Sparkles size={16} />
              </div>
              <div className="text-left">
                <strong className="block text-[11px] font-black text-teal-900 dark:text-teal-200">{t.askAI}</strong>
                <span className="text-[9px] text-teal-700 dark:text-teal-300">Nutrition & Health AI</span>
              </div>
            </button>

          </div>
        </div>

        {/* Dynamic AI Herd & Nutrition Advisory */}
        <AIAdvisoryCard onAskAIClick={() => navigate('ai-chat')} />

        {/* Recent Priority Alerts */}
        {activeAlerts.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t.recentAlerts} ({healthAlerts.length})
              </h3>
              <button
                onClick={() => navigate('health')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 hover:underline"
              >
                View All <ArrowRight size={12} />
              </button>
            </div>

            <div className="space-y-2.5">
              {activeAlerts.map((alert) => (
                <HealthAlertCard
                  key={alert.id}
                  alert={alert}
                  onResolve={resolveHealthAlert}
                  onAskAI={() => navigate('ai-chat')}
                  onScreening={() => setIsDiseaseScreeningOpen(true)}
                />
              ))}
            </div>
          </div>
        )}

        {/* 7-Day Production Mini-Trend Card */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card-soft space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center">
                <TrendingUp size={15} />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">7-Day Milk Production Trend</h4>
                <p className="text-[10px] text-slate-400">
                  {totalYieldSum > 0 ? `Total Logged: ${totalYieldSum.toFixed(1)} L` : 'Log daily milk to see 7-day trend'}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('milk')}
              className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Details
            </button>
          </div>

          {/* Dynamic SVG Yield Bar Chart */}
          <div className="flex items-end justify-between gap-1.5 h-20 pt-2 px-1">
            {chartDays.map((item, idx) => {
              const heightPercent = maxChartYield > 0 ? Math.max(15, (item.yieldL / maxChartYield) * 100) : 15;
              const isToday = idx === chartDays.length - 1;

              return (
                <div key={item.dateStr} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-[9px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.yieldL}
                  </span>
                  <div
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      isToday && item.yieldL > 0
                        ? 'bg-gradient-to-t from-emerald-600 to-teal-400 shadow-sm'
                        : item.yieldL > 0
                        ? 'bg-emerald-300 dark:bg-emerald-800'
                        : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className={`text-[9px] truncate max-w-[34px] ${isToday ? 'font-black text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </main>

      <BottomNavigation />

      {/* Modals */}
      <AddAnimalModal
        isOpen={isAddAnimalOpen}
        onClose={() => setIsAddAnimalOpen(false)}
        onAnimalAdded={addAnimal}
      />

      <DiseaseScreeningModal
        isOpen={isDiseaseScreeningOpen}
        onClose={() => setIsDiseaseScreeningOpen(false)}
        onResultSaved={addHealthAlert}
        onOpenAIChat={() => navigate('ai-chat')}
      />

      <RecordMilkModal
        animals={animals}
        isOpen={isRecordMilkOpen}
        onClose={() => setIsRecordMilkOpen(false)}
        onMilkRecorded={recordMilk}
      />

      <FeedAnalysisModal
        isOpen={isFeedAnalysisOpen}
        onClose={() => setIsFeedAnalysisOpen(false)}
        onAnalysisSaved={addFeedAnalysis}
        onGenerateQRBatch={addQRBatch}
      />

      <SilageAnalysisModal
        isOpen={isSilageAnalysisOpen}
        onClose={() => setIsSilageAnalysisOpen(false)}
        onAnalysisSaved={addSilageAnalysis}
        onGenerateQRBatch={addQRBatch}
      />

    </div>
  );
};
