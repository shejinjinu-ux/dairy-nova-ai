import React, { useState } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { MobileHeader } from '../../components/common/MobileHeader';
import { BottomNavigation } from '../../components/common/BottomNavigation';
import { MetricCard } from '../../components/common/MetricCard';
import { FeedAnalysisModal } from '../../components/feed/FeedAnalysisModal';
import { SilageAnalysisModal } from '../../components/silage/SilageAnalysisModal';
import { TestReportModal } from '../../components/feed/TestReportModal';
import { AddAnimalModal } from '../../components/animals/AddAnimalModal';
import { RecordMilkModal } from '../../components/milk/RecordMilkModal';
import { DiseaseScreeningModal } from '../../components/health/DiseaseScreeningModal';
import { formatDate } from '../../utils/formatters';
import {
  Wheat,
  Layers,
  Sparkles,
  Camera,
  Keyboard,
  History,
  Radio,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Milk,
  Syringe,
  Stethoscope,
  Activity,
  PlusCircle,
  TrendingUp,
  Dna,
  Bot,
} from 'lucide-react';

export const HomeDashboardScreen: React.FC = () => {
  const {
    animals,
    feedAnalyses,
    silageAnalyses,
    milkRecords,
    vaccinations,
    healthAlerts,
    navigate,
    addFeedAnalysis,
    addSilageAnalysis,
    addQRBatch,
    addAnimal,
    recordMilk,
    addHealthAlert,
  } = useAppData();
  const { user } = useAuth();
  const { t } = useLanguage();

  // Modals state
  const [isFeedAnalysisOpen, setIsFeedAnalysisOpen] = useState<boolean>(false);
  const [isSilageAnalysisOpen, setIsSilageAnalysisOpen] = useState<boolean>(false);
  const [isAddAnimalOpen, setIsAddAnimalOpen] = useState<boolean>(false);
  const [isRecordMilkOpen, setIsRecordMilkOpen] = useState<boolean>(false);
  const [isDiseaseScreeningOpen, setIsDiseaseScreeningOpen] = useState<boolean>(false);

  // Selected test for report view
  const [selectedReportTest, setSelectedReportTest] = useState<{
    type: 'Feed' | 'Silage';
    data: any;
  } | null>(null);

  // Combine latest test from feed or silage
  const allTests = [
    ...feedAnalyses.map((f) => ({ ...f, testKind: 'Feed' as const })),
    ...silageAnalyses.map((s) => ({ ...s, testKind: 'Silage' as const })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const latestTest = allTests.length > 0 ? allTests[0] : null;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
      <MobileHeader showGreeting={true} />

      <main className="p-4 sm:p-5 space-y-4 pb-20 animate-fadeIn">
        
        {/* ========================================================================= */}
        {/* 1. APP BRANDING HEADER */}
        {/* ========================================================================= */}
        <div className="space-y-0.5 pt-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              DAIRY NOVA AI
            </h1>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 shadow-sm">
              RAPID TESTING
            </span>
          </div>
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            {t.rapidTestSubtitle || 'Smart AI-Enabled Rapid Feed & Silage Quality Testing'}
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 2. TWO SEPARATE LARGE PRIMARY CARDS: RAPID FEED & RAPID SILAGE */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          
          {/* Card 1: 🌾 RAPID FEED QUALITY TEST */}
          <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-emerald-700 via-emerald-800 to-slate-900 text-white shadow-lg shadow-emerald-950/30 border border-emerald-500/40 flex flex-col justify-between space-y-3 group hover:border-emerald-400 transition">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
            
            <div className="relative z-10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/30 border border-emerald-400/30 flex items-center justify-center text-2xl shadow-inner">
                  🌾
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-400 text-slate-950 px-2.5 py-0.5 rounded-full">
                  NIR Proximate AI
                </span>
              </div>

              <div>
                <h3 className="font-black text-base sm:text-lg text-white leading-tight">
                  {t.rapidFeedTest || 'RAPID FEED QUALITY TEST'}
                </h3>
                <p className="text-xs text-emerald-100/90 leading-relaxed mt-1">
                  Test protein, dry matter, crude fiber & moisture safety before feeding.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsFeedAnalysisOpen(true)}
              className="relative z-10 w-full py-3 px-4 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <span>{t.testFeedCTA || 'TEST FEED'}</span>
              <ArrowRight size={15} className="stroke-[2.5px]" />
            </button>
          </div>

          {/* Card 2: 🌽 RAPID SILAGE QUALITY TEST */}
          <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 text-white shadow-lg shadow-teal-950/30 border border-teal-500/40 flex flex-col justify-between space-y-3 group hover:border-teal-400 transition">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-400/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/30 border border-teal-400/30 flex items-center justify-center text-2xl shadow-inner">
                  🌽
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-teal-400 text-slate-950 px-2.5 py-0.5 rounded-full">
                  FAO Fermentation FQI
                </span>
              </div>

              <div>
                <h3 className="font-black text-base sm:text-lg text-white leading-tight">
                  {t.rapidSilageTest || 'RAPID SILAGE QUALITY TEST'}
                </h3>
                <p className="text-xs text-teal-100/90 leading-relaxed mt-1">
                  Check pH acidity, core temperature, spoilage risk & FQI fermentation index.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSilageAnalysisOpen(true)}
              className="relative z-10 w-full py-3 px-4 rounded-2xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-xs shadow-md shadow-teal-950/20 flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <span>{t.testSilageCTA || 'TEST SILAGE'}</span>
              <ArrowRight size={15} className="stroke-[2.5px]" />
            </button>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 3. QUICK ACTIONS BAR */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Action 1: Scan Sample */}
          <button
            type="button"
            onClick={() => navigate('rapid-test')}
            className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-2.5 active:scale-95 transition hover:border-emerald-500 group text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Camera size={16} />
            </div>
            <div className="overflow-hidden">
              <span className="text-[11px] font-bold text-slate-900 dark:text-white block truncate">
                {t.scanSample || '📷 Scan Sample'}
              </span>
              <span className="text-[9px] text-slate-400 block truncate">Photo log</span>
            </div>
          </button>

          {/* Action 2: Enter Test Data */}
          <button
            type="button"
            onClick={() => navigate('rapid-test')}
            className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-2.5 active:scale-95 transition hover:border-teal-500 group text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Keyboard size={16} />
            </div>
            <div className="overflow-hidden">
              <span className="text-[11px] font-bold text-slate-900 dark:text-white block truncate">
                {t.enterTestData || '📊 Enter Data'}
              </span>
              <span className="text-[9px] text-slate-400 block truncate">Manual entry</span>
            </div>
          </button>

          {/* Action 3: Test History */}
          <button
            type="button"
            onClick={() => navigate('history')}
            className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-2.5 active:scale-95 transition hover:border-amber-500 group text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <History size={16} />
            </div>
            <div className="overflow-hidden">
              <span className="text-[11px] font-bold text-slate-900 dark:text-white block truncate">
                {t.testHistory || '📋 Test History'}
              </span>
              <span className="text-[9px] text-slate-400 block truncate">{allTests.length} tests</span>
            </div>
          </button>

          {/* Action 4: Feed Recommendations */}
          <button
            type="button"
            onClick={() => navigate('feed')}
            className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-2.5 active:scale-95 transition hover:border-blue-500 group text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Wheat size={16} />
            </div>
            <div className="overflow-hidden">
              <span className="text-[11px] font-bold text-slate-900 dark:text-white block truncate">
                {t.feedRecommendations || '🌾 Feed Advice'}
              </span>
              <span className="text-[9px] text-slate-400 block truncate">ICAR Rations</span>
            </div>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 4. RECENT TESTS SECTION */}
        {/* ========================================================================= */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Activity size={13} className="text-emerald-600" />
              {t.recentTests || 'Recent Quality Tests'}
            </h3>
            <button
              type="button"
              onClick={() => navigate('history')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              {t.viewAll || 'View all'} ({allTests.length})
            </button>
          </div>

          {latestTest ? (
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${
                    latestTest.testKind === 'Feed' ? 'bg-amber-100 text-amber-700' : 'bg-teal-100 text-teal-700'
                  }`}>
                    {latestTest.testKind === 'Feed' ? '🌾' : '🌽'}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
                      {'feedName' in latestTest ? latestTest.feedName : latestTest.silageType}
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      {latestTest.batchId} • {formatDate(latestTest.date)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      {'overallScore' in latestTest ? latestTest.overallScore : latestTest.fqiScore}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">/ 100</span>
                  </div>
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    latestTest.isGood === 'Good'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : latestTest.isGood === 'Moderate'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}>
                    {latestTest.isGood === 'Good' ? '🟢 GOOD' : latestTest.isGood === 'Moderate' ? '🟡 CAUTION' : '🔴 HIGH RISK'}
                  </span>
                </div>
              </div>

              {/* Rationale snippet */}
              <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl leading-relaxed">
                {latestTest.simpleVerdict || ('aiAdvisory' in latestTest ? latestTest.aiAdvisory : latestTest.storageAdvice)}
              </p>

              {/* Certificate button */}
              <button
                type="button"
                onClick={() => setSelectedReportTest({ type: latestTest.testKind, data: latestTest })}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <FileText size={14} className="text-emerald-600" />
                <span>{t.printShareReport || 'Print / Share Quality Report'}</span>
              </button>
            </div>
          ) : (
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-2">
              <span className="text-2xl block">🔬</span>
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
                No Quality Tests Recorded Yet
              </h4>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Tap TEST FEED or TEST SILAGE above to run your first rapid quality analysis.
              </p>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 5. HONEST SENSOR INTEGRATION CARD (NO FAKE SENSORS) */}
        {/* ========================================================================= */}
        <div className="p-4 rounded-3xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                <Radio size={15} />
              </div>
              <span className="font-extrabold text-slate-800 dark:text-slate-200">
                📡 SENSOR INTEGRATION
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              Not Connected
            </span>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Hardware sensor probe integration is future-ready. Use Camera or Manual entry for instant rapid testing.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 6. SUPPORTING DAIRY TOOLS GRID */}
        {/* ========================================================================= */}
        <div className="space-y-2.5 pt-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Supporting Dairy Tools
          </h3>

          <div className="grid grid-cols-3 gap-2">
            {/* Tool 1: Animals */}
            <button
              type="button"
              onClick={() => navigate('animals')}
              className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center text-center gap-1.5 active:scale-95 transition hover:border-emerald-500"
            >
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center text-lg">
                🐄
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {t.navAnimals || 'My Cattle'}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">{animals.length} Cows</span>
            </button>

            {/* Tool 2: Milk Yield */}
            <button
              type="button"
              onClick={() => navigate('milk')}
              className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center text-center gap-1.5 active:scale-95 transition hover:border-emerald-500"
            >
              <div className="w-9 h-9 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center text-lg">
                🥛
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {t.navMilk || 'Milk Logs'}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">{milkRecords.length} Shifts</span>
            </button>

            {/* Tool 3: Health */}
            <button
              type="button"
              onClick={() => setIsDiseaseScreeningOpen(true)}
              className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center text-center gap-1.5 active:scale-95 transition hover:border-emerald-500"
            >
              <div className="w-9 h-9 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center text-lg">
                🩺
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {t.navHealth || 'Health AI'}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">{healthAlerts.length} Alerts</span>
            </button>

            {/* Tool 4: Breed */}
            <button
              type="button"
              onClick={() => navigate('breeds')}
              className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center text-center gap-1.5 active:scale-95 transition hover:border-emerald-500"
            >
              <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center text-lg">
                🧬
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {t.breedCatalog || 'Breeds'}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">41 Breeds</span>
            </button>

            {/* Tool 5: Vaccination */}
            <button
              type="button"
              onClick={() => navigate('vaccinations')}
              className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center text-center gap-1.5 active:scale-95 transition hover:border-emerald-500"
            >
              <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center text-lg">
                💉
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {t.vaccinations || 'Vaccines'}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">{vaccinations.length} Due</span>
            </button>

            {/* Tool 6: AI Chat */}
            <button
              type="button"
              onClick={() => navigate('ai-chat')}
              className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center text-center gap-1.5 active:scale-95 transition hover:border-emerald-500"
            >
              <div className="w-9 h-9 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center text-lg">
                🤖
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {t.askAI || 'AI Assistant'}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">24/7 Live</span>
            </button>
          </div>
        </div>

      </main>

      <BottomNavigation />

      {/* Rapid Feed Analysis Modal */}
      <FeedAnalysisModal
        isOpen={isFeedAnalysisOpen}
        onClose={() => setIsFeedAnalysisOpen(false)}
        onAnalysisSaved={addFeedAnalysis}
        onGenerateQRBatch={addQRBatch}
      />

      {/* Rapid Silage Analysis Modal */}
      <SilageAnalysisModal
        isOpen={isSilageAnalysisOpen}
        onClose={() => setIsSilageAnalysisOpen(false)}
        onAnalysisSaved={addSilageAnalysis}
        onGenerateQRBatch={addQRBatch}
      />

      {/* Disease Screening Modal */}
      <DiseaseScreeningModal
        isOpen={isDiseaseScreeningOpen}
        onClose={() => setIsDiseaseScreeningOpen(false)}
        onResultSaved={addHealthAlert}
        onOpenAIChat={() => navigate('ai-chat')}
      />

      {/* Add Animal Modal */}
      <AddAnimalModal
        isOpen={isAddAnimalOpen}
        onClose={() => setIsAddAnimalOpen(false)}
        onAnimalAdded={addAnimal}
      />

      {/* Record Milk Modal */}
      <RecordMilkModal
        animals={animals}
        isOpen={isRecordMilkOpen}
        onClose={() => setIsRecordMilkOpen(false)}
        onMilkRecorded={recordMilk}
      />

      {/* Printable Test Report Certificate Modal */}
      {selectedReportTest && (
        <TestReportModal
          isOpen={true}
          onClose={() => setSelectedReportTest(null)}
          testType={selectedReportTest.type}
          result={selectedReportTest.data}
        />
      )}

    </div>
  );
};
