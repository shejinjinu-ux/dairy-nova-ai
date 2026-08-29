import React, { useState } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { VaccinationRecord, VaccinationStatus } from '../../types';
import { MobileHeader } from '../../components/common/MobileHeader';
import { BottomNavigation } from '../../components/common/BottomNavigation';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/FeedbackStates';
import { formatDate } from '../../utils/formatters';
import {
  Syringe,
  CheckCircle2,
  Calendar,
  Search,
  Check,
  X,
  History,
  UserCheck,
  Clock,
  FileText,
} from 'lucide-react';

export const VaccinationsScreen: React.FC = () => {
  const { vaccinations, navigate, markVaccinated, animals } = useAppData();
  const { t } = useLanguage();

  // Active View Tab: 'schedule' or 'history'
  const [activeTab, setActiveTab] = useState<'schedule' | 'history'>('schedule');
  const [search, setSearch] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Upcoming' | 'Due' | 'Overdue'>('All');

  // Mark vaccinated modal state
  const [selectedVacToMark, setSelectedVacToMark] = useState<VaccinationRecord | null>(null);
  const [vetName, setVetName] = useState<string>('Dr. S. Sundaram (Veterinary Surgeon)');
  const [vetNotes, setVetNotes] = useState<string>('Standard intramuscular dose administered.');
  const [adminDate, setAdminDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [nextDueDate, setNextDueDate] = useState<string>('');

  const upcomingCount = vaccinations.filter((v) => v.status === 'Upcoming').length;
  const dueCount = vaccinations.filter((v) => v.status === 'Due').length;
  const overdueCount = vaccinations.filter((v) => v.status === 'Overdue').length;
  const completedCount = vaccinations.filter((v) => v.status === 'Completed').length;

  // Active Schedule records (Upcoming, Due, Overdue)
  const activeScheduleRecords = vaccinations.filter((v) => v.status !== 'Completed');

  // Completed History records
  const completedHistoryRecords = vaccinations.filter((v) => v.status === 'Completed');

  // Filter Active Schedule
  const filteredSchedule = activeScheduleRecords.filter((v) => {
    const matchSearch =
      v.animalName.toLowerCase().includes(search.toLowerCase()) ||
      v.animalTag.toLowerCase().includes(search.toLowerCase()) ||
      v.diseaseName.toLowerCase().includes(search.toLowerCase()) ||
      v.vaccineName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = selectedStatus === 'All' || v.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  // Filter Completed History
  const filteredHistory = completedHistoryRecords.filter((v) => {
    const query = search.toLowerCase();
    return (
      v.animalName.toLowerCase().includes(query) ||
      v.animalTag.toLowerCase().includes(query) ||
      v.diseaseName.toLowerCase().includes(query) ||
      v.vaccineName.toLowerCase().includes(query) ||
      (v.administeredBy && v.administeredBy.toLowerCase().includes(query)) ||
      (v.completedDate && v.completedDate.toLowerCase().includes(query))
    );
  });

  const handleOpenMarkModal = (vac: VaccinationRecord) => {
    setSelectedVacToMark(vac);
    setAdminDate(new Date().toISOString().split('T')[0]);
    const sixMonthsLater = new Date();
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
    setNextDueDate(sixMonthsLater.toISOString().split('T')[0]);
  };

  const handleConfirmMarkVaccinated = () => {
    if (!selectedVacToMark) return;
    markVaccinated(selectedVacToMark.id, vetName, vetNotes, nextDueDate || undefined);
    setSelectedVacToMark(null);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 min-h-full">
      <MobileHeader
        showBack={true}
        title={t.vaccinations || 'Herd Immunization & Vaccines'}
        subtitle="Vaccination Tracking & Completed History"
      />

      <main className="p-4 sm:p-5 space-y-4 pb-24 animate-fadeIn">
        
        {/* Main Tab Switcher */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('schedule')}
            className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 active:scale-95 ${
              activeTab === 'schedule'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Calendar size={14} className={activeTab === 'schedule' ? 'text-teal-600' : ''} />
            <span>Active Schedule ({activeScheduleRecords.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 active:scale-95 ${
              activeTab === 'history'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <History size={14} className={activeTab === 'history' ? 'text-emerald-600' : ''} />
            <span>Vaccination History ({completedCount})</span>
          </button>
        </div>

        {/* KPI Counter Grid */}
        <div className="grid grid-cols-4 gap-1.5 text-center">
          <div
            onClick={() => {
              setActiveTab('schedule');
              setSelectedStatus('Upcoming');
            }}
            className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 cursor-pointer active:scale-95 transition"
          >
            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold block">Upcoming</span>
            <span className="text-base font-extrabold text-amber-900 dark:text-amber-200">{upcomingCount}</span>
          </div>
          <div
            onClick={() => {
              setActiveTab('schedule');
              setSelectedStatus('Due');
            }}
            className="p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 cursor-pointer active:scale-95 transition"
          >
            <span className="text-[10px] text-teal-700 dark:text-teal-400 font-bold block">Due</span>
            <span className="text-base font-extrabold text-teal-900 dark:text-teal-200">{dueCount}</span>
          </div>
          <div
            onClick={() => {
              setActiveTab('schedule');
              setSelectedStatus('Overdue');
            }}
            className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 cursor-pointer active:scale-95 transition"
          >
            <span className="text-[10px] text-rose-700 dark:text-rose-400 font-bold block">Overdue</span>
            <span className="text-base font-extrabold text-rose-900 dark:text-rose-200">{overdueCount}</span>
          </div>
          <div
            onClick={() => setActiveTab('history')}
            className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 cursor-pointer active:scale-95 transition"
          >
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block">Done</span>
            <span className="text-base font-extrabold text-emerald-900 dark:text-emerald-200">{completedCount}</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              activeTab === 'schedule'
                ? 'Search by Disease, Vaccine, or Cattle Tag...'
                : 'Search completed history by Cattle, Tag, Vaccine, Disease, or Vet...'
            }
            className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-dairy-500 shadow-sm"
          />
          <Search size={15} className="absolute left-3 top-3 text-slate-400" />
        </div>

        {/* TAB 1: ACTIVE SCHEDULE */}
        {activeTab === 'schedule' && (
          <div className="space-y-3">
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {(['All', 'Due', 'Overdue', 'Upcoming'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition active:scale-95 ${
                    selectedStatus === st
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {st === 'All' ? 'All Active Vaccines' : st}
                </button>
              ))}
            </div>

            {filteredSchedule.length > 0 ? (
              <div className="space-y-3">
                {filteredSchedule.map((vac) => {
                  const animal = animals.find((a) => a.id === vac.animalId);

                  return (
                    <div
                      key={vac.id}
                      className={`p-4 rounded-3xl border transition-all duration-200 shadow-card-soft space-y-3 ${
                        vac.status === 'Overdue'
                          ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900'
                          : vac.status === 'Due'
                          ? 'bg-teal-50/60 dark:bg-teal-950/30 border-teal-200 dark:border-teal-900'
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
                            {animal?.breed && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                • {animal.breed}
                              </span>
                            )}
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
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {formatDate(vac.scheduledDate)}
                          </span>
                        </div>

                        {vac.notes && (
                          <div className="text-[11px] text-slate-500 pt-0.5 border-t border-slate-100 dark:border-slate-800">
                            <span>Note: {vac.notes}</span>
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

                        <button
                          onClick={() => handleOpenMarkModal(vac)}
                          className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm shadow-emerald-600/30 active:scale-95 transition"
                        >
                          <Check size={14} /> Vaccine Given / Completed
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={Syringe}
                title="No Scheduled Vaccines Found"
                description="All scheduled vaccine protocols for this filter are up to date."
              />
            )}
          </div>
        )}

        {/* TAB 2: VACCINATION HISTORY (ALREADY GIVEN VACCINES) */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-500">
                Total Administered: <strong>{completedHistoryRecords.length}</strong> records
              </span>
              <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full font-bold">
                ✓ Verified Records
              </span>
            </div>

            {filteredHistory.length > 0 ? (
              <div className="space-y-3">
                {filteredHistory.map((vac) => {
                  const animal = animals.find((a) => a.id === vac.animalId);

                  return (
                    <div
                      key={vac.id}
                      className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card-soft space-y-3 hover:border-emerald-500/50 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md">
                              {vac.animalTag}
                            </span>
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                              {vac.animalName}
                            </span>
                            {animal?.breed && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                ({animal.type} • {animal.breed})
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                            {vac.diseaseName}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {vac.vaccineName} • Dose #{vac.doseNumber}
                          </p>
                        </div>

                        <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle2 size={11} /> Completed
                        </span>
                      </div>

                      {/* Completed Details Audit Box */}
                      <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 flex items-center gap-1">
                            <CheckCircle2 size={12} className="text-emerald-600" /> Date Administered:
                          </span>
                          <span className="font-bold text-emerald-700 dark:text-emerald-300">
                            {formatDate(vac.completedDate || vac.scheduledDate)}
                          </span>
                        </div>

                        {vac.nextBoosterDate && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 flex items-center gap-1">
                              <Clock size={12} className="text-amber-500" /> Next Due Booster:
                            </span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {formatDate(vac.nextBoosterDate)}
                            </span>
                          </div>
                        )}

                        {vac.administeredBy && (
                          <div className="flex items-center justify-between pt-1 border-t border-emerald-200/50 dark:border-emerald-800/50">
                            <span className="text-slate-500 flex items-center gap-1">
                              <UserCheck size={12} className="text-teal-600" /> Administered By:
                            </span>
                            <span className="font-semibold truncate max-w-[180px]">
                              {vac.administeredBy}
                            </span>
                          </div>
                        )}

                        {vac.notes && (
                          <div className="text-[11px] text-slate-500 pt-1 border-t border-emerald-200/50 dark:border-emerald-800/50 flex items-start gap-1">
                            <FileText size={12} className="shrink-0 mt-0.5 text-slate-400" />
                            <span>Notes: {vac.notes}</span>
                          </div>
                        )}
                      </div>

                      {/* Action */}
                      <div className="flex items-center justify-between pt-1 text-xs">
                        <button
                          onClick={() => navigate('animal-details', { animalId: vac.animalId })}
                          className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
                        >
                          View Animal Profile
                        </button>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Record ID: {vac.id}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={History}
                title="No Vaccination History Found"
                description={
                  search.trim()
                    ? 'No completed vaccine records matched your search.'
                    : 'When you administer scheduled vaccines and mark them as given, they will be archived here permanently.'
                }
              />
            )}
          </div>
        )}

      </main>

      <BottomNavigation />

      {/* Mark Vaccinated / Completed Modal */}
      {selectedVacToMark && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Syringe size={16} className="text-emerald-600" /> Record Vaccine Administration
              </h3>
              <button
                onClick={() => setSelectedVacToMark(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
              <span className="font-bold text-slate-900 dark:text-white block">
                {selectedVacToMark.diseaseName} ({selectedVacToMark.vaccineName})
              </span>
              <span className="text-[11px] text-slate-600 dark:text-slate-300 block">
                Animal: <strong>{selectedVacToMark.animalName} ({selectedVacToMark.animalTag})</strong> • Dose #{selectedVacToMark.doseNumber}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Date Administered *
                </label>
                <input
                  type="date"
                  value={adminDate}
                  onChange={(e) => setAdminDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Administering Veterinarian / Officer *
                </label>
                <input
                  type="text"
                  value={vetName}
                  onChange={(e) => setVetName(e.target.value)}
                  placeholder="e.g. Dr. S. Sundaram (Veterinary Surgeon)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Next Due / Booster Date (Optional)
                </label>
                <input
                  type="date"
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Clinical Notes / Vaccine Batch Number
                </label>
                <textarea
                  rows={2}
                  value={vetNotes}
                  onChange={(e) => setVetNotes(e.target.value)}
                  placeholder="e.g. Batch #RO-2026-99, 2ml I/M right neck region..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs resize-none"
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
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1 active:scale-95 transition"
              >
                <Check size={14} /> Confirm & Save to History
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
