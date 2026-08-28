export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  region: string;
  locale: string;
  speechRecognitionLocale: string;
  speechSynthesisLocale: string;
  isRomanized?: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    region: 'National / Global',
    locale: 'en-IN',
    speechRecognitionLocale: 'en-IN',
    speechSynthesisLocale: 'en-IN',
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    region: 'Tamil Nadu & Puducherry',
    locale: 'ta-IN',
    speechRecognitionLocale: 'ta-IN',
    speechSynthesisLocale: 'ta-IN',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    region: 'North & Central India',
    locale: 'hi-IN',
    speechRecognitionLocale: 'hi-IN',
    speechSynthesisLocale: 'hi-IN',
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    region: 'Andhra Pradesh & Telangana',
    locale: 'te-IN',
    speechRecognitionLocale: 'te-IN',
    speechSynthesisLocale: 'te-IN',
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    region: 'Karnataka',
    locale: 'kn-IN',
    speechRecognitionLocale: 'kn-IN',
    speechSynthesisLocale: 'kn-IN',
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    region: 'Kerala & Lakshadweep',
    locale: 'ml-IN',
    speechRecognitionLocale: 'ml-IN',
    speechSynthesisLocale: 'ml-IN',
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    region: 'West Bengal & Tripura',
    locale: 'bn-IN',
    speechRecognitionLocale: 'bn-IN',
    speechSynthesisLocale: 'bn-IN',
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    region: 'Maharashtra & Goa',
    locale: 'mr-IN',
    speechRecognitionLocale: 'mr-IN',
    speechSynthesisLocale: 'mr-IN',
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    region: 'Gujarat',
    locale: 'gu-IN',
    speechRecognitionLocale: 'gu-IN',
    speechSynthesisLocale: 'gu-IN',
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    region: 'Punjab & Chandigarh',
    locale: 'pa-IN',
    speechRecognitionLocale: 'pa-IN',
    speechSynthesisLocale: 'pa-IN',
  },
  {
    code: 'or',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    region: 'Odisha',
    locale: 'or-IN',
    speechRecognitionLocale: 'or-IN',
    speechSynthesisLocale: 'or-IN',
  },
  {
    code: 'as',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    region: 'Assam',
    locale: 'as-IN',
    speechRecognitionLocale: 'as-IN',
    speechSynthesisLocale: 'as-IN',
  },
  {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    region: 'National',
    locale: 'ur-IN',
    speechRecognitionLocale: 'ur-IN',
    speechSynthesisLocale: 'ur-IN',
  },
  {
    code: 'sa',
    name: 'Sanskrit',
    nativeName: 'संस्कृतम्',
    region: 'Classical / National',
    locale: 'sa-IN',
    speechRecognitionLocale: 'sa-IN',
    speechSynthesisLocale: 'hi-IN',
  },
  {
    code: 'ne',
    name: 'Nepali',
    nativeName: 'नेपाली',
    region: 'Sikkim & West Bengal',
    locale: 'ne-NP',
    speechRecognitionLocale: 'ne-NP',
    speechSynthesisLocale: 'ne-NP',
  },
  {
    code: 'kok',
    name: 'Konkani',
    nativeName: 'कोंकणी',
    region: 'Goa & Coastal Karnataka',
    locale: 'kok-IN',
    speechRecognitionLocale: 'kok-IN',
    speechSynthesisLocale: 'mr-IN',
  },
  {
    code: 'ks',
    name: 'Kashmiri',
    nativeName: 'کٲشُر',
    region: 'Jammu & Kashmir',
    locale: 'ks-IN',
    speechRecognitionLocale: 'ks-IN',
    speechSynthesisLocale: 'ur-IN',
  },
  {
    code: 'sd',
    name: 'Sindhi',
    nativeName: 'سنڌي',
    region: 'Western India',
    locale: 'sd-IN',
    speechRecognitionLocale: 'sd-IN',
    speechSynthesisLocale: 'hi-IN',
  },
  {
    code: 'mai',
    name: 'Maithili',
    nativeName: 'मैथिली',
    region: 'Bihar & Jharkhand',
    locale: 'mai-IN',
    speechRecognitionLocale: 'mai-IN',
    speechSynthesisLocale: 'hi-IN',
  },
  {
    code: 'mni',
    name: 'Manipuri',
    nativeName: 'মৈতৈলোন্',
    region: 'Manipur',
    locale: 'mni-IN',
    speechRecognitionLocale: 'mni-IN',
    speechSynthesisLocale: 'bn-IN',
  },
  {
    code: 'tanglish',
    name: 'Tanglish',
    nativeName: 'Tanglish (தமிழ்)',
    region: 'Romanized Tamil & English',
    locale: 'ta-IN',
    speechRecognitionLocale: 'ta-IN',
    speechSynthesisLocale: 'ta-IN',
    isRomanized: true,
  },
];

export const getLanguageConfig = (code: string): LanguageConfig => {
  return (
    SUPPORTED_LANGUAGES.find(
      (lang) => lang.code.toLowerCase() === code.toLowerCase()
    ) || SUPPORTED_LANGUAGES[0]
  );
};

export const getSpeechRecognitionLocale = (code: string): string => {
  const config = getLanguageConfig(code);
  return config.speechRecognitionLocale || 'en-IN';
};

export const getSpeechSynthesisLocale = (code: string): string => {
  const config = getLanguageConfig(code);
  return config.speechSynthesisLocale || 'en-IN';
};
