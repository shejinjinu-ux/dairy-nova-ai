import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { speakText, stopSpeaking } from '../../utils/speech';
import { useLanguage } from '../../contexts/LanguageContext';

interface ReadAloudButtonProps {
  textToRead: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const ReadAloudButton: React.FC<ReadAloudButtonProps> = ({
  textToRead,
  className = '',
  size = 'sm',
}) => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const { language, t } = useLanguage();

  const handleToggleSpeak = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      await speakText(textToRead, language);
      setIsSpeaking(false);
    }
  };

  const isSmall = size === 'sm';

  return (
    <button
      type="button"
      onClick={handleToggleSpeak}
      className={`inline-flex items-center gap-1.5 font-semibold rounded-xl transition-all duration-200 active:scale-95 ${
        isSmall ? 'text-[11px] px-2.5 py-1' : 'text-xs px-3 py-1.5'
      } ${
        isSpeaking
          ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30 animate-pulse'
          : 'bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
      } ${className}`}
      title={isSpeaking ? 'Stop reading' : 'Read aloud'}
    >
      {isSpeaking ? (
        <>
          <VolumeX size={isSmall ? 13 : 15} />
          <span>Stop</span>
        </>
      ) : (
        <>
          <Volume2 size={isSmall ? 13 : 15} />
          <span>{t.readAloud}</span>
        </>
      )}
    </button>
  );
};
