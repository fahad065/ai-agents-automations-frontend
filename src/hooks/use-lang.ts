"use client";

import { useEffect, useState, useCallback } from 'react';

export type Lang = 'en' | 'ar';

export function useLang() {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    const stored = (localStorage.getItem('lm_lang') || 'en') as Lang;
    setLangState(stored);

    // Listen for language changes dispatched from the navbar
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<Lang>).detail;
      setLangState(detail);
    };
    window.addEventListener('lm_lang_change', handler);
    return () => window.removeEventListener('lm_lang_change', handler);
  }, []);

  const setLang = useCallback((l: Lang) => {
    localStorage.setItem('lm_lang', l);
    setLangState(l);
    window.dispatchEvent(new CustomEvent('lm_lang_change', { detail: l }));
  }, []);

  const isAr = lang === 'ar';

  return { lang, setLang, isAr };
}
