import { getSpeechSynthesisLocale } from '../config/languageConfig';

export const speakText = (text: string, language: string = 'en'): Promise<void> => {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser environment.');
      resolve();
      return;
    }

    window.speechSynthesis.cancel();

    // Clean markdown asterisks and hashtags for clean narration
    const cleanText = text.replace(/[*_#`[\]()]/g, ' ').replace(/\s+/g, ' ').trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const targetLocale = getSpeechSynthesisLocale(language);
    utterance.lang = targetLocale;

    try {
      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(
        (v) => v.lang === targetLocale || v.lang.toLowerCase().startsWith(targetLocale.split('-')[0].toLowerCase())
      );
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }
    } catch {
      // Ignore voice selection fallback
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
};

export const stopSpeaking = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

export const isSpeechAvailable = (): boolean => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
};
