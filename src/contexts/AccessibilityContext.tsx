import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStoredItem, setStoredItem } from '../services/api/apiHelper';

interface AccessibilityContextType {
  isLargeText: boolean;
  isHighContrast: boolean;
  isVoiceInputEnabled: boolean;
  isAutoReadAloud: boolean;
  toggleLargeText: () => void;
  toggleHighContrast: () => void;
  toggleVoiceInput: () => void;
  toggleAutoReadAloud: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLargeText, setIsLargeText] = useState<boolean>(() => {
    return getStoredItem<boolean>('access_large_text', false);
  });
  const [isHighContrast, setIsHighContrast] = useState<boolean>(() => {
    return getStoredItem<boolean>('access_high_contrast', false);
  });
  const [isVoiceInputEnabled, setIsVoiceInputEnabled] = useState<boolean>(() => {
    return getStoredItem<boolean>('access_voice_input', true);
  });
  const [isAutoReadAloud, setIsAutoReadAloud] = useState<boolean>(() => {
    return getStoredItem<boolean>('access_auto_read', false);
  });

  const toggleLargeText = () => {
    setIsLargeText((prev) => {
      const next = !prev;
      setStoredItem('access_large_text', next);
      return next;
    });
  };

  const toggleHighContrast = () => {
    setIsHighContrast((prev) => {
      const next = !prev;
      setStoredItem('access_high_contrast', next);
      return next;
    });
  };

  const toggleVoiceInput = () => {
    setIsVoiceInputEnabled((prev) => {
      const next = !prev;
      setStoredItem('access_voice_input', next);
      return next;
    });
  };

  const toggleAutoReadAloud = () => {
    setIsAutoReadAloud((prev) => {
      const next = !prev;
      setStoredItem('access_auto_read', next);
      return next;
    });
  };

  useEffect(() => {
    if (isHighContrast) {
      document.body.classList.add('high-contrast-mode');
    } else {
      document.body.classList.remove('high-contrast-mode');
    }

    if (isLargeText) {
      document.body.classList.add('large-text-mode');
    } else {
      document.body.classList.remove('large-text-mode');
    }
  }, [isHighContrast, isLargeText]);

  const value: AccessibilityContextType = {
    isLargeText,
    isHighContrast,
    isVoiceInputEnabled,
    isAutoReadAloud,
    toggleLargeText,
    toggleHighContrast,
    toggleVoiceInput,
    toggleAutoReadAloud,
  };

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
