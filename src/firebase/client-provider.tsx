
'use client';

import React, { useMemo, useEffect, useState, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { handleRedirectResult } from './auth/google';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from '@/hooks/use-translations';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const { toast } = useToast();
  const t = useTranslations();
  const [isHandlingRedirect, setIsHandlingRedirect] = useState(true);

  const firebaseServices = useMemo(() => {
    // Initialize Firebase on the client side, once per component mount.
    return initializeFirebase();
  }, []);

  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const user = await handleRedirectResult();
        if (user) {
          toast({ title: t('AuthDialog.welcomeToast') });
        }
      } catch (error: any) {
        toast({ title: t('AuthDialog.signInError'), description: error.message, variant: "destructive" });
      } finally {
        setIsHandlingRedirect(false);
      }
    };
    
    // Only run this once on initial load
    if (isHandlingRedirect) {
        checkRedirect();
    }
  }, [isHandlingRedirect, t, toast]);


  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
