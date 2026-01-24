import en from '@/locales/en.json';
import vi from '@/locales/vi.json';

export type Locale = 'en' | 'vi';

export const locales: Locale[] = ['en', 'vi'];

export const defaultLocale: Locale = 'en'; // Default to English

export const localeNames: Record<Locale, string> = {
  en: 'English',
  vi: 'Tiếng Việt',
};

export const translations = {
  en,
  vi,
} as const;

export type Translations = typeof en;

/**
 * Get nested value from object using dot notation
 * Example: getNestedValue(obj, 'common.loading') => obj.common.loading
 */
function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return typeof current === 'string' ? current : undefined;
}

/**
 * Get nested array value from object using dot notation
 * Example: getNestedArrayValue(obj, 'pricing.basic.features') => ['feature1', 'feature2']
 */
function getNestedArrayValue(obj: Record<string, unknown>, path: string): string[] | undefined {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return Array.isArray(current) ? current as string[] : undefined;
}

/**
 * Replace template variables in a string
 * Example: interpolate('Hello {{name}}', { name: 'World' }) => 'Hello World'
 */
function interpolate(template: string, variables?: Record<string, string | number>): string {
  if (!variables) return template;

  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key]?.toString() ?? match;
  });
}

/**
 * Get translation for a key with optional interpolation
 */
export function t(
  locale: Locale,
  key: string,
  variables?: Record<string, string | number>
): string {
  const translation = getNestedValue(translations[locale] as Record<string, unknown>, key);

  if (translation === undefined) {
    // Fallback to English if Vietnamese translation is missing
    if (locale !== 'en') {
      const fallback = getNestedValue(translations.en as Record<string, unknown>, key);
      if (fallback) {
        return interpolate(fallback, variables);
      }
    }
    // Return key if no translation found
    console.warn(`Missing translation for key: ${key}`);
    return key;
  }

  return interpolate(translation, variables);
}

/**
 * Get array translation for a key
 */
export function tArray(
  locale: Locale,
  key: string
): string[] {
  const translation = getNestedArrayValue(translations[locale] as Record<string, unknown>, key);

  if (translation === undefined) {
    // Fallback to English if Vietnamese translation is missing
    if (locale !== 'en') {
      const fallback = getNestedArrayValue(translations.en as Record<string, unknown>, key);
      if (fallback) {
        return fallback;
      }
    }
    // Return empty array if no translation found
    console.warn(`Missing array translation for key: ${key}`);
    return [];
  }

  return translation;
}

/**
 * Get locale from browser or cookie
 */
export function detectLocale(): Locale {
  if (typeof window === 'undefined') {
    return defaultLocale;
  }

  // Check localStorage first
  const stored = localStorage.getItem('locale');
  if (stored && locales.includes(stored as Locale)) {
    return stored as Locale;
  }

  // Check browser language
  const browserLang = navigator.language.split('-')[0];
  if (locales.includes(browserLang as Locale)) {
    return browserLang as Locale;
  }

  return defaultLocale;
}

/**
 * Save locale preference
 */
export function setLocale(locale: Locale): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('locale', locale);
  }
}

/**
 * Format date according to locale
 */
export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Format number according to locale
 */
export function formatNumber(num: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US').format(num);
}

/**
 * Format currency according to locale
 */
export function formatCurrency(amount: number, locale: Locale): string {
  if (locale === 'vi') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Format relative time (e.g., "5 minutes ago")
 */
export function formatRelativeTime(date: Date, locale: Locale): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMins < 1) {
    return t(locale, 'time.justNow');
  }
  if (diffMins < 60) {
    return t(locale, 'time.minutesAgo', { count: diffMins });
  }
  if (diffHours < 24) {
    return t(locale, 'time.hoursAgo', { count: diffHours });
  }
  if (diffDays < 7) {
    return t(locale, 'time.daysAgo', { count: diffDays });
  }
  return t(locale, 'time.weeksAgo', { count: diffWeeks });
}
