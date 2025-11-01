'use client';

import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

const provider = new GoogleAuthProvider();

export async function handleGoogleSignIn() {
  const auth = getAuth();
  try {
    await signInWithPopup(auth, provider);
  } catch (error: any) {
    console.error('Error during Google sign-in:', error);
    // The "popup closed by user" error is common and often not a true error.
    // We can choose to ignore it or handle it gracefully. For now, we'll re-throw
    // other errors so they can be caught and displayed.
    if (error.code !== 'auth/popup-closed-by-user') {
        throw new Error(error.message || 'An unknown error occurred during sign-in.');
    }
  }
}

export async function handleEmailSignUp(email: string, password: string, displayName: string): Promise<void> {
  const auth = getAuth();
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
  } catch (error: any) {
    console.error('Error during Email sign-up:', error);
    if (error instanceof FirebaseError) {
      if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Email/Password Sign-Up is not enabled. Please enable it in your Firebase console.');
      }
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('This email is already in use. Please sign in or use a different email.');
      }
    }
    throw new Error(error.message || 'An unknown error occurred during sign-up.');
  }
}

export async function handleEmailSignIn(email: string, password: string): Promise<void> {
  const auth = getAuth();
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        throw new Error('Invalid email or password. Please try again.');
      }
      throw new Error(error.message || 'An unknown error occurred during sign-in.');
  }
}


export function handleSignOut() {
  const auth = getAuth();
  signOut(auth).catch((error) => {
    console.error('Error during sign-out:', error);
  });
}
