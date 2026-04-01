"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

// Imports statiques pour la rapidité
import fr from '@/dictionaries/fr.json';
import en from '@/dictionaries/en.json';
import nl from '@/dictionaries/nl.json';
import es from '@/dictionaries/es.json';

const dictionaries: any = { fr, en, nl, es };
type Language = 'fr' | 'en' | 'nl' | 'es' | 'pl' | 'ar';

interface I18nContextType {
  locale: Language;
  setLocale: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => any;
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = ({ children, initialLocale }: { children: React.ReactNode; initialLocale?: Language }) => {
  // On initialise strictement avec ce que le serveur nous donne
  const [locale, setLocaleState] = useState<Language>(initialLocale || 'fr');

  const dictionary = useMemo(() => dictionaries[locale] || dictionaries.fr, [locale]);

  const setLocale = useCallback((newLang: Language) => {
    if (newLang === locale) return; // Évite les boucles si la langue est déjà la même

    // 1. On met à jour le cookie pour le prochain passage serveur
    document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
    
    // 2. On met à jour l'état local pour changer les textes immédiatement
    setLocaleState(newLang);
    
    // 3. AU LIEU DE RELOAD : On laisse React faire son travail. 
    // Si tu as vraiment besoin d'un reload, fais-le dans le composant Navbar 
    // après un petit timeout, mais pas ici.
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
    <I18nContext.Provider value={{ locale, setLocale, t, dir: locale === 'ar' ? 'rtl' : 'ltr' }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) return { locale: 'fr', t: (k: string) => k, setLocale: () => {}, dir: 'ltr' };
  return context;
};