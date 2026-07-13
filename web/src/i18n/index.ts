import { translations, type Lang, type Translations } from './translations';

export type { Lang, Translations };

export const DEFAULT_LANG: Lang = 'es';

export function getLang(lang?: string): Lang {
  if (lang === 'es' || lang === 'en') return lang;
  return DEFAULT_LANG;
}

export function useTranslations(lang: Lang) {
  return (key: keyof Translations) => translations[lang][key];
}

export { translations };
