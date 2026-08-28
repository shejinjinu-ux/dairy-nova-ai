import React, { useState } from 'react';
import { Mic, MicOff, Volume2, AlertCircle, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getSpeechRecognitionLocale } from '../../config/languageConfig';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  placeholderPrompt?: string;
  className?: string;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscript,
  placeholderPrompt,
  className = '',
}) => {
  const { language, t } = useLanguage();
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceNotice, setVoiceNotice] = useState<string>('');

  const startListening = () => {
    setVoiceNotice('');

    // Check Web Speech API Recognition
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceNotice(
        t.microUnavailable ||
          'Voice input is not supported in this browser. Please use Chrome/Edge or type your message.'
      );
      setTimeout(() => setVoiceNotice(''), 6000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      const targetLocale = getSpeechRecognitionLocale(language);
      recognition.lang = targetLocale;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);

      recognition.onresult = (event: any) => {
        if (event.results && event.results[0] && event.results[0][0]) {
          const transcript = event.results[0][0].transcript;
          onTranscript(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition notice:', event?.error);
        setIsListening(false);
        if (event?.error === 'not-allowed' || event?.error === 'permission-denied') {
          setVoiceNotice('Microphone permission was denied. Please enable microphone access in browser settings.');
        } else if (event?.error === 'no-speech') {
          setVoiceNotice('No speech detected. Please tap and speak clearly.');
        } else {
          setVoiceNotice(`Voice recognition notice: ${event?.error || 'unsupported'}`);
        }
        setTimeout(() => setVoiceNotice(''), 5000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      console.warn('Speech recognition start failed:', err);
      setIsListening(false);
      setVoiceNotice('Could not start voice recognition. Please verify microphone settings.');
      setTimeout(() => setVoiceNotice(''), 5000);
    }
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={isListening ? () => setIsListening(false) : startListening}
        className={`relative p-2.5 min-h-[40px] min-w-[40px] rounded-2xl transition-all duration-300 flex items-center justify-center ${
          isListening
            ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40 animate-pulse scale-105 ring-4 ring-rose-300/50'
            : 'bg-dairy-100 hover:bg-dairy-200 dark:bg-dairy-950/80 dark:hover:bg-dairy-900 text-dairy-700 dark:text-dairy-300 active:scale-95'
        }`}
        title={isListening ? 'Listening in selected language... Tap to stop' : 'Tap for Voice Input in selected language'}
        aria-label="Voice input"
      >
        {isListening ? (
          <div className="flex items-center gap-1">
            <Mic size={18} className="animate-bounce" />
            <div className="flex items-center gap-0.5 h-4">
              <span className="w-1 h-2 bg-white rounded-full animate-ping" />
              <span className="w-1 h-3.5 bg-white rounded-full animate-ping delay-75" />
              <span className="w-1 h-2 bg-white rounded-full animate-ping delay-150" />
            </div>
          </div>
        ) : (
          <Mic size={18} />
        )}
      </button>

      {/* Visible Floating Voice Notice Banner */}
      {voiceNotice && (
        <div className="absolute right-0 bottom-12 w-64 p-2.5 bg-slate-900 text-white text-[11px] rounded-2xl shadow-2xl border border-slate-700 z-50 animate-fadeIn flex items-start gap-2">
          <AlertCircle size={14} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="flex-1 leading-snug">{voiceNotice}</p>
          <button
            onClick={() => setVoiceNotice('')}
            aria-label="Close"
            className="text-slate-400 hover:text-white"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
};
