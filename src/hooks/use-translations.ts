
'use client';
import { useContext } from 'react';
import { I18nContext } from '@/context/i18n-provider';

export const useTranslations = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useTranslations must be used within an I18nProvider');
  }
  return context.t;
};
// final commit
