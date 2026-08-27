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
  FileCheck,
} from 'lucide-react';

export const HomeDashboardScreen: React.FC = () => {
  const {
    animals,
    healthAlerts,
    vaccinations,
    milkQuality,
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

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
      <MobileHeader showGreeting={true} />

      <main className="p-4 sm:p-5 space-y-4 animate-fadeIn">
        
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
            value={milkQuality.totalYieldTodayL}
            unit="Liters"
            icon={Milk}
            colorScheme="teal"
            trend="+2.8% vs last wk"
            trendPositive={true}
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

        {/* Quick Actions Grid (7 items as requested in spec) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.quickActions}
            </h3>
            <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">1-Tap Fast Launch</span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            
            {/* 1. Add Animal */}
            <button
              type="button"
              onClick={() => setIsAddAnimalOpen(true)}
              className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center gap-1.5 active:scale-95 transition hover:border-dairy-500 group"
            >
              <div className="w-9 h-9 rounded-xl bg-dairy-100 dark:bg-dairy-950 text-dairy-600 dark:text-dairy-400 flex items-center justify-center group-hover:scale-105 transition-transform">
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

            {/* 3. Feed Check */}
            <button
              type="button"
              onClick={() => setIsFeedAnalysisOpen(true)}
              className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center gap-1.5 active:scale-95 transition hover:border-amber-500 group"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Wheat size={18} />
              </div>
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 leading-tight">
                {t.feedCheck}
              </span>
            </button>

            {/* 4. Silage Check */}
            <button
              type="button"
              onClick={() => setIsSilageAnalysisOpen(true)}
              className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center gap-1.5 active:scale-95 transition hover:border-teal-500 group"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Activity size={18} />
              </div>
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 leading-tight">
                {t.silageCheck}
              </span>
            </button>

            {/* 5. Record Milk */}
            <button
              type="button"
              onClick={() => setIsRecordMilkOpen(true)}
              className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center gap-1.5 active:scale-95 transition hover:border-dairy-500 group"
            >
              <div className="w-9 h-9 rounded-xl bg-dairy-100 dark:bg-dairy-950 text-dairy-600 dark:text-dairy-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Milk size={18} />
              </div>
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 leading-tight">
                {t.recordMilk}
              </span>
            </button>

            {/* 6. Vaccinations */}
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

            {/* 7. Ask Dairy Nova AI */}
            <button
              type="button"
              onClick={() => navigate('ai-chat')}
              className="p-2.5 rounded-2xl bg-gradient-to-tr from-teal-50 to-dairy-50 dark:from-teal-950/60 dark:to-dairy-950/60 border border-teal-300 dark:border-teal-700 shadow-sm col-span-2 flex flex-col items-center justify-center gap-1 active:scale-95 transition group"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-600 to-dairy-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-md shadow-teal-600/30">
                <Sparkles size={16} className="animate-pulse" />
              </div>
              <span className="text-[11px] font-extrabold text-teal-800 dark:text-teal-200">
                {t.askAI}
              </span>
            </button>

          </div>
        </div>

        {/* Today's AI Advisory Card */}
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
                className="text-xs font-bold text-dairy-600 dark:text-dairy-400 flex items-center gap-0.5 hover:underline"
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
                <p className="text-[10px] text-slate-400">Predicted tomorrow: {milkQuality.predictedTomorrowYieldL} L</p>
              </div>
            </div>
            <button
              onClick={() => navigate('milk')}
              className="text-[11px] font-bold text-dairy-600 dark:text-dairy-400 hover:underline"
            >
              Details
            </button>
          </div>

          {/* Clean Mobile-Friendly SVG Yield Bar Chart */}
          <div className="flex items-end justify-between gap-1.5 h-20 pt-2 px-1">
            {milkQuality.historicalTrend.map((item, idx) => {
              const heightPercent = Math.max(20, Math.min(100, ((item.yield - 130) / (165 - 130)) * 100));
              const isToday = idx === milkQuality.historicalTrend.length - 1;

              return (
                <div key={item.date} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-[9px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.yield}
                  </span>
                  <div
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      isToday
                        ? 'bg-gradient-to-t from-dairy-600 to-teal-400 shadow-sm'
                        : 'bg-slate-200 dark:bg-slate-800 group-hover:bg-teal-200'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className={`text-[9px] truncate max-w-[34px] ${isToday ? 'font-black text-dairy-600 dark:text-dairy-400' : 'text-slate-400'}`}>
                    {item.date.split(' ')[0]}
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
