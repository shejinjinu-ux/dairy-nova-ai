import React, { useState } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { MobileHeader } from '../../components/common/MobileHeader';
import { BottomNavigation } from '../../components/common/BottomNavigation';
import { AnimalCard } from '../../components/animals/AnimalCard';
import { AddAnimalModal } from '../../components/animals/AddAnimalModal';
import { EmptyState } from '../../components/common/FeedbackStates';
import { AnimalType, HealthStatus } from '../../types';
import { Search, Plus, Filter, ArrowUpDown, Layers, Milk } from 'lucide-react';

export const AnimalsScreen: React.FC = () => {
  const { animals, navigate, addAnimal } = useAppData();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'All' | AnimalType>('All');
  const [selectedHealth, setSelectedHealth] = useState<'All' | HealthStatus>('All');
  const [sortBy, setSortBy] = useState<'tag' | 'milk' | 'age'>('tag');
  const [isAddAnimalOpen, setIsAddAnimalOpen] = useState<boolean>(false);

  // Filtered and sorted animals
  const filteredAnimals = animals
    .filter((a) => {
      const matchSearch =
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.tagId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.breed.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = selectedType === 'All' || a.type === selectedType;
      const matchHealth = selectedHealth === 'All' || a.healthStatus === selectedHealth;
      return matchSearch && matchType && matchHealth;
    })
    .sort((a, b) => {
      if (sortBy === 'milk') return b.dailyMilkYieldL - a.dailyMilkYieldL;
      if (sortBy === 'age') return b.ageYears * 12 + b.ageMonths - (a.ageYears * 12 + a.ageMonths);
      return a.tagId.localeCompare(b.tagId);
    });

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 relative">
      <MobileHeader title={t.navAnimals} subtitle={`${animals.length} registered herd animals`} />

      <main className="p-4 sm:p-5 space-y-3.5 pb-24 animate-fadeIn">
        
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Tag ID, Name, or Breed (e.g. Gir, TAG-101)..."
            className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-dairy-500 shadow-sm"
          />
          <Search size={15} className="absolute left-3 top-3 text-slate-400" />
        </div>

        {/* Filters: Animal Type Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {(['All', 'Cow', 'Buffalo'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition active:scale-95 ${
                selectedType === type
                  ? 'bg-dairy-600 text-white shadow-sm shadow-dairy-600/30'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {type === 'All' ? 'All Cattle' : type === 'Cow' ? '🐄 Cows' : '🐃 Buffaloes'}
            </button>
          ))}

          {/* Health Status Filters */}
          {(['All', 'Healthy', 'Needs Attention', 'Critical Alert'] as const).map((h) => {
            if (h === 'All') return null;
            return (
              <button
                key={h}
                type="button"
                onClick={() => setSelectedHealth(selectedHealth === h ? 'All' : h)}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap transition active:scale-95 ${
                  selectedHealth === h
                    ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                    : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {h}
              </button>
            );
          })}
        </div>

        {/* Sorting Row & Result Count */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span className="font-semibold">
            Showing {filteredAnimals.length} of {animals.length} animals
          </span>

          <div className="flex items-center gap-1">
            <ArrowUpDown size={12} className="text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="tag">Sort: Tag ID</option>
              <option value="milk">Sort: Milk Yield</option>
              <option value="age">Sort: Age</option>
            </select>
          </div>
        </div>

        {/* Animals List */}
        {filteredAnimals.length > 0 ? (
          <div className="space-y-3">
            {filteredAnimals.map((animal) => (
              <AnimalCard
                key={animal.id}
                animal={animal}
                onClick={() => navigate('animal-details', { animalId: animal.id })}
                onAskAI={(a) => navigate('ai-chat', { chatAnimal: a })}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Layers}
            title="No Animals Found"
            description="Try changing your search keywords or filter settings."
            actionLabel="Clear Filters"
            onAction={() => {
              setSearchQuery('');
              setSelectedType('All');
              setSelectedHealth('All');
            }}
          />
        )}

      </main>

      {/* Floating Action Button (FAB) for Add Animal */}
      <button
        onClick={() => setIsAddAnimalOpen(true)}
        className="fixed sm:absolute bottom-20 right-5 w-14 h-14 rounded-full bg-gradient-to-tr from-dairy-600 to-teal-500 text-white shadow-xl shadow-dairy-600/40 flex items-center justify-center active:scale-95 transition-all hover:scale-105 z-30 ring-4 ring-white dark:ring-slate-900"
        title="Add Animal"
        aria-label="Add new animal"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      <BottomNavigation />

      {/* Add Animal Modal */}
      <AddAnimalModal
        isOpen={isAddAnimalOpen}
        onClose={() => setIsAddAnimalOpen(false)}
        onAnimalAdded={addAnimal}
      />

    </div>
  );
};
