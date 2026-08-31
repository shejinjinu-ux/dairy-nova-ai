import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { AnimatedLogo } from '../../components/common/AnimatedLogo';
import { SUPPORTED_LANGUAGES, LanguageConfig } from '../../config/languageConfig';
import { Animal, AnimalType, LactationStage, Language } from '../../types';
import { INDIAN_STATES, INDIAN_DISTRICTS_BY_STATE, detectCurrentFarmerLocation } from '../../utils/locationData';
import { ALL_INDIAN_COW_BREEDS, ALL_INDIAN_BUFFALO_BREEDS } from '../../mocks/mockData';
import {
  Phone,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Loader2,
  Globe,
  User,
  ShieldCheck,
  RotateCcw,
  Check,
  MapPin,
  Compass,
} from 'lucide-react';

interface AuthOnboardingScreenProps {
  initialMode?: 'signup' | 'login';
}

export const AuthOnboardingScreen: React.FC<AuthOnboardingScreenProps> = ({
  initialMode = 'signup',
}) => {
  const { sendOtp, verifyOtp, completeFarmerProfile, isLoading } = useAuth();
  const { navigate, seedNewUserHerd } = useAppData();
  const { language, setLanguage, t } = useLanguage();

  const [mode, setMode] = useState<'signup' | 'login'>(initialMode);
  const [step, setStep] = useState<number>(1); // 1: Mobile, 2: OTP, 3: Name & Location, 4: Cattle, 5: Language

  // Form States
  const [mobile, setMobile] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Step 3: Farmer Profile & Indian Location
  const [farmerName, setFarmerName] = useState<string>('');
  const [farmName, setFarmName] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('Tamil Nadu');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Erode');
  const [villageTown, setVillageTown] = useState<string>('');
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState<string>('');

  // Step 4: Cattle Details
  const [cattleName, setCattleName] = useState<string>('');
  const [cattleTag, setCattleTag] = useState<string>(`TAG-${Math.floor(Math.random() * 800 + 100)}`);
  const [species, setSpecies] = useState<AnimalType>('Cow');
  const [breed, setBreed] = useState<string>('Gir');
  const [customBreed, setCustomBreed] = useState<string>('');
  const [weightKg, setWeightKg] = useState<string>('');
  const [dailyYield, setDailyYield] = useState<string>('');
  const [lactationStage, setLactationStage] = useState<LactationStage>('Early');
  const [pendingCattle, setPendingCattle] = useState<Omit<Animal, 'id' | 'createdDate' | 'lastCheckDate'> | null>(null);

  // Step 5: Language Selection
  const [selectedLanguage, setSelectedLanguage] = useState<string>(language);

  // Available districts for chosen state
  const availableDistricts = INDIAN_DISTRICTS_BY_STATE[selectedState] || ['Central District', 'Other'];
  const currentBreedList = species === 'Buffalo' ? ALL_INDIAN_BUFFALO_BREEDS : ALL_INDIAN_COW_BREEDS;

  // OTP Countdown Timer
  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // GPS Location Auto-Detection
  const handleDetectGPS = async () => {
    setIsDetectingLocation(true);
    setLocationSuccessMsg('');
    setErrorMessage('');

    try {
      const loc = await detectCurrentFarmerLocation();
      if (loc.state) setSelectedState(loc.state);
      if (loc.district) setSelectedDistrict(loc.district);
      if (loc.village) setVillageTown(loc.village);
      if (loc.state && loc.district) {
        setLocationSuccessMsg(`Detected: ${loc.district}, ${loc.state}`);
      }
      setIsDetectingLocation(false);
    } catch (err: any) {
      setIsDetectingLocation(false);
      setErrorMessage(err.message || 'Could not fetch GPS location. Please select state and district below.');
    }
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    const cleanDigits = mobile.replace(/[^0-9]/g, '').slice(-10);
    if (cleanDigits.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    try {
      await sendOtp(cleanDigits);
      setCountdown(45);
      setStep(2);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send OTP. Please try again.');
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6) {
      setErrorMessage('Please enter the 6-digit OTP code.');
      return;
    }

    try {
      const res = await verifyOtp(mobile, cleanOtp);
      if (res.isNewUser) {
        setStep(3);
      } else {
        if (res.user?.language) {
          setLanguage(res.user.language as Language);
        }
        setTimeout(() => {
          navigate(res.user?.role === 'officer' ? 'officer-dashboard' : 'home');
        }, 300);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid or expired OTP code.');
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setErrorMessage('');
    try {
      const cleanDigits = mobile.replace(/[^0-9]/g, '').slice(-10);
      await sendOtp(cleanDigits);
      setCountdown(45);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend OTP.');
    }
  };

  // Step 3: Save Name & Continue to Cattle
  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!farmerName.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }
    setErrorMessage('');
    setStep(4);
  };

  // Step 4: Save Cattle & Finish Onboarding
  const handleSaveCattle = async (skip: boolean = false) => {
    let cattleData: Omit<Animal, 'id' | 'createdDate' | 'lastCheckDate'> | null = null;
    if (!skip) {
      const finalBreed = breed === 'Other' ? (customBreed.trim() || 'Other Breed') : breed;
      const parsedWeight =
        weightKg.trim() !== '' && !isNaN(Number(weightKg)) && Number(weightKg) > 0
          ? Number(weightKg)
          : undefined;
      const parsedYield =
        dailyYield.trim() !== '' && !isNaN(Number(dailyYield)) && Number(dailyYield) >= 0
          ? Number(dailyYield)
          : undefined;

      cattleData = {
        tagId: cattleTag.trim() || `TAG-${Date.now().toString().slice(-4)}`,
        name: cattleName.trim() || `${finalBreed} #${cattleTag.trim() || '101'}`,
        type: species,
        breed: finalBreed,
        ageYears: 4,
        ageMonths: 0,
        sex: 'Female',
        weightKg: parsedWeight,
        lactationStage,
        pregnancyStatus: 'Non-Pregnant',
        dailyMilkYieldL: parsedYield,
        healthStatus: 'Healthy',
        ruminationMinutesPerDay: 460,
        activityLevel: 'Normal',
        imageUrl: '',
      };
      setPendingCattle(cattleData);
    } else {
      setPendingCattle(null);
    }

    // Seed the user's herd with their entered cattle (or leave empty if skipped)
    seedNewUserHerd(cattleData || undefined);

    const fullLocationStr = villageTown.trim()
      ? `${villageTown.trim()}, ${selectedDistrict}, ${selectedState}`
      : `${selectedDistrict}, ${selectedState}`;

    try {
      await completeFarmerProfile({
        name: farmerName.trim() || 'Dairy Farmer',
        mobile,
        farmName: farmName.trim() || `${farmerName.trim() || 'Farmer'}'s Dairy Farm`,
        farmLocation: fullLocationStr,
        language: (language as Language) || 'en',
      });

      setTimeout(() => {
        navigate('home');
      }, 400);
    } catch {
      navigate('home');
    }
  };

  return (
    <div className="min-h-full flex-1 flex flex-col justify-between p-5 sm:p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      
      {/* Top Header */}
      <div className="space-y-4 animate-fadeIn">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (step > 1) {
                setStep(step - 1);
              } else {
                navigate('splash');
              }
            }}
            className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center active:scale-95 transition shadow-sm"
          >
            <ArrowLeft size={16} />
          </button>

          <AnimatedLogo size="sm" showText={true} />

          <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-xl">
            {step === 1
              ? mode === 'signup' ? 'New User' : 'Login'
              : `Step ${step} of 4`}
          </div>
        </div>

        {/* Error Callout */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-800 flex items-center gap-2 animate-fadeIn">
            <AlertCircle size={15} className="shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: PHONE NUMBER INPUT */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {mode === 'signup' ? 'Sign Up for Dairy Nova' : 'Welcome Back, Farmer'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {mode === 'signup'
                  ? 'AI-Enabled Rapid Feed and Silage Quality Testing System for Dairy Farmers.'
                  : 'Enter your registered mobile number to access your cattle dashboard.'}
              </p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-4 pt-2">
              <div>
                <label className="font-bold text-xs text-slate-700 dark:text-slate-300 block mb-1.5">
                  {t.mobileNumber} *
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs font-extrabold text-slate-500 select-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                    placeholder="98450 23456"
                    maxLength={10}
                    autoFocus
                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                  />
                  <Phone size={16} className="absolute right-3.5 text-slate-400" />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  We will send a 6-digit OTP to verify your account.
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading || mobile.length < 10}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                <span>{t.sendOtp}</span>
                <ArrowRight size={15} />
              </button>
            </form>

            {/* Toggle Mode Link */}
            <div className="pt-2 text-center text-xs text-slate-500">
              <span>{mode === 'signup' ? 'Already have an account?' : 'New to Dairy Nova?'} </span>
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'signup' ? 'login' : 'signup');
                  setErrorMessage('');
                }}
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline ml-1"
              >
                {mode === 'signup' ? 'Existing User Login' : 'New User Sign Up'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: OTP VERIFICATION */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Verify Phone Number
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.enterOtp} <strong className="text-slate-700 dark:text-slate-200">+91 {mobile}</strong>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4 pt-2">
              <div>
                <label className="font-bold text-xs text-slate-700 dark:text-slate-300 block mb-1.5">
                  6-Digit OTP *
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  placeholder="• • • • • •"
                  maxLength={6}
                  autoFocus
                  className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center font-mono text-xl tracking-[0.5em] font-black text-slate-900 dark:text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 disabled:opacity-40 text-white font-bold text-xs shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                <span>{t.verifyOtp}</span>
                <ArrowRight size={15} />
              </button>
            </form>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold"
              >
                Change Number
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={countdown > 0}
                className="font-bold text-teal-600 dark:text-teal-400 disabled:opacity-50 flex items-center gap-1"
              >
                <RotateCcw size={13} />
                {countdown > 0 ? `${t.resendIn} ${countdown}s` : t.resendOtp}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: FARMER PROFILE & LOCATION */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {t.whatShouldWeCallYou}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Provide your name and location for local climate, crop silage, and fodder advisory.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 pt-2 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t.farmerName} *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    autoFocus
                    className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                  />
                  <User size={15} className="absolute left-3.5 top-3 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t.farmName} (Optional)
                </label>
                <input
                  type="text"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  placeholder="e.g. Sri Lakshmi Dairy Farm"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                />
              </div>

              {/* Location Geolocation + Cascading Selector */}
              <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <MapPin size={13} className="text-emerald-600" /> Farm Location (India) *
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectGPS}
                    disabled={isDetectingLocation}
                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    {isDetectingLocation ? <Loader2 size={12} className="animate-spin" /> : <Compass size={12} />}
                    <span>{isDetectingLocation ? 'Detecting GPS...' : 'Auto-Detect GPS'}</span>
                  </button>
                </div>

                {locationSuccessMsg && (
                  <p className="text-[11px] text-emerald-600 font-semibold">{locationSuccessMsg}</p>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">State</label>
                    <select
                      value={selectedState}
                      onChange={(e) => {
                        const newState = e.target.value;
                        setSelectedState(newState);
                        const firstDist = INDIAN_DISTRICTS_BY_STATE[newState]?.[0] || 'Central';
                        setSelectedDistrict(firstDist);
                      }}
                      className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white"
                    >
                      {INDIAN_STATES.map((st: string) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">District</label>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white"
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
                  <label className="text-[10px] text-slate-400 block mb-0.5">Village / Town (Optional)</label>
                  <input
                    type="text"
                    value={villageTown}
                    onChange={(e) => setVillageTown(e.target.value)}
                    placeholder="e.g. Gobichettipalayam"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!farmerName.trim()}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all mt-2"
              >
                <span>Continue</span>
                <ArrowRight size={15} />
              </button>
            </form>
          </div>
        )}

        {/* STEP 4: CATTLE DETAILS (41+ BREEDS) */}
        {step === 4 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {t.cattleDetailsTitle}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.cattleDetailsSubtitle}
              </p>
            </div>

            <div className="space-y-3 pt-1 text-xs">
              {/* Species Toggle */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSpecies('Cow');
                    setBreed('Gir');
                  }}
                  className={`py-2.5 px-3 rounded-2xl font-bold border transition active:scale-95 ${
                    species === 'Cow'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/30'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  🐄 Cow (பசு)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSpecies('Buffalo');
                    setBreed('Murrah');
                  }}
                  className={`py-2.5 px-3 rounded-2xl font-bold border transition active:scale-95 ${
                    species === 'Buffalo'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/30'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  🐃 Buffalo (எருமை)
                </button>
              </div>

              {/* Tag & Name */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[11px] text-slate-700 dark:text-slate-300 block mb-1">
                    {t.cattleTag}
                  </label>
                  <input
                    type="text"
                    value={cattleTag}
                    onChange={(e) => setCattleTag(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-[11px] text-slate-700 dark:text-slate-300 block mb-1">
                    {t.cattleName}
                  </label>
                  <input
                    type="text"
                    value={cattleName}
                    onChange={(e) => setCattleName(e.target.value)}
                    placeholder="e.g. Gouri"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-semibold"
                  />
                </div>
              </div>

              {/* Breed & Weight */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-[11px] text-slate-700 dark:text-slate-300 block mb-1">
                      {t.breed} ({species === 'Cow' ? 'Cow' : 'Buffalo'} Breeds)
                    </label>
                    <select
                      value={breed}
                      onChange={(e) => setBreed(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-semibold"
                    >
                      {currentBreedList.map((bName) => (
                        <option key={bName} value={bName}>
                          {bName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[11px] text-slate-700 dark:text-slate-300 block mb-1">
                      {t.weightKg} (kg)
                    </label>
                    <input
                      type="number"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      placeholder="e.g. 380"
                      min={0}
                      max={1200}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-semibold placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* Custom Breed Input when "Other" is chosen */}
                {breed === 'Other' && (
                  <div className="animate-fadeIn">
                    <label className="font-bold text-[11px] text-slate-700 dark:text-slate-300 block mb-1">
                      Specify Custom Breed Name *
                    </label>
                    <input
                      type="text"
                      value={customBreed}
                      onChange={(e) => setCustomBreed(e.target.value)}
                      placeholder="e.g. Alambadi, Bargur, Malnad Gidda..."
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-500 font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>

              {/* Daily Yield & Lactation */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[11px] text-slate-700 dark:text-slate-300 block mb-1">
                    {t.dailyYield} (L/day)
                  </label>
                  <input
                    type="number"
                    value={dailyYield}
                    onChange={(e) => setDailyYield(e.target.value)}
                    placeholder="e.g. 12.5"
                    step="0.5"
                    min={0}
                    max={60}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-semibold placeholder-slate-400"
                  />
                </div>

                <div>
                  <label className="font-bold text-[11px] text-slate-700 dark:text-slate-300 block mb-1">
                    {t.lactationStage}
                  </label>
                  <select
                    value={lactationStage}
                    onChange={(e) => setLactationStage(e.target.value as LactationStage)}
                    className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-semibold"
                  >
                    <option value="Early">Early Lactation (1-100 days)</option>
                    <option value="Mid">Mid Lactation (100-200 days)</option>
                    <option value="Late">Late Lactation (200+ days)</option>
                    <option value="Dry">Dry Cow / Non-Milking</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => handleSaveCattle(false)}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95 transition"
                >
                  <CheckCircle2 size={15} />
                  <span>{t.addAndContinue || 'Complete Setup & Open Dashboard'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveCattle(true)}
                  className="w-full py-2.5 px-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold text-xs transition"
                >
                  {t.skipForNow}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Bottom Footer Information */}
      <div className="pt-4 pb-1 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
        <ShieldCheck size={12} className="text-emerald-600" />
        <span>Smart AI-Enabled Rapid Feed and Silage Quality Testing System for Dairy Farmers</span>
      </div>

    </div>
  );
};
