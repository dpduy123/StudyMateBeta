'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import en from '@/locales/en.json';
import vi from '@/locales/vi.json';

export type Locale = 'en' | 'vi';

const translations = { en, vi } as const;

export const locales: Locale[] = ['en', 'vi'];
export const defaultLocale: Locale = 'en';
export const localeNames: Record<Locale, string> = {
  en: 'English',
  vi: 'Tiếng Việt',
};

// Helper to get nested value
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current, key) => {
    return current && typeof current === 'object' ? (current as Record<string, unknown>)[key] : undefined;
  }, obj as unknown);
}

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, variables?: Record<string, string | number>) => string;
  tArray: (key: string) => string[];
  formatRelativeTime: (date: Date) => string;
  locales: Locale[];
  localeNames: Record<Locale, string>;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('locale');
    if (stored && (stored === 'en' || stored === 'vi')) {
      setLocaleState(stored);
    }
    setIsInitialized(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
    document.documentElement.lang = newLocale;
  }, []);

  // Simple t() function with variable interpolation
  const t = useCallback((key: string, variables?: Record<string, string | number>): string => {
    const value = getNestedValue(translations[locale] as Record<string, unknown>, key);
    let result: string;
    if (typeof value === 'string') {
      result = value;
    } else {
      // Fallback to English
      const fallback = getNestedValue(translations.en as Record<string, unknown>, key);
      if (typeof fallback === 'string') {
        result = fallback;
      } else {
        return key;
      }
    }
    // Replace {{variable}} patterns with actual values
    if (variables) {
      return result.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
        return variables[varName]?.toString() ?? match;
      });
    }
    return result;
  }, [locale]);

  // Simple tArray() function for arrays
  const tArray = useCallback((key: string): string[] => {
    const value = getNestedValue(translations[locale] as Record<string, unknown>, key);
    if (Array.isArray(value)) return value as string[];
    // Fallback to English
    const fallback = getNestedValue(translations.en as Record<string, unknown>, key);
    if (Array.isArray(fallback)) return fallback as string[];
    return [];
  }, [locale]);

  // Format relative time (e.g., "5 minutes ago")
  const formatRelativeTime = useCallback((date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('time.justNow');
    if (diffMins < 60) return t('time.minutesAgo').replace('{{count}}', String(diffMins));
    if (diffHours < 24) return t('time.hoursAgo').replace('{{count}}', String(diffHours));
    if (diffDays < 7) return t('time.daysAgo').replace('{{count}}', String(diffDays));
    return t('time.weeksAgo').replace('{{count}}', String(Math.floor(diffDays / 7)));
  }, [t]);

  if (!isInitialized && typeof window !== 'undefined') {
    return null;
  }

  return (
    <I18nContext.Provider value={{
      locale,
      setLocale,
      t,
      tArray,
      formatRelativeTime,
      locales,
      localeNames,
    }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}
