import React, { useState } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { MobileHeader } from '../../components/common/MobileHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SourceTag } from '../../components/common/SourceTag';
import { EditAnimalModal } from '../../components/animals/EditAnimalModal';
import { DiseaseScreeningModal } from '../../components/health/DiseaseScreeningModal';
import { RecordMilkModal } from '../../components/milk/RecordMilkModal';
import { FeedAnalysisModal } from '../../components/feed/FeedAnalysisModal';
import { formatDate } from '../../utils/formatters';
import {
  Sparkles,
  Milk,
  Stethoscope,
  Wheat,
  Syringe,
  Calendar,
  Edit2,
  Activity,
  Heart,
  Thermometer,
  Layers,
  History,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';

export const AnimalDetailsScreen: React.FC = () => {
  const {
    animals,
    selectedAnimalId,
    healthAlerts,
    vaccinations,
    milkRecords,
    feedAnalyses,
    navigate,
    updateAnimal,
    addHealthAlert,
    recordMilk,
    addFeedAnalysis,
    addQRBatch,
  } = useAppData();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'vaccination' | 'feed' | 'milk' | 'history'>('overview');
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isDiseaseCheckOpen, setIsDiseaseCheckOpen] = useState<boolean>(false);
  const [isRecordMilkOpen, setIsRecordMilkOpen] = useState<boolean>(false);
  const [isFeedCheckOpen, setIsFeedCheckOpen] = useState<boolean>(false);

  const animal = animals.find((a) => a.id === selectedAnimalId) || animals[0];

  if (!animal) {
    return (
      <div className="flex-1 p-6 text-center">
        <p className="text-xs text-slate-500">Animal not found.</p>
      </div>
    );
  }

  // Related data
  const animalAlerts = healthAlerts.filter((h) => h.animalId === animal.id || h.animalTag === animal.tagId);
  const animalVaccinations = vaccinations.filter((v) => v.animalId === animal.id || v.animalTag === animal.tagId);
  const animalMilkRecords = milkRecords.filter((m) => m.animalId === animal.id || m.animalTag === animal.tagId);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
      <MobileHeader showBack={true} title={`${animal.name} (${animal.tagId})`} subtitle={`${animal.breed} • ${animal.type}`} />

      <main className="p-4 sm:p-5 space-y-4 pb-20 animate-fadeIn">
        
        {/* Animal Hero Card */}
        <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card-soft">
          {/* Portrait Banner */}
          <div className="relative aspect-video w-full bg-slate-950">
            <img src={animal.imageUrl} alt={animal.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex flex-col justify-between p-4">
              
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-white bg-teal-600/90 px-2.5 py-1 rounded-xl shadow-sm backdrop-blur-xs">
                  {animal.tagId}
                </span>
                <button
                  onClick={() => setIsEditOpen(true)}
                  className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white flex items-center justify-center active:scale-95 transition"
                  title="Edit Animal"
                >
                  <Edit2 size={14} />
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-white">{animal.name}</h2>
                  <StatusBadge status={animal.healthStatus} size="sm" />
                </div>
                <p className="text-xs text-slate-200 font-medium">
                  {animal.breed} • {animal.ageYears} Years {animal.ageMonths} Months • {animal.weightKg} kg
                </p>
              </div>

            </div>
          </div>

          {/* Quick Action Button Ribbon */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-around gap-1 text-[10px] font-bold">
            <button
              onClick={() => setIsDiseaseCheckOpen(true)}
              className="flex-1 py-2 px-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 flex flex-col items-center gap-1 text-slate-700 dark:text-slate-300 active:scale-95 transition"
            >
              <Stethoscope size={15} className="text-teal-600" />
              <span>Disease Check</span>
            </button>

            <button
              onClick={() => setIsFeedCheckOpen(true)}
              className="flex-1 py-2 px-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 flex flex-col items-center gap-1 text-slate-700 dark:text-slate-300 active:scale-95 transition"
            >
              <Wheat size={15} className="text-amber-600" />
              <span>Feed Check</span>
            </button>

            <button
              onClick={() => setIsRecordMilkOpen(true)}
              className="flex-1 py-2 px-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-dairy-500 flex flex-col items-center gap-1 text-slate-700 dark:text-slate-300 active:scale-95 transition"
            >
              <Milk size={15} className="text-dairy-600" />
              <span>Record Milk</span>
            </button>

            <button
              onClick={() => navigate('ai-chat', { chatAnimal: animal })}
              className="flex-1 py-2 px-1 rounded-xl bg-gradient-to-tr from-teal-50 to-dairy-50 dark:from-teal-950 dark:to-dairy-950 border border-teal-300 dark:border-teal-700 flex flex-col items-center gap-1 text-teal-800 dark:text-teal-200 active:scale-95 transition"
            >
              <Sparkles size={15} className="text-teal-600 animate-pulse" />
              <span>Ask AI</span>
            </button>
          </div>
        </div>

        {/* 6 Tabs Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 custom-scrollbar border-b border-slate-200 dark:border-slate-800 text-xs">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'health', label: `Health (${animalAlerts.length})` },
            { id: 'vaccination', label: `Vaccines (${animalVaccinations.length})` },
            { id: 'milk', label: `Milk (${animalMilkRecords.length})` },
            { id: 'feed', label: 'Feed & Ration' },
            { id: 'history', label: 'History' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 rounded-t-xl font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'border-b-2 border-dairy-600 text-dairy-700 dark:text-dairy-400 bg-dairy-50/50 dark:bg-dairy-950/40'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-3 animate-fadeIn text-xs">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block font-medium">Daily Milk Yield</span>
                <span className="text-base font-extrabold text-dairy-600 dark:text-dairy-400">{animal.dailyMilkYieldL} L/day</span>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block font-medium">Lactation Stage</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{animal.lactationStage} Stage</span>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block font-medium">Pregnancy Status</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{animal.pregnancyStatus}</span>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block font-medium">Body Temperature</span>
                <span className={`text-sm font-bold ${animal.temperatureC > 39.2 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                  {animal.temperatureC}°C
                </span>
              </div>
            </div>

            {/* AI Health Summary Card */}
            <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1">
                  <Sparkles size={13} className="text-teal-600" /> Dairy Nova AI Health Synthesis
                </span>
                <SourceTag source="AI Screening" />
              </div>
              <p className="text-[11px] text-teal-800 dark:text-teal-300 leading-relaxed">
                {animal.notes || 'Animal telemetry indicates steady metabolic balance and normal rumination.'}
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Health */}
        {activeTab === 'health' && (
          <div className="space-y-3 animate-fadeIn">
            {animalAlerts.length > 0 ? (
              animalAlerts.map((alert) => (
                <div key={alert.id} className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex items-start justify-between">
                    <h4 className="font-bold text-slate-900 dark:text-white">{alert.title}</h4>
                    <StatusBadge status={alert.severity === 'critical' ? 'Critical Alert' : 'Needs Attention'} size="sm" />
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">{alert.description}</p>
                  <p className="text-[11px] text-teal-700 dark:text-teal-300 font-medium">
                    <strong>Guidance:</strong> {alert.preliminaryGuidance}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-6 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 text-xs text-slate-500">
                <CheckCircle2 size={24} className="text-emerald-500 mx-auto mb-1" />
                No active health alerts for {animal.name}.
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Vaccination */}
        {activeTab === 'vaccination' && (
          <div className="space-y-2.5 animate-fadeIn text-xs">
            {animalVaccinations.map((vac) => (
              <div key={vac.id} className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{vac.diseaseName}</h4>
                  <p className="text-[11px] text-slate-400">{vac.vaccineName} • Dose {vac.doseNumber}</p>
                  <span className="text-[10px] text-slate-500 font-medium">Scheduled: {vac.scheduledDate}</span>
                </div>
                <StatusBadge status={vac.status} size="sm" />
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Milk */}
        {activeTab === 'milk' && (
          <div className="space-y-2.5 animate-fadeIn text-xs">
            {animalMilkRecords.length > 0 ? (
              animalMilkRecords.map((m) => (
                <div key={m.id} className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{m.shift} Shift</span>
                    <p className="text-[11px] text-slate-400">{m.date}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-dairy-600">{m.quantityLiters} L</span>
                    {m.fatPercent && <span className="text-[10px] text-slate-400 block">Fat {m.fatPercent}%</span>}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 text-xs text-slate-500">
                No recent milk records. Tap "Record Milk" above to log a shift yield.
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Feed & Ration */}
        {activeTab === 'feed' && (
          <div className="space-y-3 animate-fadeIn text-xs">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white">Recommended Daily Ration Plan</h4>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
                <li>• <strong>Green Fodder (Super Napier / Maize):</strong> 25 - 30 kg / day</li>
                <li>• <strong>Dry Roughage (Paddy Straw):</strong> 4 - 5 kg / day</li>
                <li>• <strong>Balanced Concentrate Pellets (22% CP):</strong> 3.5 kg / day</li>
                <li>• <strong>Chelated Mineral Mixture:</strong> 50 g / day</li>
                <li>• <strong>Fresh Drinking Water:</strong> Ad-libitum (70 - 90 L/day)</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 6: History */}
        {activeTab === 'history' && (
          <div className="space-y-2 animate-fadeIn text-xs">
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 block">{formatDate(animal.createdDate)}</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">Registered in Dairy Nova Herd Registry</p>
            </div>
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 block">{formatDate(animal.lastCheckDate)}</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">Routine Veterinary & Rumination Assessment Completed</p>
            </div>
          </div>
        )}

      </main>

      {/* Modals */}
      <EditAnimalModal
        animal={animal}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onAnimalUpdated={updateAnimal}
      />

      <DiseaseScreeningModal
        selectedAnimal={animal}
        isOpen={isDiseaseCheckOpen}
        onClose={() => setIsDiseaseCheckOpen(false)}
        onResultSaved={addHealthAlert}
        onOpenAIChat={(a) => navigate('ai-chat', { chatAnimal: a || animal })}
      />

      <RecordMilkModal
        animals={animals}
        preselectedAnimalId={animal.id}
        isOpen={isRecordMilkOpen}
        onClose={() => setIsRecordMilkOpen(false)}
        onMilkRecorded={recordMilk}
      />

      <FeedAnalysisModal
        isOpen={isFeedCheckOpen}
        onClose={() => setIsFeedCheckOpen(false)}
        onAnalysisSaved={addFeedAnalysis}
        onGenerateQRBatch={addQRBatch}
      />

    </div>
  );
};
