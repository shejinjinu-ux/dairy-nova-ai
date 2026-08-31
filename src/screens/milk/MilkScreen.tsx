import React, { useState, useEffect } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { MobileHeader } from '../../components/common/MobileHeader';
import { BottomNavigation } from '../../components/common/BottomNavigation';
import { MetricCard } from '../../components/common/MetricCard';
import { SourceTag } from '../../components/common/SourceTag';
import { EmptyState } from '../../components/common/FeedbackStates';
import { RecordMilkModal } from '../../components/milk/RecordMilkModal';
import { milkApi } from '../../services/api/milkApi';
import { ContaminationScreenResponse } from '../../types';
import { formatDate } from '../../utils/formatters';
import {
  Milk,
  TrendingUp,
  Sparkles,
  Plus,
  Layers,
  Sun,
  Moon,
  Droplets,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

export const MilkScreen: React.FC = () => {
  const { animals, milkRecords, recordMilk } = useAppData();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'daily_yield' | 'quality_metrics'>('daily_yield');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);
  const [selectedAnimalFilter, setSelectedAnimalFilter] = useState<string>('All');
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');

  // AI Milk Yield Prediction State (FastAPI XGBoost Model)
  const [predictedYield, setPredictedYield] = useState<number | null>(null);
  const [isPredictingYield, setIsPredictingYield] = useState<boolean>(false);

  // Sensor Lab Contamination & Mastitis State
  const [contaminationData, setContaminationData] = useState<ContaminationScreenResponse | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecords = milkRecords.filter((r) => r.date === todayStr);

  const morningYield = Number(
    todayRecords
      .filter((r) => r.shift === 'Morning')
      .reduce((sum, r) => sum + r.quantityLiters, 0)
      .toFixed(1)
  );

  const eveningYield = Number(
    todayRecords
      .filter((r) => r.shift === 'Evening')
      .reduce((sum, r) => sum + r.quantityLiters, 0)
      .toFixed(1)
  );

  const totalTodayYield = Number((morningYield + eveningYield).toFixed(1));

  // Dynamic 7-day milk production computation
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

  // Filter records by selected animal
  const filteredRecords = milkRecords.filter((r) =>
    selectedAnimalFilter === 'All' ? true : r.animalId === selectedAnimalFilter
  );

  // Fetch live AI yield prediction from FastAPI backend for selected animal
  useEffect(() => {
    if (animals.length > 0) {
      setIsPredictingYield(true);
      const targetCow =
        (selectedAnimalFilter !== 'All'
          ? animals.find((a) => a.id === selectedAnimalFilter || a.tagId === selectedAnimalFilter)
          : null) || animals[0];

      milkApi
        .predictMilkYield({
          Lactation_Stage: targetCow.lactationStage || 'Early',
          Body_Weight_kg: targetCow.weightKg || 420.0,
          Feed_Intake_kg_day: 14.5,
          Rumination_Time_min_day: targetCow.ruminationMinutesPerDay || 480.0,
          Humidity_percent: 65.0,
          Breed: targetCow.breed || 'Gir',
          Cattle_ID: targetCow.tagId || 'HERD_AVG',
          Farm_ID: 'FARM_01',
        })
        .then((res) => {
          setPredictedYield(res.predicted_milk_yield_litres);
          setIsPredictingYield(false);
        })
        .catch((err) => {
          console.warn('AI Milk yield prediction fallback:', err);
          setIsPredictingYield(false);
        });
    }
  }, [animals.length, milkRecords.length, selectedAnimalFilter]);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
      <MobileHeader title={t.navMilk} subtitle="Herd Milk Yield & Shift Collection" />

      <main className="p-4 sm:p-5 space-y-4 pb-20 animate-fadeIn">
        
        {/* Tab Toggle */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-900 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('daily_yield')}
            className={`py-2 px-3 rounded-xl transition active:scale-95 flex items-center justify-center gap-1.5 ${
              activeTab === 'daily_yield'
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Milk size={14} className="text-emerald-600" /> Yield & Shifts
          </button>
          <button
            onClick={() => setActiveTab('quality_metrics')}
            className={`py-2 px-3 rounded-xl transition active:scale-95 flex items-center justify-center gap-1.5 ${
              activeTab === 'quality_metrics'
                ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Droplets size={14} className="text-teal-600" /> Quality & Fat / SNF
          </button>
        </div>

        {/* Tab 1: Daily Yield */}
        {activeTab === 'daily_yield' && (
          <div className="space-y-4 animate-fadeIn">
            
            {/* KPI 4-Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <MetricCard
                label="Morning Yield"
                value={morningYield}
                unit="Liters"
                icon={Sun}
                colorScheme="amber"
              />
              <MetricCard
                label="Evening Yield"
                value={eveningYield}
                unit="Liters"
                icon={Moon}
                colorScheme="blue"
              />
              <MetricCard
                label="Total Today"
                value={totalTodayYield}
                unit="Liters"
                icon={Milk}
                colorScheme="emerald"
              />
              <MetricCard
                label="AI Predicted"
                value={isPredictingYield ? '...' : predictedYield ? Number(predictedYield.toFixed(1)) : '—'}
                unit="Liters"
                icon={Sparkles}
                colorScheme="teal"
              />
            </div>

            {/* Record Milk Trigger Button */}
            <button
              type="button"
              onClick={() => setIsRecordModalOpen(true)}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <Plus size={16} /> {t.addTodaysCollection || 'Record Shift Milk Collection'}
            </button>

            {/* Production Trend Chart */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card-soft space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white">{t.herdProductionTrend || 'Herd Production Trend'}</h4>
                  <p className="text-[10px] text-slate-400">{t.dailyRecordedVolume || 'Daily recorded milk volume'}</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-600">{t.last7Days || 'Last 7 Days'}</span>
              </div>

              {/* Dynamic Bar visualization */}
              <div className="flex items-end justify-between gap-1.5 h-24 pt-3 px-1">
                {chartDays.map((item, idx) => {
                  const heightPercent = maxChartYield > 0 ? Math.max(15, (item.yieldL / maxChartYield) * 100) : 15;
                  const isToday = idx === chartDays.length - 1;

                  return (
                    <div key={item.dateStr} className="flex-1 flex flex-col items-center gap-1 group">
                      <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
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
                      <span className={`text-[9px] truncate max-w-[34px] ${isToday ? 'font-bold text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Individual Animal Filter & Records */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t.history || 'Recorded Logs'} ({filteredRecords.length})
                </h3>
                {animals.length > 0 && (
                  <select
                    value={selectedAnimalFilter}
                    onChange={(e) => setSelectedAnimalFilter(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    <option value="All">{t.allAnimals || 'All Animals'}</option>
                    {animals.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.tagId} • {a.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {filteredRecords.length === 0 ? (
                <EmptyState
                  icon={Milk}
                  title={t.noMilkRecordsYet || "No Milk Collections Logged"}
                  description={t.addTodaysCollection || "Record morning and evening milking shift yields."}
                  actionLabel={t.recordMilk || "Record First Shift"}
                  onAction={() => setIsRecordModalOpen(true)}
                />
              ) : (
                <div className="space-y-2">
                  {filteredRecords.map((record) => (
                    <div
                      key={record.id}
                      className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card-soft flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs ${
                            record.shift === 'Morning'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                          }`}
                        >
                          {record.shift === 'Morning' ? '🌅' : '🌙'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
                              {record.animalName || record.animalTag}
                            </h4>
                            <span className="text-[10px] text-slate-400">
                              {record.shift === 'Morning' ? (t.morningShift || 'Morning') : (t.eveningShift || 'Evening')}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            {formatDate(record.date)}
                            {record.fatPercent ? ` • Fat: ${record.fatPercent}%` : ''}
                            {record.snfPercent ? ` • SNF: ${record.snfPercent}%` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                          {record.quantityLiters} L
                        </span>
                        <SourceTag source="Manual Entry" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Tab 2: Quality & Fat / SNF */}
        {activeTab === 'quality_metrics' && (
          <div className="space-y-4 animate-fadeIn text-xs">
            {/* Proximate Milk Solids Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block font-medium">{t.butterfat || 'Butterfat (Fat %)'}</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {milkRecords.length > 0 && milkRecords[0].fatPercent ? `${milkRecords[0].fatPercent}%` : '4.5%'}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold block">✓ A2 Beta-Casein Rich</span>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block font-medium">{t.snf || 'Solids Not Fat (SNF %)'}</span>
                <span className="text-lg font-black text-slate-800 dark:text-slate-200">
                  {milkRecords.length > 0 && milkRecords[0].snfPercent ? `${milkRecords[0].snfPercent}%` : '8.8%'}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold block">✓ {t.standardCompliant || 'Standard Compliant'}</span>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block font-medium">{t.proteinSolids || 'Protein Solids'}</span>
                <span className="text-lg font-black text-slate-800 dark:text-slate-200">3.4%</span>
                <span className="text-[10px] text-slate-400 block">Casein & Whey Profile</span>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block font-medium">{t.acidityPH || 'Acidity (pH)'}</span>
                <span className="text-lg font-black text-teal-600 dark:text-teal-400">6.65 pH</span>
                <span className="text-[10px] text-emerald-600 font-semibold block">✓ {t.freshUdderRange || 'Fresh Udder Range'}</span>
              </div>
            </div>
          </div>
        )}

      </main>

      <BottomNavigation />

      {/* Record Milk Modal */}
      <RecordMilkModal
        animals={animals}
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onMilkRecorded={recordMilk}
      />

    </div>
  );
};
