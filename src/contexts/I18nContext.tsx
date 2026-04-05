"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation'; // 🟢 Import crucial

// Imports statiques
import fr from '@/dictionaries/fr.json';
import en from '@/dictionaries/en.json';
import nl from '@/dictionaries/nl.json';
import es from '@/dictionaries/es.json';
import pl from '@/dictionaries/pl.json'; // 🟢 Ajouté
import ar from '@/dictionaries/ar.json'; // 🟢 Ajouté

const dictionaries: any = { fr, en, nl, es, pl, ar };
type Language = 'fr' | 'en' | 'nl' | 'es' | 'pl' | 'ar';

interface I18nContextType {
  locale: Language;
  setLocale: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => any;
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = ({ children, initialLocale }: { children: React.ReactNode; initialLocale?: Language }) => {
  const params = useParams();
  
  // 🟢 On synchronise la locale avec l'URL en priorité
  const localeFromUrl = (params?.locale as Language);
  
  const [locale, setLocaleState] = useState<Language>(localeFromUrl || initialLocale || 'fr');

  // 🟢 Effet de synchronisation : si l'URL change, on met à jour l'état
  useEffect(() => {
    if (localeFromUrl && localeFromUrl !== locale) {
      setLocaleState(localeFromUrl);
    }
  }, [localeFromUrl, locale]);

  const dictionary = useMemo(() => dictionaries[locale] || dictionaries.fr, [locale]);

  const setLocale = useCallback((newLang: Language) => {
    if (newLang === locale) return;

    // Mise à jour du cookie pour le SSR
    document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
    
    setLocaleState(newLang);
    // Note : Le changement d'URL réel doit être géré dans la Navbar via router.push
  }, [locale]);

  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    const keys = key.split('.');
    let value = dictionary;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }
    if (typeof value === 'string' && params) {
      return value.replace(/\{(\w+)\}/g, (_, p) => params[p]?.toString() || `{${p}}`);
    }
    return value;
  }, [dictionary]);

  return (
    <I18nContext.Provider value={{ 
      locale, 
      setLocale, 
      t, 
      dir: locale === 'ar' ? 'rtl' : 'ltr' 
    }}>
      <div dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) return { locale: 'fr' as Language, t: (k: string) => k, setLocale: () => {}, dir: 'ltr' };
  return context;
};