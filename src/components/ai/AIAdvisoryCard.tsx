import React from 'react';
import { Sparkles, ArrowRight, Sun, ShieldCheck, PlusCircle } from 'lucide-react';
import { ReadAloudButton } from '../common/ReadAloudButton';
import { SourceTag } from '../common/SourceTag';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAppData } from '../../contexts/AppDataContext';
import { useAuth } from '../../contexts/AuthContext';

interface AIAdvisoryCardProps {
  onAskAIClick: () => void;
  className?: string;
}

export const AIAdvisoryCard: React.FC<AIAdvisoryCardProps> = ({
  onAskAIClick,
  className = '',
}) => {
  const { t } = useLanguage();
  const { animals, healthAlerts, navigate } = useAppData();
  const { user } = useAuth();

  const cattleCount = animals.length;
  const hasAlerts = healthAlerts.some((a) => a.status === 'active');
  const locationName = user?.farmLocation ? user.farmLocation.split(',')[0].trim() : 'Local Climate';

  let advisoryText = '';
  let footerLabel = '';

  if (cattleCount === 0) {
    advisoryText =
      t.noCattleRegisteredYet ||
      'No cattle registered yet. Add your cattle to receive tailored feed ration balancing, silage quality alerts, and daily veterinary wellness advisory.';
    footerLabel = 'Register cattle to activate herd-specific AI advisory';
  } else if (cattleCount === 1) {
    const firstCow = animals[0];
    advisoryText = `Advisory for ${firstCow.name} (${firstCow.breed}, ${firstCow.lactationStage || 'Lactating'} stage): Provide 20-25kg fresh green fodder chopped with 3kg dry straw and 50g chelated mineral mix. Ensure ad-libitum clean water to maintain optimal daily milk yield.`;
    footerLabel = `Calibrated for 1 Registered Cattle (${firstCow.breed}) • ${locationName}`;
  } else {
    advisoryText = hasAlerts
      ? `Priority herd advisory: Clinical flags detected in herd. Isolate animals needing care, provide electrolyte hydration, and feed high-quality green fodder mixed with 15kg silage per lactating cow.`
      : `Daily herd advisory: Feed balanced total mixed ration (TMR) combining tested green fodder, 12kg silage, and concentrate meal split across morning and evening milking shifts. Ensure shade ventilation during peak afternoon hours.`;
    footerLabel = `Calibrated for ${cattleCount} Cattle • ${locationName}`;
  }

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900 via-teal-950 to-slate-950 text-white p-4 sm:p-5 border border-teal-700/50 shadow-xl shadow-teal-950/40 ${className}`}>
      {/* Background glow graphics */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-teal-500/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-dairy-500/20 rounded-full blur-xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-400 to-dairy-400 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-teal-400/20">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
              {t.aiAdvisory}
            </h3>
            <span className="text-[10px] text-teal-300 font-semibold flex items-center gap-1">
              <Sun size={11} className="text-amber-400" /> Dynamic Feed & Herd Action Plan
            </span>
          </div>
        </div>

        <SourceTag source="AI Screening" className="bg-teal-900/80 text-teal-200 border-teal-700" />
      </div>

      {/* Advisory Body */}
      <div className="relative z-10 space-y-2.5 text-xs text-slate-200 leading-relaxed bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-sm">
        <p className="text-[11px] sm:text-xs">{advisoryText}</p>
        <div className="flex items-center gap-2 text-[10px] text-teal-300 font-medium pt-1 border-t border-white/10">
          <ShieldCheck size={12} className="text-emerald-400 shrink-0" />
          <span>{footerLabel}</span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="relative z-10 flex items-center justify-between mt-3 pt-1">
        <ReadAloudButton textToRead={advisoryText} size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20" />

        {cattleCount === 0 ? (
          <button
            type="button"
            onClick={() => navigate('animals')}
            className="px-3 py-1.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md shadow-teal-400/20 active:scale-95 transition"
          >
            <PlusCircle size={13} /> {t.addAnimal || 'Add Cattle'}
          </button>
        ) : (
          <button
            type="button"
            onClick={onAskAIClick}
            className="px-3 py-1.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md shadow-teal-400/20 active:scale-95 transition"
          >
            {t.askAI} <ArrowRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
};
