import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { MobileHeader } from '../../components/common/MobileHeader';
import { BottomNavigation } from '../../components/common/BottomNavigation';
import { INDIAN_STATES, INDIAN_DISTRICTS_BY_STATE, detectCurrentFarmerLocation } from '../../utils/locationData';
import {
  User,
  Phone,
  MapPin,
  Globe,
  LogOut,
  Edit3,
  ShieldCheck,
  Check,
  X,
  Compass,
  Loader2,
  Camera,
} from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const { user, setShowLogoutModal, updateProfile } = useAuth();
  const { animals, navigate } = useAppData();
  const { language, languageOptions, t } = useLanguage();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [name, setName] = useState<string>(user?.name || 'Farmer');
  const [farmName, setFarmName] = useState<string>(user?.farmName || 'My Dairy Farm');
  const [selectedState, setSelectedState] = useState<string>('Tamil Nadu');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Erode');
  const [villageTown, setVillageTown] = useState<string>('');
  const [mobile, setMobile] = useState<string>(user?.mobile || '');
  const [email, setEmail] = useState<string>(user?.email || '');
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatarUrl || '');
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      setName(user.name || 'Farmer');
      setFarmName(user.farmName || 'My Dairy Farm');
      setMobile(user.mobile || '');
      setEmail(user.email || '');
      setAvatarUrl(user.avatarUrl || '');

      if (user.farmLocation) {
        const parts = user.farmLocation.split(',').map((p) => p.trim());
        if (parts.length >= 2) {
          const possibleState = parts[parts.length - 1];
          const possibleDist = parts[parts.length - 2];
          if (INDIAN_STATES.includes(possibleState)) {
            setSelectedState(possibleState);
          }
          setSelectedDistrict(possibleDist);
          if (parts.length > 2) {
            setVillageTown(parts.slice(0, parts.length - 2).join(', '));
          }
        }
      }
    }
  }, [user]);

  const currentLangName = languageOptions.find((l) => l.code === language)?.nativeName || 'English';
  const availableDistricts = INDIAN_DISTRICTS_BY_STATE[selectedState] || ['Central District', 'Other'];

  const handleDetectGPS = async () => {
    setIsDetectingLocation(true);
    try {
      const loc = await detectCurrentFarmerLocation();
      if (loc.state) setSelectedState(loc.state);
      if (loc.district) setSelectedDistrict(loc.district);
      if (loc.village) setVillageTown(loc.village);
      setIsDetectingLocation(false);
    } catch {
      setIsDetectingLocation(false);
    }
  };

  const handleSaveProfile = () => {
    const fullLoc = villageTown.trim()
      ? `${villageTown.trim()}, ${selectedDistrict}, ${selectedState}`
      : `${selectedDistrict}, ${selectedState}`;

    updateProfile({
      name,
      farmName,
      farmLocation: fullLoc,
      mobile,
      email,
      avatarUrl,
    });
    setIsEditing(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
      <MobileHeader showBack={true} title={t.profile} subtitle="Farmer Profile & Farm Region" />

      <main className="p-4 sm:p-5 space-y-4 pb-20 animate-fadeIn">
        
        {/* Profile Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card-soft space-y-4">
          <div className="flex items-center gap-3.5">
            <div className="w-16 h-16 rounded-2xl overflow-hidden ring-4 ring-emerald-500/20 bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-emerald-700 dark:text-emerald-300" />
              )}
            </div>

            <div className="flex-1 overflow-hidden">
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white truncate">
                  {user?.name || 'Farmer'}
                </h3>
                <ShieldCheck size={16} className="text-teal-600 shrink-0" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user?.farmName || 'My Dairy Farm'}
              </p>
              <span className="inline-block text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full mt-1">
                {user?.role === 'officer' ? 'Field Veterinary Officer' : 'Registered Dairy Farmer'}
              </span>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              aria-label="Edit Profile"
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 flex items-center justify-center transition active:scale-95 shrink-0"
            >
              {isEditing ? <X size={16} /> : <Edit3 size={16} />}
            </button>
          </div>

          {/* Quick Herd Snapshot */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block">{t.registeredAnimals || 'Registered Animals'}</span>
              <span className="font-bold text-slate-900 dark:text-white">{animals.length} {t.cattle || 'Cattle'}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block">{t.interfaceLanguage || 'Interface Language'}</span>
              <span className="font-bold text-teal-600 dark:text-teal-400">{currentLangName}</span>
            </div>
          </div>
        </div>

        {/* Profile Details / Edit Form */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card-soft space-y-3.5 text-xs">
          <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
            {t.farmerDetailsTitle || 'Farmer & Farm Location'}
          </h4>

          {isEditing ? (
            <div className="space-y-3 animate-fadeIn">
              {/* Profile Image Picker */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  {t.choosePhoto || 'Profile Picture'}
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User size={20} className="text-slate-400" />
                    )}
                  </div>
                  <label className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-1.5 active:scale-95 transition">
                    <Camera size={14} className="text-emerald-600" />
                    <span>{t.choosePhoto || 'Choose Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setAvatarUrl(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="text-xs text-rose-500 hover:underline"
                    >
                      {t.removePhoto || 'Remove'}
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  {t.farmerName || 'Full Name'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  {t.farmName || 'Farm Name'}
                </label>
                <input
                  type="text"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                />
              </div>

              {/* Cascading State/District */}
              <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    {t.farmLocation || 'Farm Location'}
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectGPS}
                    disabled={isDetectingLocation}
                    className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-1"
                  >
                    {isDetectingLocation ? <Loader2 size={10} className="animate-spin" /> : <Compass size={10} />}
                    <span>{t.gpsAutoDetect || 'GPS Auto-Detect'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">{t.state || 'State'}</label>
                    <select
                      value={selectedState}
                      onChange={(e) => {
                        const newState = e.target.value;
                        setSelectedState(newState);
                        const firstDist = INDIAN_DISTRICTS_BY_STATE[newState]?.[0] || 'Central';
                        setSelectedDistrict(firstDist);
                      }}
                      className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-xs"
                    >
                      {INDIAN_STATES.map((st: string) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">{t.district || 'District'}</label>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-xs"
                    >
                      {availableDistricts.map((dst: string) => (
                        <option key={dst} value={dst}>
                          {dst}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">{t.villageTown || 'Village / Town'}</label>
                  <input
                    type="text"
                    value={villageTown}
                    onChange={(e) => setVillageTown(e.target.value)}
                    placeholder="e.g. Gobichettipalayam"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Contact Mobile
                </label>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="py-2.5 px-3 min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="py-2.5 px-3 min-h-[40px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1"
                >
                  <Check size={14} /> Save Profile
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                <Phone size={15} className="text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block">{t.mobileContact || 'Mobile Contact'}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.mobile || mobile || '—'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                <MapPin size={15} className="text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block">{t.locationLabel || 'Location'}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.farmLocation || 'Tamil Nadu, India'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                <Globe size={15} className="text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block">{t.preferredLanguage || 'Preferred Language'}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{currentLangName}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={() => navigate('language-select')}
            className="w-full py-3 px-4 min-h-[44px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-between hover:border-emerald-500 transition shadow-sm active:scale-98"
          >
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-teal-600" />
              <span>{t.changeAppLanguage || 'Change Application Language'}</span>
            </div>
            <span className="text-emerald-600 font-bold">{currentLangName}</span>
          </button>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full py-3 px-4 min-h-[44px] rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-98"
          >
            <LogOut size={16} /> {t.logout || 'Sign Out of Dairy Nova'}
          </button>
        </div>

      </main>

      <BottomNavigation />
    </div>
  );
};
