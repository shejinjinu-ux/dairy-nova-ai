import React, { useState, useRef } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { BREEDS_DATA } from '../../mocks/mockData';
import { BreedInfo, BreedPredictionResponse } from '../../types';
import { aiApi } from '../../services/api/aiApi';
import { MobileHeader } from '../../components/common/MobileHeader';
import { BottomNavigation } from '../../components/common/BottomNavigation';
import { SourceTag } from '../../components/common/SourceTag';
import {
  Search,
  Sparkles,
  ChevronRight,
  Layers,
  ArrowRight,
  Upload,
  Camera,
  Loader2,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

export const BreedsScreen: React.FC = () => {
  const { navigate } = useAppData();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'All' | 'Cow' | 'Buffalo'>('All');
  const [showBreedAIScreening, setShowBreedAIScreening] = useState<boolean>(false);

  // AI Screening States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isClassifying, setIsClassifying] = useState<boolean>(false);
  const [breedResult, setBreedResult] = useState<BreedPredictionResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const filtered = BREEDS_DATA.filter((b) => {
    const matchSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.nativeRegion.toLowerCase().includes(search.toLowerCase());
    const matchType = selectedType === 'All' || b.animalType === selectedType;
    return matchSearch && matchType;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setErrorMessage('');
      setBreedResult(null);
    }
  };

  const handleRunBreedClassification = async () => {
    if (!selectedFile && !previewUrl) {
      setErrorMessage('Please select or capture a photo of the cattle.');
      return;
    }
    setErrorMessage('');
    setIsClassifying(true);
    try {
      const res = await aiApi.screenBreed(selectedFile || previewUrl);
      setBreedResult(res);
      setIsClassifying(false);
    } catch (err: any) {
      setIsClassifying(false);
      setErrorMessage(err.message || 'Breed identification encountered an error. Please try uploading a clearer image.');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
      <MobileHeader showBack={true} title={t.breedCatalog || 'Dairy Breeds Catalog'} subtitle={t.indigenousCrossbred || 'Indigenous & Crossbred Genetics'} />

      <main className="p-4 sm:p-5 space-y-4 pb-20 animate-fadeIn">
        
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search breeds (e.g. Gir, Murrah, Sahiwal)..."
            className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-dairy-500 shadow-sm"
          />
          <Search size={15} className="absolute left-3 top-3 text-slate-400" />
        </div>

        {/* Type Filter Chips */}
        <div className="flex items-center gap-2">
          {(['All', 'Cow', 'Buffalo'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-bold transition active:scale-95 flex items-center gap-1.5 ${
                selectedType === type
                  ? 'bg-dairy-600 text-white shadow-sm shadow-dairy-600/30'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {type === 'All' ? (t.allBreeds || 'All Breeds') : type === 'Cow' ? `🐄 ${t.indigenousCows || 'Indigenous Cows'}` : `🐃 ${t.dairyBuffaloes || 'Dairy Buffaloes'}`}
            </button>
          ))}
        </div>

        {/* AI Breed Screening Tool Banner */}
        <div className="p-4 rounded-3xl bg-gradient-to-r from-teal-900 via-teal-950 to-slate-950 text-white border border-teal-700/50 shadow-md space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-xs flex items-center gap-1.5 text-teal-300">
              <Sparkles size={14} /> {t.identifyBreedFromPhoto || 'Identify Cattle Breed from Photo'}
            </span>
            <SourceTag source="AI Screening" />
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Upload an image to run live inference across 41 registered Indian cattle and buffalo breeds using FastAPI ConvNeXt-Tiny.
          </p>
          <button
            onClick={() => setShowBreedAIScreening(!showBreedAIScreening)}
            className="py-2.5 px-3 min-h-[40px] rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 active:scale-95 transition"
          >
            {showBreedAIScreening ? 'Close AI Screening' : 'Launch AI Breed Screening'} <ArrowRight size={13} />
          </button>
        </div>

        {/* AI Breed Screening Interactive Drawer */}
        {showBreedAIScreening && (
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-teal-300 dark:border-teal-800 space-y-3 animate-fadeIn text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 dark:text-white">FastAPI ConvNeXt-Tiny Breed Classifier</h4>
              <span className="text-[10px] font-bold text-teal-600 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded">
                41 Indian Breeds
              </span>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Image Preview & Upload */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800">
              <img src={previewUrl} alt="Cattle Breed Target" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-2.5">
                <span className="text-white text-[11px] font-medium truncate">
                  {selectedFile ? selectedFile.name : 'Target Cattle Image'}
                </span>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 px-3 min-h-[40px] rounded-xl bg-dairy-50 hover:bg-dairy-100 dark:bg-dairy-950/60 text-dairy-800 dark:text-dairy-200 border border-dairy-200 dark:border-dairy-800 font-bold flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <Upload size={14} /> Select Photo
              </button>
              <button
                type="button"
                onClick={handleRunBreedClassification}
                disabled={isClassifying}
                className="py-2.5 px-3 min-h-[40px] rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold shadow-md shadow-teal-600/30 flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                {isClassifying ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Identify Breed</span>
                    <Sparkles size={14} />
                  </>
                )}
              </button>
            </div>

            {/* Real Classification Result View */}
            {breedResult && (
              <div className="space-y-3 pt-2 animate-fadeIn">
                <div
                  className={`p-3.5 rounded-2xl border space-y-1.5 ${
                    breedResult.breed_status === 'identified'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                      : 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-sm font-black flex items-center gap-1.5">
                      {breedResult.breed_status === 'identified' ? (
                        <CheckCircle2 size={16} className="text-emerald-600" />
                      ) : (
                        <HelpCircle size={16} className="text-amber-600" />
                      )}
                      <span>
                        {breedResult.predicted_breed
                          ? `Identified: ${breedResult.predicted_breed.replace(/_/g, ' ')}`
                          : 'Breed Classification Uncertain'}
                      </span>
                    </strong>
                    <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-white/80 dark:bg-slate-900/80 shadow-xs">
                      {breedResult.confidence_percentage.toFixed(1)}% Match
                    </span>
                  </div>

                  {breedResult.recommendation && (
                    <p className="text-[11px] leading-relaxed pt-1">
                      💡 {breedResult.recommendation}
                    </p>
                  )}
                </div>

                {/* Top 5 Ranked Probabilities */}
                {breedResult.top_5_predictions && breedResult.top_5_predictions.length > 0 && (
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Top Predicted Breeds (ConvNeXt-Tiny)
                    </span>
                    <div className="space-y-1.5">
                      {breedResult.top_5_predictions.map((p, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-slate-800 dark:text-slate-200">
                              {idx + 1}. {p.breed.replace(/_/g, ' ')}
                            </span>
                            <span className="text-teal-600 dark:text-teal-400">
                              {p.confidence_percentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-teal-600 rounded-full"
                              style={{ width: `${Math.max(4, Math.min(100, p.confidence_percentage))}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Breeds List */}
        <div className="space-y-3">
          {filtered.map((breed) => (
            <div
              key={breed.id}
              onClick={() => navigate('breed-details', { breedId: breed.id })}
              className="p-3.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card-soft hover:shadow-md transition flex items-center justify-between cursor-pointer active:scale-98 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                  <img src={breed.imageUrl} alt={breed.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-dairy-600 transition-colors">
                    {breed.name}
                  </h4>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    Origin: {breed.nativeRegion}
                  </span>
                  <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 block">
                    Avg Yield: {breed.avgDailyMilkYield} • Fat: {breed.fatPercentageRange}
                  </span>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-400 group-hover:text-dairy-600 transition-colors" />
            </div>
          ))}
        </div>

      </main>

      <BottomNavigation />
    </div>
  );
};

