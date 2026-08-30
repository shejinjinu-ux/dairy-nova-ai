import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { useOffline } from '../../contexts/OfflineContext';
import { MobileHeader } from '../../components/common/MobileHeader';
import { BottomNavigation } from '../../components/common/BottomNavigation';
import {
  Globe,
  Bell,
  Eye,
  Type,
  Mic,
  Volume2,
  WifiOff,
  RefreshCw,
  LogOut,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const { setShowLogoutModal } = useAuth();
  const { navigate } = useAppData();
  const { language, languageOptions, t } = useLanguage();
  const {
    isLargeText,
    isHighContrast,
    isVoiceInputEnabled,
    isAutoReadAloud,
    toggleLargeText,
    toggleHighContrast,
    toggleVoiceInput,
    toggleAutoReadAloud,
  } = useAccessibility();
  const { isOffline, toggleOfflineMode, pendingQueue, syncNow, isSyncing, lastSyncTime } = useOffline();

  // Notification Toggles State
  const [notifVaccinations, setNotifVaccinations] = useState<boolean>(true);
  const [notifHealth, setNotifHealth] = useState<boolean>(true);
  const [notifFeed, setNotifFeed] = useState<boolean>(true);
  const [notifSilage, setNotifSilage] = useState<boolean>(true);
  const [notifMilk, setNotifMilk] = useState<boolean>(true);

  const currentLang = languageOptions.find((l) => l.code === language);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
      <MobileHeader showBack={true} title={t.settings} subtitle="Preferences, Accessibility & Data Sync" />

      <main className="p-4 sm:p-5 space-y-4 pb-20 animate-fadeIn text-xs">
        
        {/* Language Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
            {t.language || 'Language'}
          </h3>
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 flex items-center justify-between shadow-card-soft">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Globe size={20} />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">{t.activeAppLanguage || 'Active App Language'}</span>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {currentLang?.nativeName} ({currentLang?.name})
                </h4>
              </div>
            </div>

            <button
              onClick={() => navigate('language-select')}
              className="py-1.5 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 font-bold text-xs active:scale-95 transition"
            >
              {t.changeAppLanguage || 'Change Language'}
            </button>
          </div>
        </div>

        {/* Accessibility Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
            {t.settings || 'Farmer Accessibility'}
          </h3>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-card-soft overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80">
            {/* Large Text */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                  <Type size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{t.largeText}</h4>
                  <p className="text-[10px] text-slate-400">{t.enlargeTypography || 'Enlarge typography for outdoor daylight reading'}</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isLargeText}
                onChange={toggleLargeText}
                className="w-5 h-5 accent-dairy-600 rounded cursor-pointer"
              />
            </div>

            {/* High Contrast */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                  <Eye size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{t.highContrast}</h4>
                  <p className="text-[10px] text-slate-400">{t.highContrastDesc || 'High contrast borders and vivid status indicators'}</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isHighContrast}
                onChange={toggleHighContrast}
                className="w-5 h-5 accent-dairy-600 rounded cursor-pointer"
              />
            </div>

            {/* Voice Input */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                  <Mic size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{t.voiceInput}</h4>
                  <p className="text-[10px] text-slate-400">{t.enableVoiceInputDesc || 'Enable voice input across symptoms and milk recording'}</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isVoiceInputEnabled}
                onChange={toggleVoiceInput}
                className="w-5 h-5 accent-dairy-600 rounded cursor-pointer"
              />
            </div>

            {/* Auto Read Aloud */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                  <Volume2 size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{t.autoReadAloud || 'Auto Read Aloud (TTS)'}</h4>
                  <p className="text-[10px] text-slate-400">{t.voiceAssistNarration || 'Voice assist narration for AI diagnostic results'}</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isAutoReadAloud}
                onChange={toggleAutoReadAloud}
                className="w-5 h-5 accent-dairy-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
            {t.notifications || 'Notification Preferences'}
          </h3>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-card-soft p-3.5 space-y-2.5">
            {[
              { label: t.vaccinations || 'Vaccination Due Alerts', checked: notifVaccinations, set: setNotifVaccinations },
              { label: t.diseaseCheck || 'Health Diagnostic Alerts', checked: notifHealth, set: setNotifHealth },
              { label: t.feedCheck || 'Feed Quality Warnings', checked: notifFeed, set: setNotifFeed },
              { label: t.silageCheck || 'Silage Spoilage Warnings', checked: notifSilage, set: setNotifSilage },
              { label: t.recordMilk || 'Milk Collection Updates', checked: notifMilk, set: setNotifMilk },
            ].map((n, i) => (
              <div key={i} className="flex items-center justify-between py-1">
                <span className="font-medium text-slate-700 dark:text-slate-300 text-xs">{n.label}</span>
                <input
                  type="checkbox"
                  checked={n.checked}
                  onChange={(e) => n.set(e.target.checked)}
                  className="w-4 h-4 accent-dairy-600 rounded cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* App & Data Sync Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
            {t.offlineMode || 'App & Offline Data Sync'}
          </h3>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-card-soft p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 flex items-center justify-center">
                  <WifiOff size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{t.offlineModeTitle || 'Simulated Offline Mode'}</h4>
                  <p className="text-[10px] text-slate-400">{t.offlineModeDesc || 'Queue actions locally without internet'}</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isOffline}
                onChange={toggleOfflineMode}
                className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block">{t.pendingOfflineQueue || 'Pending Offline Queue:'}</span>
                <strong className="text-slate-900 dark:text-white">
                  {pendingQueue.length} {t.pendingSync || 'records waiting to sync'}
                </strong>
              </div>

              <button
                type="button"
                onClick={() => syncNow()}
                disabled={isSyncing}
                className="py-1.5 px-3 rounded-xl bg-dairy-600 hover:bg-dairy-700 text-white font-bold flex items-center gap-1.5 active:scale-95 transition"
              >
                <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                {isSyncing ? (t.saving || 'Syncing...') : (t.syncNow || 'Sync Now')}
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>{t.lastSyncStatus || 'Last Sync Status:'}</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 size={12} /> {lastSyncTime}
              </span>
            </div>
          </div>
        </div>

        {/* Account & Logout Section */}
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 px-1">
            {t.profile || 'Account Actions'}
          </h3>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900 p-4 shadow-card-soft space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{t.logout}</h4>
                <p className="text-[11px] text-slate-500">{t.signOutActiveSession || 'Sign out of active dairy farmer session'}</p>
              </div>

              <button
                type="button"
                onClick={() => setShowLogoutModal(true)}
                className="py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30 active:scale-95 transition"
              >
                <LogOut size={14} /> {t.logout}
              </button>
            </div>
          </div>
        </div>

      </main>

      <BottomNavigation />
    </div>
  );
};
