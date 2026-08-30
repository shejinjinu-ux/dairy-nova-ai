import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAppData } from '../../contexts/AppDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Language } from '../../types';
import { SUPPORTED_LANGUAGES, LanguageConfig } from '../../config/languageConfig';
import { AnimatedLogo } from '../../components/common/AnimatedLogo';
import { Globe, Check, ArrowRight, ArrowLeft } from 'lucide-react';

import { setStoredItem } from '../../services/api/apiHelper';

export const LanguageSelectionScreen: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { navigate, goBack, screenHistory } = useAppData();
  const { user, isAuthenticated, updateProfile } = useAuth();
  const [selected, setSelected] = useState<string>(language);

  const canGoBack = screenHistory.length > 1;

  const handleSelectLanguage = (langCode: string) => {
    setSelected(langCode);
    setLanguage(langCode as Language);
  };

  const handleContinue = async () => {
    const chosenLang = selected as Language;
    setLanguage(chosenLang);
    setStoredItem('has_selected_initial_language', true);

    if (canGoBack) {
      if (isAuthenticated) {
        await updateProfile({ language: chosenLang });
      }
      goBack();
      return;
    }

    if (isAuthenticated && user && user.isOnboarded !== false) {
      await updateProfile({ language: chosenLang });
      navigate(user.role === 'officer' ? 'officer-dashboard' : 'home');
    } else {
      navigate('login');
    }
  };

  return (
    <div className="min-h-full flex-1 flex flex-col justify-between p-5 sm:p-6 bg-slate-50 dark:bg-slate-950">
      
      {/* Top Section */}
      <div className="space-y-3.5 animate-fadeIn">
        <div className="flex items-center justify-between">
          {canGoBack ? (
            <button
              type="button"
              onClick={goBack}
              className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center active:scale-95 transition shadow-sm"
              aria-label="Back"
            >
              <ArrowLeft size={16} />
            </button>
          ) : (
            <div className="w-9" />
          )}

          <AnimatedLogo size="sm" showText={true} />

          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 dark:bg-teal-950/80 px-2 py-0.5 rounded-md">
            {t.languagesCount || '20+ Languages'}
          </span>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Globe size={20} className="text-teal-600" />
            {t.chooseLanguage || 'Select Your Language'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.chooseLanguageSubtitle || 'Choose your preferred language for Dairy Nova UI, AI Chat, and Voice.'}
          </p>
        </div>

        {/* Language Grid */}
        <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1 custom-scrollbar pt-1">
          {SUPPORTED_LANGUAGES.map((lang: LanguageConfig) => {
            const isSelected = selected === lang.code;

            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelectLanguage(lang.code)}
                className={`p-3 rounded-2xl border text-left transition-all duration-200 active:scale-95 flex flex-col justify-between relative overflow-hidden ${
                  isSelected
                    ? 'bg-gradient-to-br from-dairy-50 to-teal-50 dark:from-dairy-950/80 dark:to-teal-950/80 border-dairy-600 dark:border-dairy-500 shadow-md ring-2 ring-dairy-500/30'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-dairy-600 text-white flex items-center justify-center shadow-sm">
                    <Check size={10} strokeWidth={3} />
                  </div>
                )}

                <div>
                  <span className="text-xs font-black text-slate-900 dark:text-white block">
                    {lang.nativeName}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    {lang.name}
                  </span>
                </div>

                <span className="text-[9px] text-slate-400 font-medium mt-1.5 block truncate">
                  {lang.region}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Continue Action */}
      <div className="pt-4 pb-2 animate-fadeIn space-y-2">
        <button
          type="button"
          onClick={handleContinue}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-dairy-600 to-teal-600 hover:from-dairy-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-dairy-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <span>{t.confirm || 'Apply Language'}</span>
          <ArrowRight size={14} />
        </button>
      </div>

    </div>
  );
};
