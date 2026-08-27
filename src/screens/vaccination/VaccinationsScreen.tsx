import React, { useState } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { VaccinationRecord, VaccinationStatus } from '../../types';
import { MobileHeader } from '../../components/common/MobileHeader';
import { BottomNavigation } from '../../components/common/BottomNavigation';
import { StatusBadge } from '../../components/common/StatusBadge';
import { MetricCard } from '../../components/common/MetricCard';
import { EmptyState } from '../../components/common/FeedbackStates';
import { formatDate } from '../../utils/formatters';
import {
  Syringe,
  CheckCircle2,
  Clock,
  AlertOctagon,
  Calendar,
  Search,
  Check,
  X,
  Plus,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const VaccinationsScreen: React.FC = () => {
  const { vaccinations, animals, navigate, markVaccinated } = useAppData();

  const [search, setSearch] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<'All' | VaccinationStatus>('All');
  
  // Mark vaccinated modal
  const [selectedVacToMark, setSelectedVacToMark] = useState<VaccinationRecord | null>(null);
  const [vetName, setVetName] = useState<string>('Dr. S. Sundaram (Veterinary Surgeon)');
  const [vetNotes, setVetNotes] = useState<string>('Standard intramuscular booster administered.');

  const upcomingCount = vaccinations.filter((v) => v.status === 'Upcoming').length;
  const dueCount = vaccinations.filter((v) => v.status === 'Due').length;
  const overdueCount = vaccinations.filter((v) => v.status === 'Overdue').length;
  const completedCount = vaccinations.filter((v) => v.status === 'Completed').length;

  const filtered = vaccinations.filter((v) => {
    const matchSearch =
      v.animalName.toLowerCase().includes(search.toLowerCase()) ||
      v.animalTag.toLowerCase().includes(search.toLowerCase()) ||
      v.diseaseName.toLowerCase().includes(search.toLowerCase()) ||
      v.vaccineName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = selectedStatus === 'All' || v.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const handleConfirmMarkVaccinated = () => {
    if (!selectedVacToMark) return;
    markVaccinated(selectedVacToMark.id, vetName, vetNotes);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#16a34a', '#0d9488', '#f59e0b'],
    });
    setSelectedVacToMark(null);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
      <MobileHeader showBack={true} title="Vaccinations Schedule" subtitle="Herd Immunization Protocol" />

      <main className="p-4 sm:p-5 space-y-4 pb-20 animate-fadeIn">
        
        {/* KPI Counter Grid */}
        <div className="grid grid-cols-4 gap-1.5 text-center">
          <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold block">Upcoming</span>
            <span className="text-base font-extrabold text-amber-900 dark:text-amber-200">{upcomingCount}</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900">
            <span className="text-[10px] text-teal-700 dark:text-teal-400 font-bold block">Due</span>
            <span className="text-base font-extrabold text-teal-900 dark:text-teal-200">{dueCount}</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
            <span className="text-[10px] text-rose-700 dark:text-rose-400 font-bold block">Overdue</span>
            <span className="text-base font-extrabold text-rose-900 dark:text-rose-200">{overdueCount}</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block">Done</span>
            <span className="text-base font-extrabold text-emerald-900 dark:text-emerald-200">{completedCount}</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Disease, Vaccine, or Cow Tag..."
            className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-dairy-500 shadow-sm"
          />
          <Search size={15} className="absolute left-3 top-3 text-slate-400" />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {(['All', 'Due', 'Overdue', 'Upcoming', 'Completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition active:scale-95 ${
                selectedStatus === st
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {st === 'All' ? 'All Vaccines' : st}
            </button>
          ))}
        </div>

        {/* Vaccination Records List */}
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((vac) => {
              const isCompleted = vac.status === 'Completed';

              return (
                <div
                  key={vac.id}
                  className={`p-4 rounded-3xl border transition-all duration-200 shadow-card-soft space-y-3 ${
                    isCompleted
                      ? 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 opacity-80'
                      : vac.status === 'Overdue'
                      ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/80 px-2 py-0.5 rounded-md">
                          {vac.animalTag}
                        </span>
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                          {vac.animalName}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{vac.diseaseName}</h4>
                      <p className="text-xs text-slate-500">{vac.vaccineName} • Dose #{vac.doseNumber}</p>
                    </div>

                    <StatusBadge status={vac.status} size="sm" />
                  </div>

                  {/* Schedule Details */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/60 text-xs space-y-1 text-slate-600 dark:text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Calendar size={12} /> Scheduled Date:
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDate(vac.scheduledDate)}</span>
                    </div>

                    {vac.completedDate && (
                      <div className="flex items-center justify-between text-emerald-600">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 size={12} /> Administered Date:
                        </span>
                        <span className="font-semibold">{formatDate(vac.completedDate)}</span>
                      </div>
                    )}

                    {vac.administeredBy && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Administered By:</span>
                        <span className="font-medium truncate max-w-[150px]">{vac.administeredBy}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <button
                      onClick={() => navigate('animal-details', { animalId: vac.animalId })}
                      className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
                    >
                      View Animal Profile
                    </button>

                    {!isCompleted && (
                      <button
                        onClick={() => setSelectedVacToMark(vac)}
                        className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm shadow-emerald-600/30 active:scale-95 transition"
                      >
                        <Check size={14} /> Mark Vaccinated
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Syringe}
            title="No Vaccination Records Found"
            description="All scheduled vaccine protocols for this filter are up to date."
          />
        )}

      </main>

      <BottomNavigation />

      {/* Mark Vaccinated Modal */}
      {selectedVacToMark && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Record Vaccine Administration
              </h3>
              <button
                onClick={() => setSelectedVacToMark(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs">
              <span className="font-bold text-slate-900 dark:text-white block">
                {selectedVacToMark.diseaseName}
              </span>
              <span className="text-[11px] text-slate-600 dark:text-slate-300">
                Animal: {selectedVacToMark.animalName} ({selectedVacToMark.animalTag})
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Administering Veterinarian / Officer
                </label>
                <input
                  type="text"
                  value={vetName}
                  onChange={(e) => setVetName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Clinical Notes / Batch Number
                </label>
                <input
                  type="text"
                  value={vetNotes}
                  onChange={(e) => setVetNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedVacToMark(null)}
                className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmMarkVaccinated}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1"
              >
                <Check size={14} /> Confirm
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
