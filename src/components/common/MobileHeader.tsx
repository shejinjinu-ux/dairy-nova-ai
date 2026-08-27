import React from 'react';
import { Bell, ArrowLeft, Globe, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAppData } from '../../contexts/AppDataContext';
import { getGreetingTime } from '../../utils/formatters';

interface MobileHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showGreeting?: boolean;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  showGreeting = false,
}) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { goBack, navigate, unreadNotificationsCount } = useAppData();

  const greetingTime = getGreetingTime();
  const greetingText =
    greetingTime === 'morning'
      ? t.greetingMorning
      : greetingTime === 'afternoon'
      ? t.greetingAfternoon
      : t.greetingEvening;

  return (
    <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/80 px-4 py-3 sticky top-0 z-30 flex items-center justify-between transition-all">
      {/* Left side: Back button or Greeting/Title */}
      <div className="flex items-center gap-3 overflow-hidden">
        {showBack ? (
          <button
            onClick={goBack}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center active:scale-95 transition-transform hover:bg-slate-200 dark:hover:bg-slate-700 shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
        ) : null}

        <div className="truncate">
          {showGreeting && user ? (
            <div>
              <p className="text-[11px] font-semibold text-dairy-600 dark:text-dairy-400 uppercase tracking-wider">
                {greetingText}
              </p>
              <h1 className="text-base font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                {user.name}
                {user.role === 'officer' && (
                  <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] px-1.5 py-0.5 rounded-full font-semibold flex items-center gap-0.5">
                    <ShieldCheck size={10} /> Officer
                  </span>
                )}
              </h1>
            </div>
          ) : (
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white truncate">{title}</h1>
              {subtitle && <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{subtitle}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Right side: Action icons */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Language quick switcher */}
        <button
          onClick={() => navigate('language-select')}
          className="px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 active:scale-95 transition"
          title="Change Language"
        >
          <Globe size={13} className="text-teal-600 dark:text-teal-400" />
          <span className="uppercase text-[11px]">{language}</span>
        </button>

        {/* Notifications button */}
        <button
          onClick={() => navigate('notifications')}
          className="relative w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center active:scale-95 transition"
          aria-label="Notifications"
        >
          <Bell size={17} />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Profile Avatar */}
        <button
          onClick={() => navigate('profile')}
          className="w-9 h-9 rounded-xl overflow-hidden ring-2 ring-dairy-500/30 hover:ring-dairy-500 transition active:scale-95 shrink-0 bg-dairy-100 dark:bg-dairy-900 flex items-center justify-center"
          aria-label="User profile"
        >
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <User size={18} className="text-dairy-700 dark:text-dairy-300" />
          )}
        </button>
      </div>
    </header>
  );
};
