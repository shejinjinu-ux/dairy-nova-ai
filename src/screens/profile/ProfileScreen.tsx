import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { MobileHeader } from '../../components/common/MobileHeader';
import { BottomNavigation } from '../../components/common/BottomNavigation';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Globe,
  Layers,
  LogOut,
  Edit3,
  ShieldCheck,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const { user, setShowLogoutModal, updateProfile } = useAuth();
  const { animals, navigate } = useAppData();
  const { language, languageOptions, t } = useLanguage();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [name, setName] = useState<string>(user?.name || 'Ramesh Kumar');
  const [farmName, setFarmName] = useState<string>(user?.farmName || 'Sri Lakshmi Dairy Farm');
  const [farmLocation, setFarmLocation] = useState<string>(user?.farmLocation || 'Erode, Tamil Nadu');
  const [mobile, setMobile] = useState<string>(user?.mobile || '+91 98450 23456');
  const [email, setEmail] = useState<string>(user?.email || 'ramesh.dairy@gmail.com');

  const currentLangName = languageOptions.find((l) => l.code === language)?.nativeName || 'English';

  const handleSaveProfile = () => {
    updateProfile({
      name,
      farmName,
      farmLocation,
      mobile,
      email,
    });
    setIsEditing(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
      <MobileHeader showBack={true} title={t.profile} subtitle="Farmer Credentials & Identity" />

      <main className="p-4 sm:p-5 space-y-4 pb-20 animate-fadeIn">
        
        {/* Profile Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card-soft space-y-4">
          <div className="flex items-center gap-3.5">
            <div className="w-16 h-16 rounded-2xl overflow-hidden ring-4 ring-dairy-500/20 bg-dairy-100 flex items-center justify-center shrink-0">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-dairy-700" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white truncate">
                  {user?.name}
                </h3>
                {user?.role === 'officer' && (
                  <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-bold">
                    Officer
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate">{user?.farmName}</p>
              <span className="text-[10px] text-teal-600 font-mono font-semibold">
                Member ID: {user?.cooperativeId || 'TN-ERD-8821'}
              </span>
            </div>
          </div>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center text-xs">
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60">
              <span className="text-[10px] text-slate-400 block font-medium">Registered Cattle</span>
              <span className="font-black text-slate-900 dark:text-white text-sm">{animals.length} Animals</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60">
              <span className="text-[10px] text-slate-400 block font-medium">Active Language</span>
              <span className="font-black text-dairy-600 dark:text-dairy-400 text-sm">{currentLangName}</span>
            </div>
          </div>
        </div>

        {/* Farm Details Info */}
        {!isEditing ? (
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card-soft space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-white">Contact & Farm Details</h4>
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 hover:underline"
              >
                <Edit3 size={13} /> Edit Profile
              </button>
            </div>

            <div className="space-y-2 text-[11px] text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-950/50">
                <Phone size={14} className="text-teal-600 shrink-0" />
                <span>{user?.mobile}</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-950/50">
                <Mail size={14} className="text-teal-600 shrink-0" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-950/50">
                <MapPin size={14} className="text-teal-600 shrink-0" />
                <span>{user?.farmLocation}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card-soft space-y-3 text-xs animate-fadeIn">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-white">Edit Profile</h4>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 p-1">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-slate-500 block mb-1">Farmer Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="text-slate-500 block mb-1">Farm Name</label>
                <input
                  type="text"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="text-slate-500 block mb-1">Location</label>
                <input
                  type="text"
                  value={farmLocation}
                  onChange={(e) => setFarmLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="py-2 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="py-2 rounded-xl bg-dairy-600 hover:bg-dairy-700 text-white font-bold"
                >
                  Save Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Action List */}
        <div className="space-y-2">
          <button
            onClick={() => navigate('language-select')}
            className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 active:scale-95 transition"
          >
            <div className="flex items-center gap-2.5">
              <Globe size={16} className="text-teal-600" />
              <span>Change Language ({currentLangName})</span>
            </div>
            <span className="text-xs text-dairy-600 dark:text-dairy-400">Switch &gt;</span>
          </button>

          <button
            onClick={() => navigate('settings')}
            className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 active:scale-95 transition"
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={16} className="text-dairy-600" />
              <span>Accessibility & App Settings</span>
            </div>
            <span className="text-slate-400">&gt;</span>
          </button>
        </div>

        {/* Logout Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="w-full py-3 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition shadow-sm"
          >
            <LogOut size={16} />
            <span>{t.logout}</span>
          </button>
        </div>

      </main>

      <BottomNavigation />
    </div>
  );
};
