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
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Info,
} from 'lucide-react';

const COMMON_VACCINES = [
  { name: 'FMD Trivalent (O, A, Asia-1)', disease: 'Foot & Mouth Disease (FMD)', boosterMonths: 6 },
  { name: 'HS + BQ Combined Vaccine', disease: 'Haemorrhagic Septicaemia & Black Quarter', boosterMonths: 12 },
  { name: 'Anthrax Spore Vaccine', disease: 'Anthrax', boosterMonths: 12 },
  { name: 'Brucella abortus S19 Strain', disease: 'Brucellosis (Calfhood)', boosterMonths: 0 },
  { name: 'Theileria (Rakshavac-T)', disease: 'Bovine Theileriosis', boosterMonths: 12 },
  { name: 'Broad Spectrum Deworming (Albendazole)', disease: 'Internal Helminth Parasites', boosterMonths: 3 },
];

export const VaccinationsScreen: React.FC = () => {
  const {
    vaccinations,
    animals,
    navigate,
    markVaccinated,
    addVaccination,
    updateVaccination,
    deleteVaccination,
  } = useAppData();
  const { t } = useLanguage();

  // Active View Tab: 'schedule' or 'history'
  const [activeTab, setActiveTab] = useState<'schedule' | 'history'>('schedule');
  const [search, setSearch] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<'All' | VaccinationStatus>('All');

  // Modal states
  const [showAddEditModal, setShowAddEditModal] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<VaccinationRecord | null>(null);

  // Form fields
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>(animals[0]?.id || '');
  const [customAnimalTag, setCustomAnimalTag] = useState<string>('');
  const [customAnimalName, setCustomAnimalName] = useState<string>('');
  const [vaccineName, setVaccineName] = useState<string>('FMD Trivalent (O, A, Asia-1)');
  const [diseaseName, setDiseaseName] = useState<string>('Foot & Mouth Disease (FMD)');
  const [doseNumber, setDoseNumber] = useState<number>(1);
  const [scheduledDate, setScheduledDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [nextBoosterDate, setNextBoosterDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split('T')[0];
  });
  const [administeredBy, setAdministeringBy] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  // Delete Confirmation State
  const [recordToDelete, setRecordToDelete] = useState<VaccinationRecord | null>(null);

  // Mark vaccinated modal
  const [selectedVacToMark, setSelectedVacToMark] = useState<VaccinationRecord | null>(null);
  const [vetName, setVetName] = useState<string>('Dr. S. Sundaram (Veterinary Surgeon)');
  const [vetNotes, setVetNotes] = useState<string>('Standard intramuscular dose administered.');
  const [adminDate, setAdminDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [nextDueDate, setNextDueDate] = useState<string>('');

  // Auto calculate dynamic status helper
  const getDerivedStatus = (v: VaccinationRecord): VaccinationStatus => {
    if (v.status === 'Completed') return 'Completed';
    const today = new Date().toISOString().split('T')[0];
    if (v.scheduledDate < today) return 'Overdue';
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    const sevenDaysStr = sevenDaysLater.toISOString().split('T')[0];
    if (v.scheduledDate <= sevenDaysStr) return 'Due';
    return 'Upcoming';
  };

  const processedVaccinations = vaccinations.map((v) => ({
    ...v,
    status: v.status === 'Completed' ? ('Completed' as const) : getDerivedStatus(v),
  }));

  const upcomingCount = processedVaccinations.filter((v) => v.status === 'Upcoming').length;
  const dueCount = processedVaccinations.filter((v) => v.status === 'Due').length;
  const overdueCount = processedVaccinations.filter((v) => v.status === 'Overdue').length;
  const completedCount = processedVaccinations.filter((v) => v.status === 'Completed').length;

  const filtered = processedVaccinations.filter((v) => {
    const matchSearch =
      v.animalName.toLowerCase().includes(search.toLowerCase()) ||
      v.animalTag.toLowerCase().includes(search.toLowerCase()) ||
      v.diseaseName.toLowerCase().includes(search.toLowerCase()) ||
      v.vaccineName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = selectedStatus === 'All' || v.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setSelectedAnimalId(animals[0]?.id || '');
    setCustomAnimalTag('');
    setCustomAnimalName('');
    setVaccineName('FMD Trivalent (O, A, Asia-1)');
    setDiseaseName('Foot & Mouth Disease (FMD)');
    setDoseNumber(1);
    setScheduledDate(new Date().toISOString().split('T')[0]);
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    setNextBoosterDate(d.toISOString().split('T')[0]);
    setAdministeringBy('');
    setNotes('');
    setFormError('');
    setShowAddEditModal(true);
  };

  const handleOpenEdit = (record: VaccinationRecord) => {
    setEditingRecord(record);
    setSelectedAnimalId(record.animalId);
    setCustomAnimalTag(record.animalTag);
    setCustomAnimalName(record.animalName);
    setVaccineName(record.vaccineName);
    setDiseaseName(record.diseaseName);
    setDoseNumber(record.doseNumber || 1);
    setScheduledDate(record.scheduledDate);
    setNextBoosterDate(record.nextBoosterDate || '');
    setAdministeringBy(record.administeredBy || '');
    setNotes(record.notes || '');
    setFormError('');
    setShowAddEditModal(true);
  };

  const handleOpenMarkModal = (vac: VaccinationRecord) => {
    setSelectedVacToMark(vac);
    setAdminDate(new Date().toISOString().split('T')[0]);
    const sixMonthsLater = new Date();
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
    setNextDueDate(sixMonthsLater.toISOString().split('T')[0]);
  };

  const handleSelectVaccinePreset = (preset: typeof COMMON_VACCINES[0]) => {
    setVaccineName(preset.name);
    setDiseaseName(preset.disease);
    if (preset.boosterMonths > 0) {
      const d = new Date(scheduledDate || new Date().toISOString().split('T')[0]);
      d.setMonth(d.getMonth() + preset.boosterMonths);
      setNextBoosterDate(d.toISOString().split('T')[0]);
    } else {
      setNextBoosterDate('');
    }
  };

  const handleSaveVaccination = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaccineName.trim()) {
      setFormError('Vaccine name is required');
      return;
    }
    if (!scheduledDate) {
      setFormError('Scheduled date is required');
      return;
    }

    let animalTag = customAnimalTag.trim();
    let animalName = customAnimalName.trim();
    let animalId = selectedAnimalId;

    if (selectedAnimalId) {
      const matchAnimal = animals.find((a) => a.id === selectedAnimalId);
      if (matchAnimal) {
        animalTag = matchAnimal.tagId;
        animalName = matchAnimal.name;
        animalId = matchAnimal.id;
      }
    }

    if (!animalTag) {
      animalTag = `TAG-${Date.now().toString().slice(-4)}`;
    }
    if (!animalName) {
      animalName = 'Herd Cattle';
    }

    const today = new Date().toISOString().split('T')[0];
    let initialStatus: VaccinationStatus = 'Upcoming';
    if (scheduledDate < today) initialStatus = 'Overdue';
    else if (scheduledDate === today) initialStatus = 'Due';

    if (editingRecord) {
      updateVaccination(editingRecord.id, {
        animalId,
        animalTag,
        animalName,
        vaccineName: vaccineName.trim(),
        diseaseName: diseaseName.trim() || vaccineName.trim(),
        doseNumber: Number(doseNumber) || 1,
        scheduledDate,
        nextBoosterDate: nextBoosterDate || undefined,
        administeredBy: administeredBy.trim() || undefined,
        notes: notes.trim() || undefined,
        status: editingRecord.status === 'Completed' ? 'Completed' : initialStatus,
      });
    } else {
      addVaccination({
        animalId: animalId || `ani-${Date.now()}`,
        animalTag,
        animalName,
        vaccineName: vaccineName.trim(),
        diseaseName: diseaseName.trim() || vaccineName.trim(),
        doseNumber: Number(doseNumber) || 1,
        scheduledDate,
        nextBoosterDate: nextBoosterDate || undefined,
        administeredBy: administeredBy.trim() || undefined,
        notes: notes.trim() || undefined,
        status: initialStatus,
      });
    }

    setShowAddEditModal(false);
  };

  const handleDeleteConfirm = () => {
    if (!recordToDelete) return;
    deleteVaccination(recordToDelete.id);
    setRecordToDelete(null);
  };

  const handleConfirmMarkVaccinated = () => {
    if (!selectedVacToMark) return;
    markVaccinated(selectedVacToMark.id, vetName, vetNotes, nextDueDate || undefined);
    setSelectedVacToMark(null);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
      <MobileHeader
        showBack={true}
        title={t.vaccinationSchedule || 'Vaccinations Schedule'}
        subtitle={t.tagline || 'Herd Immunization & Disease Prevention'}
      />

      <main className="p-4 sm:p-5 space-y-4 pb-24 animate-fadeIn max-w-lg mx-auto w-full">
        
        {/* Top Header with Add Action */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {t.vaccinationSchedule || 'Herd Schedule'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track boosters and timely immunization
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-teal-600/30 flex items-center gap-1.5 active:scale-95 transition"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>{t.addVaccination || '+ Add Vaccination'}</span>
          </button>
        </div>

        {/* KPI Counter Grid */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <button
            type="button"
            onClick={() => setSelectedStatus(selectedStatus === 'Upcoming' ? 'All' : 'Upcoming')}
            className={`p-2.5 rounded-2xl border transition-all ${
              selectedStatus === 'Upcoming'
                ? 'bg-blue-100 dark:bg-blue-900/60 border-blue-400 ring-2 ring-blue-500/30'
                : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900'
            }`}
          >
            <span className="text-[10px] text-blue-700 dark:text-blue-400 font-bold block">{t.upcoming || 'Upcoming'}</span>
            <span className="text-base font-black text-blue-900 dark:text-blue-200">{upcomingCount}</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedStatus(selectedStatus === 'Due' ? 'All' : 'Due')}
            className={`p-2.5 rounded-2xl border transition-all ${
              selectedStatus === 'Due'
                ? 'bg-amber-100 dark:bg-amber-900/60 border-amber-400 ring-2 ring-amber-500/30'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900'
            }`}
          >
            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold block">{t.due || 'Due'}</span>
            <span className="text-base font-black text-amber-900 dark:text-amber-200">{dueCount}</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedStatus(selectedStatus === 'Overdue' ? 'All' : 'Overdue')}
            className={`p-2.5 rounded-2xl border transition-all ${
              selectedStatus === 'Overdue'
                ? 'bg-rose-100 dark:bg-rose-900/60 border-rose-400 ring-2 ring-rose-500/30'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900'
            }`}
          >
            <span className="text-[10px] text-rose-700 dark:text-rose-400 font-bold block">{t.overdue || 'Overdue'}</span>
            <span className="text-base font-black text-rose-900 dark:text-rose-200">{overdueCount}</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedStatus(selectedStatus === 'Completed' ? 'All' : 'Completed')}
            className={`p-2.5 rounded-2xl border transition-all ${
              selectedStatus === 'Completed'
                ? 'bg-emerald-100 dark:bg-emerald-900/60 border-emerald-400 ring-2 ring-emerald-500/30'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900'
            }`}
          >
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block">{t.completed || 'Done'}</span>
            <span className="text-base font-black text-emerald-900 dark:text-emerald-200">{completedCount}</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Vaccine, Disease, or Tag ID..."
            className="w-full pl-9 pr-8 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
          />
          <Search size={15} className="absolute left-3 top-3 text-slate-400" />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
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
                  className={`p-4 rounded-3xl border transition-all duration-200 shadow-sm space-y-3 ${
                    isCompleted
                      ? 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                      : vac.status === 'Overdue'
                      ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900'
                      : vac.status === 'Due'
                      ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[11px] font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/80 px-2 py-0.5 rounded-md border border-teal-200/50 dark:border-teal-800/50">
                          {vac.animalTag}
                        </span>
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {vac.animalName}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {vac.diseaseName}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {vac.vaccineName} • Dose #{vac.doseNumber}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <StatusBadge status={vac.status} size="sm" />
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(vac)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                        title="Edit"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setRecordToDelete(vac)}
                        className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-400 transition"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Schedule Details */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/60 text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Calendar size={13} className="text-teal-600" />
                        {t.vaccinationDate || 'Scheduled Date'}:
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatDate(vac.scheduledDate)}
                      </span>
                    </div>

                    {vac.nextBoosterDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Syringe size={13} className="text-amber-500" />
                          {t.nextDueDate || 'Next Due / Booster'}:
                        </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {formatDate(vac.nextBoosterDate)}
                        </span>
                      </div>
                    )}

                    {vac.completedDate && (
                      <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 size={13} /> Administered Date:
                        </span>
                        <span className="font-bold">{formatDate(vac.completedDate)}</span>
                      </div>
                    )}

                    {vac.administeredBy && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Administered By:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[170px]">
                          {vac.administeredBy}
                        </span>
                      </div>
                    )}

                    {vac.notes && (
                      <div className="pt-1 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-800/50 flex items-start gap-1">
                        <Info size={12} className="shrink-0 mt-0.5 text-slate-400" />
                        <span>{vac.notes}</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => navigate('animal-details', { animalId: vac.animalId })}
                      className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
                    >
                      View Animal Profile
                    </button>

                    {!isCompleted && (
                      <button
                        type="button"
                        onClick={() => setSelectedVacToMark(vac)}
                        className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm shadow-emerald-600/30 active:scale-95 transition"
                      >
                        <Check size={14} />
                        <span>Mark Vaccinated</span>
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 space-y-4">
            <EmptyState
              icon={Syringe}
              title={t.noVaccinationsScheduled || 'No Vaccinations Scheduled'}
              description="No scheduled vaccines found for this filter. Add your first immunization schedule to stay protected."
            />
            <button
              type="button"
              onClick={handleOpenAdd}
              className="py-3 px-5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold text-xs shadow-lg shadow-teal-600/30 inline-flex items-center gap-2 active:scale-95 transition"
            >
              <Plus size={16} />
              <span>{t.addVaccination || '+ Add Vaccination'}</span>
            </button>
          </div>
        )}

      </main>

      <BottomNavigation />

      {/* Add / Edit Vaccination Modal */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center">
                  <Syringe size={16} />
                </div>
                <h3 className="font-black text-sm text-slate-900 dark:text-white">
                  {editingRecord ? 'Edit Vaccination Record' : 'Schedule New Vaccination'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddEditModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center active:scale-95"
              >
                <X size={16} />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-800 flex items-center gap-2">
                <AlertTriangle size={15} className="shrink-0 text-rose-500" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveVaccination} className="space-y-3 text-xs">
              
              {/* Select Cow / Buffalo */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t.selectAnimal || 'Select Cow / Buffalo'} *
                </label>
                {animals.length > 0 ? (
                  <select
                    value={selectedAnimalId}
                    onChange={(e) => setSelectedAnimalId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {animals.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.tagId}) - {a.breed}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={customAnimalTag}
                      onChange={(e) => setCustomAnimalTag(e.target.value)}
                      placeholder="Tag ID (e.g. COW-101)"
                      className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                    />
                    <input
                      type="text"
                      value={customAnimalName}
                      onChange={(e) => setCustomAnimalName(e.target.value)}
                      placeholder="Animal Name (e.g. Ganga)"
                      className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                    />
                  </div>
                )}
              </div>

              {/* Vaccine Presets */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                  Quick Standard Vaccines (ICAR Protocols):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_VACCINES.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleSelectVaccinePreset(preset)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                        vaccineName === preset.name
                          ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-400'
                      }`}
                    >
                      {preset.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vaccine Name */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t.vaccineName || 'Vaccine Name'} *
                </label>
                <input
                  type="text"
                  value={vaccineName}
                  onChange={(e) => setVaccineName(e.target.value)}
                  placeholder={t.vaccineNamePlaceholder || 'e.g. FMD Trivalent / Anthrax'}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                  required
                />
              </div>

              {/* Disease Target */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t.diseaseTarget || 'Target Disease'}
                </label>
                <input
                  type="text"
                  value={diseaseName}
                  onChange={(e) => setDiseaseName(e.target.value)}
                  placeholder="e.g. Foot & Mouth Disease (FMD)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                />
              </div>

              {/* Dates & Dose */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t.vaccinationDate || 'Scheduled Date'} *
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t.nextDueDate || 'Next Due / Booster'}
                  </label>
                  <input
                    type="date"
                    value={nextBoosterDate}
                    onChange={(e) => setNextBoosterDate(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t.doseNumber || 'Dose Number'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={doseNumber}
                    onChange={(e) => setDoseNumber(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t.administeringVet || 'Veterinarian / Officer'}
                  </label>
                  <input
                    type="text"
                    value={administeredBy}
                    onChange={(e) => setAdministeringBy(e.target.value)}
                    placeholder="e.g. Dr. Ramesh (Vet)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t.notes || 'Notes / Batch Number'}
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t.notesPlaceholder || 'Batch #8812, 2ml subcutaneous'}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              {/* Submit Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  className="py-3 px-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-3 px-3 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-black text-xs shadow-lg shadow-teal-600/30 flex items-center justify-center gap-1 active:scale-95 transition"
                >
                  <Check size={14} />
                  <span>{editingRecord ? 'Save Changes' : 'Schedule Vaccine'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/80 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 size={24} />
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-sm text-slate-900 dark:text-white">
                {t.deleteVaccination || 'Delete Vaccination Record?'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.deleteVaccineConfirm || 'Are you sure you want to delete this scheduled vaccination?'}
              </p>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-xs font-bold text-slate-800 dark:text-slate-200 mt-2">
                {recordToDelete.vaccineName} ({recordToDelete.animalName})
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30 active:scale-95 transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark Vaccinated Modal */}
      {selectedVacToMark && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Syringe size={16} className="text-emerald-600" /> {t.vaccineGiven || 'Record Vaccine Administration'}
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
                  {t.dateAdministered || 'Date Administered'} *
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
                  {t.administeringVet || 'Administering Veterinarian / Officer'} *
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
                  {t.nextBoosterDate || 'Next Due / Booster Date (Optional)'}
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
                  {t.clinicalNotes || 'Clinical Notes / Vaccine Batch Number'}
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
                {t.cancel || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmMarkVaccinated}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1 active:scale-95 transition"
              >
                <Check size={14} /> {t.markCompletedBtn || t.confirm || 'Confirm & Save to History'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
