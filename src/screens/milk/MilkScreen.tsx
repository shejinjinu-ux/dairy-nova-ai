import React, { useState } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { MobileHeader } from '../../components/common/MobileHeader';
import { BottomNavigation } from '../../components/common/BottomNavigation';
import { MetricCard } from '../../components/common/MetricCard';
import { SourceTag } from '../../components/common/SourceTag';
import { RecordMilkModal } from '../../components/milk/RecordMilkModal';
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
  Scale,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const MilkScreen: React.FC = () => {
  const { animals, milkRecords, milkQuality, recordMilk } = useAppData();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'daily_yield' | 'quality_metrics'>('daily_yield');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);
  const [selectedAnimalFilter, setSelectedAnimalFilter] = useState<string>('All');
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');

  const filteredRecords = milkRecords.filter((r) =>
    selectedAnimalFilter === 'All' ? true : r.animalId === selectedAnimalFilter
  );

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
      <MobileHeader title={t.navMilk} subtitle="Herd Milk Production & Quality Grades" />

      <main className="p-4 sm:p-5 space-y-4 pb-20 animate-fadeIn">
        
        {/* Tab Toggle */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-900 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('daily_yield')}
            className={`py-2 px-3 rounded-xl transition active:scale-95 flex items-center justify-center gap-1.5 ${
              activeTab === 'daily_yield'
                ? 'bg-white dark:bg-slate-800 text-dairy-700 dark:text-dairy-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Milk size={14} className="text-dairy-600" /> Yield & Shifts
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
                label="Morning Milk"
                value={milkQuality.morningYieldL}
                unit="Liters"
                icon={Sun}
                colorScheme="amber"
              />
              <MetricCard
                label="Evening Milk"
                value={milkQuality.eveningYieldL}
                unit="Liters"
                icon={Moon}
                colorScheme="blue"
              />
              <MetricCard
                label="Total Daily Milk"
                value={milkQuality.totalYieldTodayL}
                unit="Liters"
                icon={Milk}
                colorScheme="emerald"
                trend="+2.8% vs last week"
                trendPositive={true}
              />
              <MetricCard
                label="AI Predicted Yield"
                value={milkQuality.predictedTomorrowYieldL}
                unit="Liters"
                icon={Sparkles}
                colorScheme="teal"
              />
            </div>

            {/* Record Milk Trigger Button */}
            <button
              type="button"
              onClick={() => setIsRecordModalOpen(true)}
              className="w-full py-3 px-4 rounded-2xl bg-dairy-600 hover:bg-dairy-700 text-white font-bold text-xs shadow-md shadow-dairy-600/30 flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <Plus size={16} /> Record Shift Milk Collection
            </button>

            {/* AI Production Insight Card */}
            <div className="p-3.5 rounded-3xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-teal-900 dark:text-teal-200 flex items-center gap-1.5 text-xs">
                  <Sparkles size={14} className="text-teal-600" /> AI Milk Production Intelligence
                </span>
                <SourceTag source="AI Screening" />
              </div>
              <p className="text-teal-800 dark:text-teal-300 text-[11px] leading-relaxed">
                Total daily milk output is <strong>4.2 Liters higher</strong> than last week average following recent Super Napier harvest ration optimization. <strong>TAG-106 Daisy</strong> is down 6L due to subclinical fever.
              </p>
            </div>

            {/* Production Trend Chart */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card-soft space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white">Herd Production Trend</h4>
                  <p className="text-[10px] text-slate-400">Daily bulk milk vat collection volume</p>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10px] font-bold">
                  <button
                    onClick={() => setTimeRange('7d')}
                    className={`px-2 py-0.5 rounded-md ${timeRange === '7d' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}
                  >
                    7 Days
                  </button>
                  <button
                    onClick={() => setTimeRange('30d')}
                    className={`px-2 py-0.5 rounded-md ${timeRange === '30d' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}
                  >
                    30 Days
                  </button>
                </div>
              </div>

              {/* Bar visualization */}
              <div className="flex items-end justify-between gap-1.5 h-24 pt-3 px-1">
                {milkQuality.historicalTrend.map((item, idx) => {
                  const heightPercent = Math.max(20, Math.min(100, ((item.yield - 130) / (165 - 130)) * 100));
                  const isToday = idx === milkQuality.historicalTrend.length - 1;

                  return (
                    <div key={item.date} className="flex-1 flex flex-col items-center gap-1 group">
                      <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.yield}
                      </span>
                      <div
                        className={`w-full rounded-t-lg transition-all duration-300 ${
                          isToday
                            ? 'bg-gradient-to-t from-dairy-600 to-teal-400 shadow-sm'
                            : 'bg-slate-200 dark:bg-slate-800 group-hover:bg-dairy-300'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                      <span className={`text-[9px] truncate max-w-[34px] ${isToday ? 'font-bold text-dairy-600 dark:text-dairy-400' : 'text-slate-400'}`}>
                        {item.date.split(' ')[0]}
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
                  Individual Animal Records ({filteredRecords.length})
                </h3>
                <select
                  value={selectedAnimalFilter}
                  onChange={(e) => setSelectedAnimalFilter(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  <option value="All">All Animals</option>
                  {animals.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.tagId} — {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                {filteredRecords.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-mono text-[10px] font-bold text-teal-600 bg-teal-50 dark:bg-teal-950 px-1.5 py-0.2 rounded">
                          {rec.animalTag}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">{rec.animalName}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">{rec.shift} Shift • {formatDate(rec.date)}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-dairy-600 dark:text-dairy-400 block">{rec.quantityLiters} L</span>
                      {rec.fatPercent && <span className="text-[10px] text-slate-400">Fat {rec.fatPercent}% • SNF {rec.snfPercent}%</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Quality & Fat / SNF */}
        {activeTab === 'quality_metrics' && (
          <div className="space-y-4 animate-fadeIn text-xs">
            
            {/* Overall Quality Seal */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-dairy-700 to-teal-900 text-white space-y-2 shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-dairy-200">
                    Bulk Tank Quality Standard
                  </span>
                  <h3 className="text-2xl font-black">{milkQuality.overallQuality}</h3>
                  <span className="text-xs text-dairy-100">Cooperative Certified Class 1 Pure</span>
                </div>
                <SourceTag source="Measured" />
              </div>
            </div>

            {/* Proximate Milk Solids Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block font-medium">Butterfat (Fat %)</span>
                <span className="text-lg font-black text-dairy-600 dark:text-dairy-400">{milkQuality.avgFat}%</span>
                <span className="text-[10px] text-emerald-600 font-semibold block">● High A2 Fat Yield</span>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block font-medium">Solids-Not-Fat (SNF %)</span>
                <span className="text-lg font-black text-teal-600 dark:text-teal-400">{milkQuality.avgSnf}%</span>
                <span className="text-[10px] text-emerald-600 font-semibold block">● Exceeds 8.5% Standard</span>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block font-medium">Protein Solids</span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white">{milkQuality.avgProtein}%</span>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block font-medium">Lactose Sugar</span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white">{milkQuality.avgLactose}%</span>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block font-medium">pH Level</span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white">{milkQuality.ph}</span>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block font-medium">Somatic Cell Count (SCC)</span>
                <span className="text-base font-extrabold text-emerald-600">185k cells/ml</span>
                <span className="text-[10px] text-slate-400 block">&lt; 200k (Healthy Udder)</span>
              </div>
            </div>

            {/* Adulteration Safety Seal */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-emerald-600" />
                <div>
                  <h4 className="font-bold text-emerald-900 dark:text-emerald-200">Adulteration Screening Status</h4>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold">
                    Negative for added starch, urea, detergent, or water
                  </span>
                </div>
              </div>
              <SourceTag source="Measured" />
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
