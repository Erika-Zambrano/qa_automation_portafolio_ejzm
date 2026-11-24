import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { translations, type Lang, type Translations } from '../i18n/translations';

const STORAGE_KEY = 'cv-lang';

type Key = keyof Translations;

type LangContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: Key) => string;
  list: (key: Key) => string[];
  withLang: (path: string) => string;
};

const LangContext = createContext<LangContextValue | null>(null);

const isLang = (value: string | null): value is Lang => value === 'es' || value === 'en';

function readLang(param: string | null): Lang {
  if (isLang(param)) return param;
  const saved = localStorage.getItem(STORAGE_KEY);
  return isLang(saved) ? saved : 'es';
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [params, setParams] = useSearchParams();
  const lang = readLang(params.get('lang'));

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const setLang = useCallback(
    (next: Lang) => {
      localStorage.setItem(STORAGE_KEY, next);
      const nextParams = new URLSearchParams(params);
      nextParams.set('lang', next);
      setParams(nextParams, { replace: true });
    },
    [params, setParams],
  );

  const value = useMemo<LangContextValue>(
    () => ({
      lang,
      setLang,
      t: (key) => translations[lang][key] as string,
      list: (key) => translations[lang][key] as unknown as string[],
      withLang: (path) => `${path}?lang=${lang}`,
    }),
    [lang, setLang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
}
