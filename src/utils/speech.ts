// Web Speech API Voice Synthesis & Speech Recognition Helpers with robust fallbacks

export const speakText = (text: string, language: string = 'en-IN'): Promise<void> => {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser environment.');
      resolve();
      return;
    }

    // Cancel any currently speaking utterance
    window.speechSynthesis.cancel();

    // Clean markdown asterisks and hashtags for clean narration
    const cleanText = text.replace(/[*_#`[\]()]/g, ' ').replace(/\s+/g, ' ').trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.lang = language.includes('ta') ? 'ta-IN' : language.includes('hi') ? 'hi-IN' : 'en-IN';

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
