import React, { useState, useEffect } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { MobileHeader } from '../../components/common/MobileHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SourceTag } from '../../components/common/SourceTag';
import { EditAnimalModal } from '../../components/animals/EditAnimalModal';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { DiseaseScreeningModal } from '../../components/health/DiseaseScreeningModal';
import { RecordMilkModal } from '../../components/milk/RecordMilkModal';
import { FeedAnalysisModal } from '../../components/feed/FeedAnalysisModal';
import { feedApi } from '../../services/api/feedApi';
import { cattleApi } from '../../services/api/cattleApi';
import {
  NutritionRecommendationResponse,
  VaccinationRecommendation,
  MilkHistoryResponse,
} from '../../types';
import { formatDate, formatAnimalAge, getLactationDisplay } from '../../utils/formatters';
import {
  Sparkles,
  Milk,
  Stethoscope,
  Wheat,
  Syringe,
  Calendar,
  Edit2,
  Trash2,
  Activity,
  Heart,
  Layers,
  History,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Info,
  TrendingUp,
  Award,
  RefreshCw,
  Plus,
} from 'lucide-react';

export const AnimalDetailsScreen: React.FC = () => {
  const {
    animals,
    selectedAnimalId,
    healthAlerts,
    vaccinations,
    milkRecords,
    navigate,
    updateAnimal,
    deleteAnimal,
    addHealthAlert,
    recordMilk,
    addFeedAnalysis,
    addQRBatch,
    recordCalving,
  } = useAppData();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'vaccination' | 'feed' | 'milk' | 'history'>('overview');
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [isDiseaseCheckOpen, setIsDiseaseCheckOpen] = useState<boolean>(false);
  const [isRecordMilkOpen, setIsRecordMilkOpen] = useState<boolean>(false);
  const [isFeedCheckOpen, setIsFeedCheckOpen] = useState<boolean>(false);
  const [isCalvingModalOpen, setIsCalvingModalOpen] = useState<boolean>(false);

  // Calving form states
  const [newCalvingDate, setNewCalvingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newParity, setNewParity] = useState<number>(2);

  // Backend recommendations & history states
  const [backendVaccinations, setBackendVaccinations] = useState<VaccinationRecommendation[]>([]);
  const [isVaccinationsLoading, setIsVaccinationsLoading] = useState<boolean>(false);
  const [backendMilkHistory, setBackendMilkHistory] = useState<MilkHistoryResponse | null>(null);

  // Nutrition / Ration Formulation State
  const [rationData, setRationData] = useState<NutritionRecommendationResponse | null>(null);
  const [isRationLoading, setIsRationLoading] = useState<boolean>(false);
  const [rationError, setRationError] = useState<string>('');

  const animal = animals.find((a) => a.id === selectedAnimalId || a.tagId === selectedAnimalId) || animals[0];

  // Dynamic Lactation & DIM Calculation
  const calvingDateObj = animal?.calvingDate ? new Date(animal.calvingDate) : null;
  const calculatedDIM = animal?.daysInMilk !== undefined
    ? animal.daysInMilk
    : calvingDateObj
    ? Math.max(0, Math.floor((new Date().getTime() - calvingDateObj.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const currentStage = animal?.lactationStage === 'Dry'
    ? 'Dry'
    : calculatedDIM <= 100
    ? 'Early'
    : calculatedDIM <= 200
    ? 'Mid'
    : calculatedDIM <= 305
    ? 'Late'
    : 'Dry';

  // Fetch backend vaccinations
  useEffect(() => {
    if (activeTab === 'vaccination' && animal?.tagId) {
      setIsVaccinationsLoading(true);
      cattleApi
        .getVaccinations(animal.tagId)
        .then((res) => {
          if (res && Array.isArray(res)) {
            setBackendVaccinations(res);
          }
          setIsVaccinationsLoading(false);
        })
        .catch((err) => {
          console.warn('Could not fetch backend vaccination recommendations:', err);
          setIsVaccinationsLoading(false);
        });
    }
  }, [activeTab, animal?.tagId]);

  // Fetch backend milk history
  useEffect(() => {
    if (activeTab === 'milk' && animal?.tagId) {
      cattleApi
        .getMilkHistory(animal.tagId)
        .then((res) => {
          if (res && res.records) {
            setBackendMilkHistory(res);
          }
        })
        .catch((err) => {
          console.warn('Could not fetch backend milk history:', err);
        });
    }
  }, [activeTab, animal?.tagId, milkRecords.length]);

  // Fetch ration
  useEffect(() => {
    if (activeTab === 'feed' && animal) {
      setIsRationLoading(true);
      setRationError('');
      feedApi
        .recommendNutrition({
          species: animal.type,
          breed: animal.breed,
          body_weight_kg: animal.weightKg,
          daily_milk_yield_kg: animal.dailyMilkYieldL,
          milk_fat_percent: 4.0,
          lactation_stage: animal.lactationStage,
          pregnancy_status: animal.pregnancyStatus === 'Pregnant',
        })
        .then((res) => {
          setRationData(res);
          setIsRationLoading(false);
        })
        .catch((err: any) => {
          setRationError(err.message || 'Unable to fetch real-time ration from backend.');
          setIsRationLoading(false);
        });
    }
  }, [activeTab, animal?.id, animal?.weightKg, animal?.dailyMilkYieldL]);

  if (!animal) {
    return (
      <div className="flex-1 p-6 text-center">
        <p className="text-xs text-slate-500">Animal not found.</p>
      </div>
    );
  }

  const animalAlerts = healthAlerts.filter((h) => h.animalId === animal.id || h.animalTag === animal.tagId);
  const animalVaccinations = vaccinations.filter((v) => v.animalId === animal.id || v.animalTag === animal.tagId);
  const animalMilkRecords = milkRecords.filter((m) => m.animalId === animal.id || m.animalTag === animal.tagId);

  const handleRecordCalvingSubmit = () => {
    recordCalving(animal.tagId, newCalvingDate, newParity);
    setIsCalvingModalOpen(false);
  };

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
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsEditOpen(true)}
                    className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white flex items-center justify-center active:scale-95 transition"
                    title="Edit Animal"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => setIsDeleteOpen(true)}
                    className="w-8 h-8 rounded-xl bg-rose-600/80 hover:bg-rose-600 backdrop-blur-md text-white flex items-center justify-center active:scale-95 transition"
                    title="Delete Animal"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-white">{animal.name}</h2>
                  <StatusBadge status={animal.healthStatus} size="sm" />
                </div>
                <p className="text-xs text-slate-200 font-medium">
                  {animal.breed} • {formatAnimalAge(animal, true)} {animal.weightKg !== undefined ? `• ${animal.weightKg} kg` : ''}
                </p>
              </div>

            </div>
          </div>

          {/* Quick Action Matrix */}
          <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800 border-t border-slate-100 dark:border-slate-800 p-2 text-center text-xs">
            <button
              onClick={() => setIsDiseaseCheckOpen(true)}
              className="py-2 px-1 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition flex flex-col items-center gap-1 text-slate-700 dark:text-slate-300 font-bold"
            >
              <Stethoscope size={16} className="text-rose-500" />
              <span>{t.diseaseCheck || 'Health Check'}</span>
            </button>
            <button
              onClick={() => setIsRecordMilkOpen(true)}
              className="py-2 px-1 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition flex flex-col items-center gap-1 text-slate-700 dark:text-slate-300 font-bold"
            >
              <Milk size={16} className="text-dairy-600" />
              <span>{t.recordMilk || 'Log Milk'}</span>
            </button>
            <button
              onClick={() => setIsFeedCheckOpen(true)}
              className="py-2 px-1 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition flex flex-col items-center gap-1 text-slate-700 dark:text-slate-300 font-bold"
            >
              <Wheat size={16} className="text-amber-500" />
              <span>{t.feedCheck || 'Feed NIR'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { id: 'overview', label: t.breedOverview || 'Overview' },
            { id: 'health', label: `${t.navHealth || 'Health'} (${animalAlerts.length})` },
            { id: 'vaccination', label: `${t.vaccinations || 'Vaccines'} (${backendVaccinations.length || animalVaccinations.length})` },
            { id: 'feed', label: t.feedRecommendations || 'ICAR Ration Plan' },
            { id: 'milk', label: `${t.navMilk || 'Milk Logs'} (${animalMilkRecords.length})` },
            { id: 'history', label: t.history || 'History' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-3.5 rounded-2xl font-bold whitespace-nowrap transition active:scale-95 ${
                activeTab === tab.id
                  ? 'bg-dairy-600 text-white shadow-md shadow-dairy-600/30'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-3.5 animate-fadeIn">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card-soft space-y-1">
                <span className="text-[10px] text-slate-400 block font-medium">{t.dailyYield || 'Daily Milk Yield'}</span>
                <span className="text-xl font-extrabold text-dairy-600 dark:text-dairy-400">
                  {getLactationDisplay(animal).isLactating && animal.dailyMilkYieldL !== undefined ? `${animal.dailyMilkYieldL} L` : '—'}
                </span>
                <span className="text-[10px] text-slate-400 block">Lactation: {getLactationDisplay(animal).stageBadge}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card-soft space-y-1">
                <span className="text-[10px] text-slate-400 block font-medium">{t.weightKgLabel || 'Body Weight'}</span>
                <span className="text-xl font-extrabold text-slate-800 dark:text-slate-200">{animal.weightKg !== undefined ? `${animal.weightKg} kg` : '—'}</span>
                <span className="text-[10px] text-slate-400 block">{t.pregnancyStatus || 'Status'}: {animal.pregnancyStatus}</span>
              </div>
            </div>

            {/* 🥛🐄 Lactation & Days in Milk (DIM) Tracking Card */}
            {(() => {
              const lactInfo = getLactationDisplay(animal);
              return (
                <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card-soft space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center font-bold">
                        🥛
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Lactation & Calving Timeline</h3>
                        <span className="text-[10px] text-slate-400">Parity: {animal.parity || 1} • Calving: {animal.calvingDate || 'Not specified'}</span>
                      </div>
                    </div>
                    {lactInfo.stageBadge !== 'Calf' && animal.sex !== 'Male' && (
                      <button
                        type="button"
                        onClick={() => setIsCalvingModalOpen(true)}
                        className="px-2.5 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold text-[11px] border border-teal-200 dark:border-teal-800 flex items-center gap-1 active:scale-95 transition"
                      >
                        <Plus size={12} /> Record Calving
                      </button>
                    )}
                  </div>

                  {/* DIM Metric & Stage Progress Bar */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">Days in Milk (DIM)</span>
                      <span className="text-2xl font-black text-teal-600 dark:text-teal-400">
                        {lactInfo.dimValue !== null ? `${lactInfo.dimValue}` : '—'} {lactInfo.dimValue !== null && <span className="text-xs font-bold text-slate-400">Days</span>}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-medium block">Current Stage</span>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-black uppercase mt-1 ${
                        lactInfo.stageBadge === 'Early'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : lactInfo.stageBadge === 'Mid'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : lactInfo.stageBadge === 'Late'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {lactInfo.statusText}
                      </span>
                    </div>
                  </div>

                  {/* Timeline Progress Bar (0 to 305 days) */}
                  {lactInfo.isLactating && lactInfo.dimValue !== null && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                        <span>Early (0-100d)</span>
                        <span>Mid (101-200d)</span>
                        <span>Late (201-305d)</span>
                        <span>Dry (&gt;305d)</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                        <div
                          className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(5, (lactInfo.dimValue / 305) * 100))}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* IoT Telemetry Strip (Rumination & Activity without body temperature) */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white border border-slate-800 shadow-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                  <Activity size={14} className="text-teal-400" /> {t.sensorIntegration || 'Real-time Telemetry'}
                </span>
                <SourceTag source="Sensor Reading" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 block">{t.rumination || 'Rumination'}</span>
                  <span className="font-bold text-white text-base">{animal.ruminationMinutesPerDay || 480} min / day</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 block">{t.activityLevel || 'Activity'}</span>
                  <span className="font-bold text-emerald-400 text-base">{animal.activityLevel || 'Normal'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Health */}
        {activeTab === 'health' && (
          <div className="space-y-3 animate-fadeIn text-xs">
            {animalAlerts.length > 0 ? (
              animalAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card-soft space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-rose-600 dark:text-rose-400 text-sm block">
                        {alert.title || alert.possibleConcern}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{formatDate(alert.timestamp)}</span>
                    </div>
                    <StatusBadge status={alert.severity} size="sm" />
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    {alert.preliminaryGuidance || alert.veterinaryAdvice || alert.description}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-6 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 text-xs text-slate-500">
                <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-2" />
                No active health flags. All telemetry vitals are within normal range.
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Vaccination with 3-Tier Source-Backed Pricing */}
        {activeTab === 'vaccination' && (
          <div className="space-y-3 animate-fadeIn text-xs">
            {isVaccinationsLoading ? (
              <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <Loader2 size={24} className="animate-spin text-emerald-600 mx-auto" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Fetching personalized vaccine schedule with 3-tier price breakdown...
                </p>
              </div>
            ) : backendVaccinations.length > 0 ? (
              backendVaccinations.map((vac, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card-soft space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-black text-slate-900 dark:text-white">{vac.disease_target}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          vac.status === 'OVERDUE'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : vac.status === 'DUE'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          {vac.status}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 block mt-0.5">
                        {vac.recommended_vaccine}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Schedule: {vac.recommended_timing} • Next Due: {vac.next_due_date}
                      </span>
                    </div>
                  </div>

                  {/* 3-Tier Source-Backed Pricing Box */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      3-Tier Pricing & Government Scheme
                    </span>

                    {/* Tier 1: Farmer Cost */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Government Programme / Farmer Cost:</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                        {vac.farmer_cost_display || vac.price_detail?.farmer_cost_display || '₹0 (Free under NADCP)'}
                      </span>
                    </div>

                    {/* Tier 2: Procurement Price */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400">Government Procurement Price:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {vac.procurement_cost_display || vac.price_detail?.procurement_cost_display || '₹18.00 / dose'}
                      </span>
                    </div>

                    {/* Tier 3: Retail Price */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400">Private Retail Price:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 text-right text-[11px]">
                        {vac.retail_price_display || vac.price_detail?.retail_price_display || 'Retail price unavailable — check local veterinary pharmacy / Animal Husbandry Department.'}
                      </span>
                    </div>

                    {/* Source Citation & Link */}
                    {(vac.source_name || vac.price_detail?.source_name) && (
                      <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                        <span>
                          Source: {vac.source_name || vac.price_detail?.source_name} ({vac.source_date || vac.price_detail?.source_date || '2024-2025'})
                        </span>
                        {(vac.source_url || vac.price_detail?.source_url) && (
                          <a
                            href={vac.source_url || vac.price_detail?.source_url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 font-bold"
                          >
                            <span>Verify Source</span>
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Mandatory Veterinary Disclaimer */}
                  <p className="text-[10px] text-slate-400 italic">
                    {vac.disclaimer || 'Estimated information only. Consult a qualified veterinarian for diagnosis and vaccination decisions.'}
                  </p>
                </div>
              ))
            ) : animalVaccinations.length > 0 ? (
              animalVaccinations.map((vac) => (
                <div
                  key={vac.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card-soft flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{vac.diseaseName}</h4>
                    <span className="text-[10px] text-slate-400 block">{vac.vaccineName} • Dose {vac.doseNumber}</span>
                    <span className="text-[10px] text-slate-500 mt-1 block">Due: {formatDate(vac.scheduledDate)}</span>
                  </div>
                  <StatusBadge status={vac.status} size="sm" />
                </div>
              ))
            ) : (
              <div className="p-6 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 text-xs text-slate-500">
                No vaccination schedules recorded.
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Persistent Milk History & Logs */}
        {activeTab === 'milk' && (
          <div className="space-y-3 animate-fadeIn text-xs">
            {/* Backend Summary Box */}
            {backendMilkHistory && (
              <div className="p-4 rounded-3xl bg-gradient-to-br from-dairy-700 to-teal-800 text-white shadow-md space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-dairy-200">
                    Persistent Milk Production Record
                  </span>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                    {backendMilkHistory.total_records} Logs Recorded
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2 rounded-xl bg-white/10">
                    <span className="text-[9px] text-dairy-100 block">Average Yield</span>
                    <span className="text-base font-black">{backendMilkHistory.average_daily_yield_litres.toFixed(1)} L</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/10">
                    <span className="text-[9px] text-dairy-100 block">Highest Recorded</span>
                    <span className="text-base font-black">{backendMilkHistory.highest_recorded_yield_litres.toFixed(1)} L</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/10">
                    <span className="text-[9px] text-dairy-100 block">Lowest Recorded</span>
                    <span className="text-base font-black">{backendMilkHistory.lowest_recorded_yield_litres.toFixed(1)} L</span>
                  </div>
                </div>
              </div>
            )}

            {/* Individual Records */}
            {animalMilkRecords.length > 0 ? (
              animalMilkRecords.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card-soft flex items-center justify-between"
                >
                  <div>
                    <span className="text-[10px] text-slate-400 block">{formatDate(m.date)} • {m.shift} Shift</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{m.recordedBy}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-dairy-600">{m.quantityLiters} L</span>
                    {m.fatPercent && <span className="text-[10px] text-slate-400 block">Fat {m.fatPercent}%</span>}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 text-xs text-slate-500">
                No recent milk records. Tap "Log Milk" above to log a shift yield.
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Real ICAR-NIANP Feed & Ration Plan */}
        {activeTab === 'feed' && (
          <div className="space-y-3.5 animate-fadeIn text-xs">
            {isRationLoading ? (
              <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <Loader2 size={24} className="animate-spin text-dairy-600 mx-auto" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Calculating ICAR-NIANP Least-Cost Ration from FastAPI...
                </p>
              </div>
            ) : rationError ? (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle size={14} /> Optimization Error
                </p>
                <p className="text-[11px]">{rationError}</p>
              </div>
            ) : rationData ? (
              <div className="space-y-3">
                
                {/* Daily Cost & Summary Card */}
                <div className="p-4 rounded-3xl bg-gradient-to-br from-dairy-700 to-teal-900 text-white shadow-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-dairy-200">
                        ICAR Least-Cost Balanced Daily Ration
                      </span>
                      <h4 className="text-2xl font-black">
                        ₹{rationData.total_daily_cost_inr.toFixed(2)} <span className="text-xs font-normal text-dairy-200">/ animal / day</span>
                      </h4>
                      <span className="text-[11px] text-teal-100 font-semibold">
                        Optimized for {animal.weightKg ?? 400}kg • {animal.dailyMilkYieldL ?? 10} L/day Yield
                      </span>
                    </div>
                    <SourceTag source="AI Screening" />
                  </div>
                </div>

                {/* Requirements Summary */}
                {rationData.nutrient_requirements && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 block">DMI Target</span>
                      <span className="font-black text-slate-900 dark:text-white text-xs">
                        {rationData.nutrient_requirements.req_dmi_kg_per_day.toFixed(2)} kg
                      </span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 block">TDN Energy</span>
                      <span className="font-black text-slate-900 dark:text-white text-xs">
                        {rationData.nutrient_requirements.req_tdn_kg_per_day.toFixed(2)} kg
                      </span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 block">Crude Protein</span>
                      <span className="font-black text-teal-600 dark:text-teal-400 text-xs">
                        {rationData.nutrient_requirements.req_cp_g_per_day.toFixed(0)} g
                      </span>
                    </div>
                  </div>
                )}

                {/* Recommended Daily Ration Items */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                    <span>Daily Feed Quantities</span>
                    <span className="text-[10px] text-slate-400 font-normal">Fresh Weight Basis</span>
                  </h4>

                  <div className="space-y-2">
                    {rationData.recommended_ration.map((item) => (
                      <div
                        key={item.feed_id}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]"
                      >
                        <div>
                          <strong className="text-slate-900 dark:text-white block font-bold">
                            {item.feed_name}
                          </strong>
                          <span className="text-[10px] text-slate-400">
                            {item.feed_category} • ₹{item.cost_per_kg_inr}/kg
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-dairy-600 dark:text-dairy-400 text-xs block">
                            {item.quantity_kg_per_day >= 1
                              ? `${item.quantity_kg_per_day.toFixed(1)} kg`
                              : `${(item.quantity_kg_per_day * 1000).toFixed(0)} g`}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ₹{item.daily_cost_inr.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nutrient Balance Badges */}
                {rationData.nutrient_balance && (
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Nutrient Balance & Fulfillment
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      {Object.entries(rationData.nutrient_balance).map(([key, bal]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800"
                        >
                          <span className="capitalize text-slate-600 dark:text-slate-400">
                            {key.replace('_', ' ')}
                          </span>
                          <span
                            className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                              bal.status === 'Balanced'
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                                : bal.status === 'Surplus'
                                ? 'bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300'
                                : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                            }`}
                          >
                            {bal.percentage_fulfilled.toFixed(0)}% ({bal.status})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ) : null}
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

      {/* Record New Calving Modal */}
      {isCalvingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Record Calving Event</h3>
              <button
                type="button"
                onClick={() => setIsCalvingModalOpen(false)}
                className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Recording a new calving event will recalculate Days in Milk (DIM = 0) and transition {animal.name} into Early Lactation.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Calving Date *
                </label>
                <input
                  type="date"
                  value={newCalvingDate}
                  onChange={(e) => setNewCalvingDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Parity (Calving Number) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={newParity}
                  onChange={(e) => setNewParity(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCalvingModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRecordCalvingSubmit}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/30"
              >
                Confirm Calving
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        title="Delete Cattle Record"
        message={`Are you sure you want to remove ${animal.name} (${animal.tagId}) from your herd registry? This action cannot be undone.`}
        confirmLabel="Delete Cattle"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={() => {
          deleteAnimal(animal.id);
          setIsDeleteOpen(false);
          navigate('animals');
        }}
        onCancel={() => setIsDeleteOpen(false)}
      />

    </div>
  );
};
