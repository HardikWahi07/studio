
'use client';

import {
  getAuth,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { initializeApp, getApps, getApp } from 'firebase/app';

// ✅ Ensure Firebase is initialized only once
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);


// ✅ Email Sign-Up
export async function handleEmailSignUp(email: string, password: string, displayName: string): Promise<void> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
  } catch (error: any) {
    console.error('Error during Email sign-up:', error);
    if (error instanceof FirebaseError) {
      if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Email/Password Sign-Up is not enabled in your Firebase console.');
      }
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('This email is already in use. Please sign in or use a different email.');
      }
    }
    throw new Error(error.message || 'An unknown error occurred during sign-up.');
  }
}

// ✅ Email Sign-In
export async function handleEmailSignIn(email: string, password: string): Promise<void> {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    console.error('Error during Email sign-in:', error);
    if (
      error.code === 'auth/user-not-found' ||
      error.code === 'auth/wrong-password' ||
      error.code === 'auth/invalid-credential'
    ) {
      throw new Error('Invalid email or password. Please try again.');
    }
    throw new Error(error.message || 'An unknown error occurred during sign-in.');
  }
}

// ✅ Sign-Out
export function handleSignOut(): void {
  signOut(auth).catch((error) => {
    console.error('Error during sign-out:', error);
  });
}
