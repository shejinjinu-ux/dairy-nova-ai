import React, { useState } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { MobileHeader } from '../../components/common/MobileHeader';
import { BottomNavigation } from '../../components/common/BottomNavigation';
import { SourceTag } from '../../components/common/SourceTag';
import { TestReportModal } from '../../components/feed/TestReportModal';
import { formatDate } from '../../utils/formatters';
import {
  History,
  Search,
  Wheat,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Milk,
  Syringe,
  Stethoscope,
  ChevronRight,
  Plus,
} from 'lucide-react';

export const HistoryScreen: React.FC = () => {
  const { feedAnalyses, silageAnalyses, milkRecords, vaccinations, healthAlerts, navigate } = useAppData();
  const { t } = useLanguage();

  const [category, setCategory] = useState<'All' | 'Feed' | 'Silage' | 'Milk' | 'Health'>('All');
  const [search, setSearch] = useState<string>('');

  // Selected test for report modal
  const [selectedReportTest, setSelectedReportTest] = useState<{
    type: 'Feed' | 'Silage';
    data: any;
  } | null>(null);

  // Unified items
  const feedItems = feedAnalyses.map((f) => ({
    id: `hist-f-${f.id}`,
    type: 'Feed' as const,
    title: f.feedName,
    subtitle: `${f.feedCategory} • CP: ${f.crudeProteinPercent}% • DM: ${f.dryMatterPercent}%`,
    date: f.date,
    score: f.overallScore,
    status: f.isGood || (f.overallScore >= 75 ? 'Good' : f.overallScore >= 55 ? 'Moderate' : 'Poor'),
    raw: f,
    icon: Wheat,
    color: 'emerald',
    onClick: () => setSelectedReportTest({ type: 'Feed', data: f }),
  }));

  const silageItems = silageAnalyses.map((s) => ({
    id: `hist-s-${s.id}`,
    type: 'Silage' as const,
    title: s.silageType,
    subtitle: `pH ${s.phValue} • Temp ${s.internalTemperatureC}°C • ${s.storageDurationDays}d`,
    date: s.date,
    score: Math.round(s.fqiScore || 82),
    status: s.isGood || (s.overallQuality?.includes('Lactic') ? 'Good' : 'Moderate'),
    raw: s,
    icon: Layers,
    color: 'teal',
    onClick: () => setSelectedReportTest({ type: 'Silage', data: s }),
  }));

  const otherItems = [
    ...milkRecords.map((m) => ({
      id: `hist-m-${m.id}`,
      type: 'Milk' as const,
      title: `${m.quantityLiters} L logged (${m.shift})`,
      subtitle: `${m.animalName} • Fat ${m.fatPercent || 4.5}%`,
      date: m.date,
      score: null,
      status: 'Good' as const,
      raw: m,
      icon: Milk,
      color: 'blue',
      onClick: () => navigate('milk'),
    })),
    ...healthAlerts.map((h) => ({
      id: `hist-h-${h.id}`,
      type: 'Health' as const,
      title: h.title,
      subtitle: `${h.animalName} (${h.animalTag})`,
      date: h.timestamp.split('T')[0],
      score: null,
      status: h.severity === 'critical' ? 'Poor' as const : 'Moderate' as const,
      raw: h,
      icon: Stethoscope,
      color: 'rose',
      onClick: () => navigate('health'),
    })),
  ];

  const unifiedList = [...feedItems, ...silageItems, ...otherItems].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const filtered = unifiedList.filter((item) => {
    const matchCat = category === 'All' || item.type === category;
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const getEmptyStateConfig = () => {
    switch (category) {
      case 'Milk':
        return {
          title: t.noMilkRecordsYet || 'No milk records yet',
          desc: 'Track daily morning and evening milk production for your cattle.',
          ctaText: t.recordMilk || 'Record Milk',
          action: () => navigate('milk'),
          icon: Milk,
          color: 'blue',
        };
      case 'Feed':
        return {
          title: t.noFeedRecordsYet || 'No feed quality tests yet',
          desc: 'Test dry matter, protein, and visual mould risk for cattle feed.',
          ctaText: t.testFeedQuality || 'Test Feed Quality',
          action: () => navigate('rapid-test'),
          icon: Wheat,
          color: 'emerald',
        };
      case 'Silage':
        return {
          title: t.noSilageRecordsYet || 'No silage quality tests yet',
          desc: 'Test pH acidity, FQI score, and fermentation quality for silage.',
          ctaText: t.testSilageQuality || 'Test Silage Quality',
          action: () => navigate('rapid-test'),
          icon: Layers,
          color: 'teal',
        };
      case 'Health':
        return {
          title: 'No health records yet',
          desc: 'Screen cattle for clinical symptoms, lesions, and disease alerts.',
          ctaText: t.diseaseCheck || 'Start Disease Screening',
          action: () => navigate('health'),
          icon: Stethoscope,
          color: 'rose',
        };
      case 'All':
      default:
        return {
          title: t.noTestsYet || 'No records yet',
          desc: t.noTestsYetDesc || 'Your feed tests, silage tests, milk logs, and health screenings will appear here.',
          ctaText: t.testFeedSilageCTA || t.testFeedQuality || 'Start Quality Test',
          action: () => navigate('rapid-test'),
          icon: History,
          color: 'emerald',
        };
    }
  };

  const emptyConfig = getEmptyStateConfig();
  const EmptyIcon = emptyConfig.icon;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
      <MobileHeader
        showBack={true}
        title={t.testHistory || 'Test & Quality History'}
        subtitle="Audit Log of Quality Tests & Operations"
      />

      <main className="p-4 sm:p-5 space-y-4 pb-20 animate-fadeIn">
        
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search feed, silage, milk, or health records..."
            className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          />
          <Search size={15} className="absolute left-3 top-3 text-slate-400" />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-xs font-bold">
          {(['All', 'Feed', 'Silage', 'Milk', 'Health'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition active:scale-95 ${
                category === cat
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {cat === 'All' ? 'All Records' : cat === 'Feed' ? '🌾 Feed Tests' : cat === 'Silage' ? '🌽 Silage Tests' : cat === 'Milk' ? '🥛 Milk Logs' : '🩺 Health Records'}
            </button>
          ))}
        </div>

        {/* Records List */}
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((item) => {
              const Icon = item.icon;
              const isTestItem = item.type === 'Feed' || item.type === 'Silage';

              return (
                <div
                  key={item.id}
                  onClick={item.onClick}
                  className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card-soft hover:shadow-card-hover cursor-pointer active:scale-[0.98] transition space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                        item.type === 'Feed'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                          : item.type === 'Silage'
                          ? 'bg-teal-100 dark:bg-teal-950 text-teal-600'
                          : item.type === 'Milk'
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-600'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-600'
                      }`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                            item.type === 'Feed'
                              ? 'text-emerald-600'
                              : item.type === 'Silage'
                              ? 'text-teal-600'
                              : item.type === 'Milk'
                              ? 'text-blue-600'
                              : 'text-rose-600'
                          }`}>
                            {item.type}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatDate(item.date)}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-xs text-slate-900 dark:text-white leading-tight">
                          {item.title}
                        </h4>
                      </div>
                    </div>

                    {isTestItem && item.score !== null ? (
                      <div className="text-right">
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {item.score}/100
                        </span>
                        <span className={`block text-[9px] font-extrabold px-2 py-0.5 rounded-full mt-0.5 ${
                          item.status === 'Good'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : item.status === 'Moderate'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {item.status === 'Good' ? '🟢 GOOD' : item.status === 'Moderate' ? '🟡 CAUTION' : '🔴 UNSAFE'}
                        </span>
                      </div>
                    ) : item.type === 'Health' ? (
                      <div className="text-right">
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                          (item.raw as any)?.severity === 'critical'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : (item.raw as any)?.severity === 'high'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                        }`}>
                          {((item.raw as any)?.severity || 'HEALTH').toUpperCase()}
                        </span>
                      </div>
                    ) : (
                      <ChevronRight size={16} className="text-slate-400 mt-1" />
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                    <span className="text-slate-500 truncate max-w-[220px]">{item.subtitle}</span>
                    {isTestItem && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                        <FileText size={11} /> View Report
                      </span>
                    )}
                    {item.type === 'Health' && (
                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
                        View Details <ChevronRight size={11} />
                      </span>
                    )}
                    {item.type === 'Milk' && (
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-0.5">
                        Milk Log <ChevronRight size={11} />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-3 shadow-sm">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${
              emptyConfig.color === 'blue'
                ? 'bg-blue-50 dark:bg-blue-950 text-blue-600'
                : emptyConfig.color === 'rose'
                ? 'bg-rose-50 dark:bg-rose-950 text-rose-600'
                : emptyConfig.color === 'teal'
                ? 'bg-teal-50 dark:bg-teal-950 text-teal-600'
                : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600'
            }`}>
              <EmptyIcon size={24} />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {emptyConfig.title}
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                {emptyConfig.desc}
              </p>
            </div>
            <button
              type="button"
              onClick={emptyConfig.action}
              className={`py-2.5 px-4 rounded-xl text-white font-bold text-xs shadow-sm inline-flex items-center gap-1.5 active:scale-95 transition ${
                emptyConfig.color === 'blue'
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                  : emptyConfig.color === 'rose'
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                  : emptyConfig.color === 'teal'
                  ? 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
              }`}
            >
              <Plus size={14} />
              <span>{emptyConfig.ctaText}</span>
            </button>
          </div>
        )}

      </main>

      <BottomNavigation />

      {/* Test Report Modal */}
      {selectedReportTest && (
        <TestReportModal
          isOpen={!!selectedReportTest}
          onClose={() => setSelectedReportTest(null)}
          testType={selectedReportTest.type}
          result={selectedReportTest.data}
        />
      )}
    </div>
  );
};
