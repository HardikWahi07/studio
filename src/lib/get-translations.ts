
import 'server-only';
import { en } from '@/translations/en';
import { es } from '@/translations/es';
import { hi } from '@/translations/hi';
import { ur } from '@/translations/ur';

const dictionaries = {
  en: () => en,
  es: () => es,
  hi: () => hi,
  ur: () => ur,
  de: () => en, // Fallback to English
  fr: () => en, // Fallback to English
};

type Locale = keyof typeof dictionaries;

function isLocale(locale: string): locale is Locale {
    return Object.keys(dictionaries).includes(locale);
}

export const getTranslations = async (locale: string) => {
    const validLocale = isLocale(locale) ? locale : 'en';
    const dict = dictionaries[validLocale]();

    return (key: string, params?: { [key: string]: string | number }) => {
        const keys = key.split('.');
        let result: any = dict;
        for (const k of keys) {
            result = result?.[k];
            if (result === undefined) {
                console.warn(`Translation key not found: ${key}`);
                return key;
            }
        }

        if (typeof result === 'string' && params) {
            return result.replace(/\{(\w+)\}/g, (match, paramKey) => {
                return params[paramKey] !== undefined ? String(params[paramKey]) : match;
            });
        }
        
        return result;
    };
};
