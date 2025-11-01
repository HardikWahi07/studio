'use client';

import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

const provider = new GoogleAuthProvider();

export async function handleGoogleSignIn() {
  const auth = getAuth();
  try {
    // Using redirect instead of popup for better compatibility
    await signInWithRedirect(auth, provider);
  } catch (error: any) {
    console.error('Error during Google sign-in redirect:', error);
    throw new Error(error.message || 'An unknown error occurred during sign-in.');
  }
}

export async function handleRedirectResult() {
    const auth = getAuth();
    try {
        const result = await getRedirectResult(auth);
        if (result) {
            // User signed in.
            return result.user;
        }
        return null;
    } catch (error: any) {
        // Handle Errors here.
        console.error('Error handling redirect result:', error);
        throw new Error(error.message || 'Failed to handle sign-in redirect.');
    }
}


export async function handleEmailSignUp(email: string, password: string, displayName: string): Promise<void> {
  const auth = getAuth();
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName });
    }
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
