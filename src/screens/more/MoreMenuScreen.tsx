import React, { useState } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { MobileHeader } from '../../components/common/MobileHeader';
import { BottomNavigation } from '../../components/common/BottomNavigation';
import { InstallAppModal } from '../../components/common/InstallAppModal';
import {
  Wheat,
  Activity,
  QrCode,
  Syringe,
  Layers,
  Sprout,
  History,
  Bell,
  User,
  Settings,
  ShieldCheck,
  ChevronRight,
  Download,
  Smartphone,
} from 'lucide-react';

export const MoreMenuScreen: React.FC = () => {
  const { navigate } = useAppData();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);

  const menuSections = [
    {
      title: 'Dairy & Feed Quality Tools',
      items: [
        { label: 'Feed Quality NIR', desc: 'Protein, moisture & adulteration', icon: Wheat, route: 'feed', color: 'amber' },
        { label: 'Silage Pit Analysis', desc: 'pH, core temperature & spoilage', icon: Activity, route: 'silage', color: 'teal' },
        { label: 'QR Traceability Seals', desc: 'Scan and generate digital batch labels', icon: QrCode, route: 'qr-traceability', color: 'emerald' },
        { label: 'Vaccinations Tracker', desc: 'Upcoming & overdue schedule', icon: Syringe, route: 'vaccinations', color: 'rose' },
      ],
    },
    {
      title: 'Genetics & Farm Monetization',
      items: [
        { label: 'Breed Catalog & AI Screening', desc: 'Indigenous A2 breeds database', icon: Layers, route: 'breeds', color: 'teal' },
        { label: 'By-Products Monetization', desc: 'Biogas, vermicompost & panchagavya', icon: Sprout, route: 'byproducts', color: 'emerald' },
        { label: 'Unified Activity History', desc: 'Audit trail of tests & yields', icon: History, route: 'history', color: 'blue' },
        { label: 'Notification Center', desc: 'Alerts & veterinary reminders', icon: Bell, route: 'notifications', color: 'amber' },
      ],
    },
    {
      title: 'Account & Preferences',
      items: [
        { label: t.profile, desc: 'Farm profile & member credentials', icon: User, route: 'profile', color: 'dairy' },
        { label: t.settings, desc: 'Language, offline sync & accessibility', icon: Settings, route: 'settings', color: 'slate' },
      ],
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
      <MobileHeader title={t.navMore} subtitle="Explore All Dairy Nova AI Capabilities" />

      <main className="p-4 sm:p-5 space-y-4 pb-20 animate-fadeIn">
        
        {/* Install Mobile App Prompt Card */}
        <div
          onClick={() => setIsInstallModalOpen(true)}
          className="p-4 rounded-3xl bg-gradient-to-r from-dairy-700 via-teal-700 to-emerald-700 text-white shadow-lg shadow-dairy-700/20 border border-teal-500/30 flex items-center justify-between cursor-pointer active:scale-[0.98] transition hover:brightness-105"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center backdrop-blur-sm">
              <Download size={20} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-200">
                {t.offlineMode || 'PWA / Offline Ready'}
              </span>
              <h4 className="font-extrabold text-sm text-white">{t.installNow || 'Install Dairy Nova on Phone'}</h4>
            </div>
          </div>
          <ChevronRight size={18} className="text-teal-200" />
        </div>

        {/* Officer View Switcher */}
        <div
          onClick={() => navigate('officer-dashboard')}
          className="p-4 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-slate-700 shadow-md flex items-center justify-between cursor-pointer active:scale-[0.98] transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                {t.supervisorMode || 'Supervisor Mode'}
              </span>
              <h4 className="font-extrabold text-sm text-white">{t.fieldOfficerCooperativeView || 'Field Officer & Cooperative View'}</h4>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-400" />
        </div>

        {/* Menu Sections */}
        {menuSections.map((section, idx) => (
          <div key={idx} className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
              {section.title}
            </h3>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-card-soft divide-y divide-slate-100 dark:divide-slate-800/80">
              {section.items.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.route}
                    onClick={() => navigate(item.route as any)}
                    className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 active:bg-slate-100 transition text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                        <Icon size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                          {item.label}
                        </h4>
                        <p className="text-[11px] text-slate-400">{item.desc}</p>
                      </div>
                    </div>

                    <ChevronRight size={16} className="text-slate-400" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}

      </main>

      <BottomNavigation />

      {/* Install App Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </div>
  );
};
