
'use client';
import React, { createContext, ReactNode, useMemo } from 'react';
import { en } from '@/translations/en';
import { es } from '@/translations/es';
import { hi } from '@/translations/hi';
import { ur } from '@/translations/ur';
import { de } from '@/translations/de';
import { fr } from '@/translations/fr';

const dictionaries: any = { en, es, hi, ur, de, fr };

type Translator = (key: string, params?: { [key: string]: string | number }) => string;

interface I18nContextType {
  locale: string;
  t: Translator;
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children, locale }: { children: ReactNode; locale: string }) {
  const t = useMemo((): Translator => {
    const dictionary = dictionaries[locale] || dictionaries.en;
    return (key: string, params?: { [key: string]: string | number }) => {
      const keys = key.split('.');
      let result: any = dictionary;
      for (const k of keys) {
        result = result?.[k];
        if (result === undefined) {
          // Fallback to English if key not found in current locale
          let fallbackResult: any = dictionaries.en;
          for (const fk of keys) {
            fallbackResult = fallbackResult?.[fk];
            if (fallbackResult === undefined) {
              console.warn(`Translation key "${key}" not found in locale "${locale}" or fallback "en".`);
              return key;
            }
          }
          result = fallbackResult;
          break; // Exit the loop once fallback is found
        }
      }

      if (typeof result === 'string' && params) {
        return result.replace(/\{(\w+)\}/g, (match, paramKey) => {
          return params[paramKey] !== undefined ? String(params[paramKey]) : match;
        });
      }
      
      return result || key;
    };
  }, [locale]);

  const value = { locale, t };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
