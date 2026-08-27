import React, { useState } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  placeholderPrompt?: string;
  className?: string;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscript,
  placeholderPrompt = 'Cow has swollen right hind udder quarter and decreased milk by 3 liters.',
  className = '',
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);

  const startListening = () => {
    // Check Web Speech API
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-IN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        setIsListening(true);

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          onTranscript(transcript);
          setIsListening(false);
        };

        recognition.onerror = () => {
          simulateVoiceFallback();
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
        return;
      } catch {
        simulateVoiceFallback();
        return;
      }
    }

    simulateVoiceFallback();
  };

  const simulateVoiceFallback = () => {
    setIsListening(true);
    setTimeout(() => {
      onTranscript(placeholderPrompt);
      setIsListening(false);
    }, 1800);
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={isListening ? () => setIsListening(false) : startListening}
        className={`relative p-2.5 rounded-2xl transition-all duration-300 flex items-center justify-center ${
          isListening
            ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40 animate-pulse scale-105 ring-4 ring-rose-300/50'
            : 'bg-dairy-100 hover:bg-dairy-200 dark:bg-dairy-950/80 dark:hover:bg-dairy-900 text-dairy-700 dark:text-dairy-300 active:scale-95'
        }`}
        title={isListening ? 'Listening... Tap to stop' : 'Tap for Voice Input'}
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
    </div>
  );
};
