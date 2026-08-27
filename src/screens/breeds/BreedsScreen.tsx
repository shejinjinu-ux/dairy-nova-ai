import React, { useState } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { BREEDS_DATA } from '../../mocks/mockData';
import { BreedInfo } from '../../types';
import { MobileHeader } from '../../components/common/MobileHeader';
import { BottomNavigation } from '../../components/common/BottomNavigation';
import { SourceTag } from '../../components/common/SourceTag';
import { Search, Sparkles, ChevronRight, Layers, ArrowRight, ShieldAlert } from 'lucide-react';

export const BreedsScreen: React.FC = () => {
  const { navigate } = useAppData();
  const [search, setSearch] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'All' | 'Cow' | 'Buffalo'>('All');
  const [showBreedAIScreening, setShowBreedAIScreening] = useState<boolean>(false);

  const filtered = BREEDS_DATA.filter((b) => {
    const matchSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.nativeRegion.toLowerCase().includes(search.toLowerCase());
    const matchType = selectedType === 'All' || b.animalType === selectedType;
    return matchSearch && matchType;
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
      <MobileHeader showBack={true} title="Dairy Breeds Catalog" subtitle="Indigenous & Crossbred Genetics" />

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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${
                selectedType === type
                  ? 'bg-dairy-600 text-white shadow-sm shadow-dairy-600/30'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {type === 'All' ? 'All Breeds' : type === 'Cow' ? '🐄 Indigenous Cows' : '🐃 Dairy Buffaloes'}
            </button>
          ))}
        </div>

        {/* AI Breed Screening Banner */}
        <div className="p-4 rounded-3xl bg-gradient-to-r from-teal-900 to-slate-900 text-white border border-teal-700/50 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-xs flex items-center gap-1.5 text-teal-300">
              <Sparkles size={14} /> AI Breed Identification Tool
            </span>
            <SourceTag source="AI Screening" />
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Upload an image to get preliminary phenotypic breed classification and yield estimation.
          </p>
          <button
            onClick={() => setShowBreedAIScreening(!showBreedAIScreening)}
            className="py-2 px-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1 active:scale-95 transition"
          >
            {showBreedAIScreening ? 'Close AI Screening' : 'Launch AI Breed Screening'} <ArrowRight size={13} />
          </button>
        </div>

        {/* AI Breed Screening Simulation View */}
        {showBreedAIScreening && (
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-teal-300 dark:border-teal-800 space-y-3 animate-fadeIn text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 dark:text-white">AI Breed Screening Result</h4>
              <span className="text-[10px] font-bold text-teal-600 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded">
                93% Match Confidence
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 space-y-1">
              <span className="font-bold text-teal-900 dark:text-teal-200 block text-sm">
                Estimated Breed: Gir Cow (Bos Indicus)
              </span>
              <p className="text-teal-800 dark:text-teal-300 text-[11px]">
                Phenotypic markers: Distinct convex skull dome, pendulous ears, loose dewlap, and A2 milk genetics.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
              <ShieldAlert size={14} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[10px] leading-tight">
                <strong>AI SCREENING NOTICE:</strong> Breed screening is preliminary estimation and should not replace pedigree DNA registration documents.
              </p>
            </div>
          </div>
        )}

        {/* Breeds Card List */}
        <div className="space-y-3">
          {filtered.map((b) => (
            <div
              key={b.id}
              onClick={() => navigate('breed-details', { breedId: b.id })}
              className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-card-soft hover:shadow-card-hover cursor-pointer active:scale-[0.98] transition group space-y-3"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-slate-100 ring-2 ring-slate-100 dark:ring-slate-800">
                  <img src={b.imageUrl} alt={b.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-teal-600 bg-teal-50 dark:bg-teal-950/80 px-2 py-0.5 rounded-md">
                      {b.animalType}
                    </span>
                    <span className="text-[10px] font-bold text-dairy-600 dark:text-dairy-400">
                      {b.avgDailyMilkYield}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                    {b.name}
                  </h3>
                  <p className="text-xs text-slate-400 truncate">{b.nativeRegion}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/50">
                  <span className="text-[10px] text-slate-400 block">Fat Range:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{b.fatPercentageRange}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/50">
                  <span className="text-[10px] text-slate-400 block">Climate Tolerance:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300 truncate block">{b.climateTolerance}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5 text-xs text-slate-400 font-bold group-hover:text-dairy-600 transition">
                <span>View Full Breed Profile</span>
                <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>

      </main>

      <BottomNavigation />
    </div>
  );
};
