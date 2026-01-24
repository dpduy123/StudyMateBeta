'use client';

import { useTranslation } from '@/lib/i18n/context';
import { Locale } from '@/lib/i18n';
import { Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'buttons' | 'compact';
  className?: string;
}

export function LanguageSelector({ variant = 'dropdown', className = '' }: LanguageSelectorProps) {
  const { locale, setLocale, locales, localeNames, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Flag icons for each locale
  const flags: Record<Locale, string> = {
    en: '🇺🇸',
    vi: '🇻🇳',
  };

  if (variant === 'buttons') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {locales.map((loc) => (
          <button
            key={loc}
            onClick={() => setLocale(loc)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              locale === loc
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            {flags[loc]} {localeNames[loc]}
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label={t('settings.language.select')}
        >
          <span>{flags[locale]}</span>
          <span className="hidden sm:inline">{locale.toUpperCase()}</span>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => {
                  setLocale(loc);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  locale === loc ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <span>{flags[loc]}</span>
                <span>{localeNames[loc]}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
        aria-label={t('settings.language.select')}
      >
        <Globe className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {flags[locale]} {localeNames[locale]}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            {t('settings.language.select')}
          </div>
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => {
                setLocale(loc);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                locale === loc ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
              }`}
            >
              <span className="text-lg">{flags[loc]}</span>
              <div>
                <div
                  className={`text-sm font-medium ${
                    locale === loc ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {localeNames[loc]}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {loc === 'en' ? 'English' : 'Vietnamese'}
                </div>
              </div>
              {locale === loc && (
                <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
