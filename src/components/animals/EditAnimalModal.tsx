import React, { useState } from 'react';
import { Animal, LactationStage, PregnancyStatus, HealthStatus } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { X, Save, AlertCircle } from 'lucide-react';
import { ConfirmationDialog } from '../common/ConfirmationDialog';

interface EditAnimalModalProps {
  animal: Animal;
  isOpen: boolean;
  onClose: () => void;
  onAnimalUpdated: (id: string, updates: Partial<Animal>) => void;
}

export const EditAnimalModal: React.FC<EditAnimalModalProps> = ({
  animal,
  isOpen,
  onClose,
  onAnimalUpdated,
}) => {
  const { t } = useLanguage();
  const [name, setName] = useState<string>(animal.name);
  const [weightKg, setWeightKg] = useState<string>(animal.weightKg !== undefined ? String(animal.weightKg) : '');
  const [lactationStage, setLactationStage] = useState<LactationStage>(animal.lactationStage);
  const [pregnancyStatus, setPregnancyStatus] = useState<PregnancyStatus>(animal.pregnancyStatus);
  const [dailyMilkYieldL, setDailyMilkYieldL] = useState<string>(animal.dailyMilkYieldL !== undefined ? String(animal.dailyMilkYieldL) : '');
  const [healthStatus, setHealthStatus] = useState<HealthStatus>(animal.healthStatus);
  const [notes, setNotes] = useState<string>(animal.notes || '');

  const [showDiscardConfirm, setShowDiscardConfirm] = useState<boolean>(false);

  if (!isOpen) return null;

  const isDirty =
    name !== animal.name ||
    weightKg !== (animal.weightKg !== undefined ? String(animal.weightKg) : '') ||
    lactationStage !== animal.lactationStage ||
    pregnancyStatus !== animal.pregnancyStatus ||
    dailyMilkYieldL !== (animal.dailyMilkYieldL !== undefined ? String(animal.dailyMilkYieldL) : '') ||
    healthStatus !== animal.healthStatus ||
    notes !== (animal.notes || '');

  const handleCloseAttempt = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  const handleSave = () => {
    const parsedWeight = weightKg.trim() !== '' ? Number(weightKg) : undefined;
    const parsedYield = dailyMilkYieldL.trim() !== '' ? Number(dailyMilkYieldL) : undefined;

    onAnimalUpdated(animal.id, {
      name,
      weightKg: parsedWeight,
      lactationStage,
      pregnancyStatus,
      dailyMilkYieldL: parsedYield,
      healthStatus,
      notes,
    });
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 font-mono">
                {animal.tagId}
              </span>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Edit Animal Record
              </h3>
            </div>
            <button
              onClick={handleCloseAttempt}
              className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 flex items-center justify-center"
            >
              <X size={16} />
            </button>
          </div>

          {/* Form */}
          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Calling Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="e.g. 380"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Daily Milk (L)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={dailyMilkYieldL}
                  onChange={(e) => setDailyMilkYieldL(e.target.value)}
                  placeholder="e.g. 12.5"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-dairy-600"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Lactation Stage
              </label>
              <select
                value={lactationStage}
                onChange={(e) => setLactationStage(e.target.value as LactationStage)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
              >
                <option value="Early">Early (0-100 Days)</option>
                <option value="Mid">Mid (100-200 Days)</option>
                <option value="Late">Late (200+ Days)</option>
                <option value="Dry">Dry Cow</option>
                <option value="Heifer">Heifer</option>
                <option value="Calf">Calf</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Pregnancy Status
              </label>
              <select
                value={pregnancyStatus}
                onChange={(e) => setPregnancyStatus(e.target.value as PregnancyStatus)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
              >
                <option value="Non-Pregnant">Non-Pregnant</option>
                <option value="Pregnant">Confirmed Pregnant</option>
                <option value="Suspected">Suspected / Artificial Insemination</option>
                <option value="Recent Calving">Recent Calving</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Health Status
              </label>
              <select
                value={healthStatus}
                onChange={(e) => setHealthStatus(e.target.value as HealthStatus)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
              >
                <option value="Healthy">Healthy</option>
                <option value="Needs Attention">Needs Attention</option>
                <option value="Critical Alert">Critical Alert</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleCloseAttempt}
              className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 active:scale-95 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="py-2.5 px-3 rounded-xl bg-dairy-600 hover:bg-dairy-700 text-white text-xs font-bold shadow-md shadow-dairy-600/30 flex items-center justify-center gap-1.5 active:scale-95 transition"
            >
              <Save size={14} /> Save Changes
            </button>
          </div>

        </div>
      </div>

      {/* Discard Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDiscardConfirm}
        title="Discard Unsaved Changes?"
        message="You have unsaved edits on this animal record. If you leave now, your modifications will be lost."
        confirmLabel="Discard"
        cancelLabel="Keep Editing"
        isDestructive={true}
        onConfirm={() => {
          setShowDiscardConfirm(false);
          onClose();
        }}
        onCancel={() => setShowDiscardConfirm(false)}
      />
    </>
  );
};
