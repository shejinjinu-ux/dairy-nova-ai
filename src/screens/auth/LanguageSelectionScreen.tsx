import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAppData } from '../../contexts/AppDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Language } from '../../types';
import { AnimatedLogo } from '../../components/common/AnimatedLogo';
import { Globe, Check, ArrowRight, Sparkles } from 'lucide-react';

export const LanguageSelectionScreen: React.FC = () => {
  const { language, setLanguage, languageOptions, t } = useLanguage();
  const { navigate, goBack } = useAppData();
  const { isAuthenticated } = useAuth();
  const [selected, setSelected] = useState<Language>(language);

  const handleContinue = () => {
    setLanguage(selected);
    if (isAuthenticated) {
      goBack();
    } else {
      navigate('login');
    }
  };

  return (
    <div className="min-h-full flex-1 flex flex-col justify-between p-5 sm:p-6 bg-slate-50 dark:bg-slate-950">
      
      {/* Top Section */}
      <div className="space-y-4 animate-fadeIn">
        <div className="flex items-center justify-between">
          <AnimatedLogo size="sm" showText={true} />
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 dark:bg-teal-950/80 px-2 py-0.5 rounded-md">
            8 Regional Languages
          </span>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Globe size={20} className="text-teal-600" />
            Select Your Language
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            உங்கள் மொழியைத் தேர்ந்தெடுக்கவும் • अपनी भाषा चुनें
          </p>
        </div>

        {/* Language Grid */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {languageOptions.map((lang) => {
            const isSelected = selected === lang.code;

            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setSelected(lang.code)}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-200 active:scale-95 flex flex-col justify-between relative overflow-hidden ${
                  isSelected
                    ? 'bg-gradient-to-br from-dairy-50 to-teal-50 dark:from-dairy-950/80 dark:to-teal-950/80 border-dairy-600 dark:border-dairy-500 shadow-md ring-2 ring-dairy-500/30'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-dairy-600 text-white flex items-center justify-center shadow-sm">
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}

                <div>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white block">
                    {lang.nativeName}
                  </span>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {lang.name}
                  </span>
                </div>

                <span className="text-[10px] text-slate-400 font-medium mt-2 block truncate">
                  {lang.region}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Continue Action */}
      <div className="pt-6 pb-2 animate-fadeIn space-y-2">
        <button
          type="button"
          onClick={handleContinue}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-dairy-600 to-teal-600 hover:from-dairy-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-dairy-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <span>Continue / தொடரவும்</span>
          <ArrowRight size={14} />
        </button>

        <p className="text-[10px] text-center text-slate-400">
          You can change your language anytime from Settings or Profile.
        </p>
      </div>

    </div>
  );
};
