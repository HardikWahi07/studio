'use client';

import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

const provider = new GoogleAuthProvider();

export async function handleGoogleSignIn() {
  const auth = getAuth();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Error during Google sign-in:', error);
    if (error instanceof FirebaseError) {
      if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Google Sign-In is not enabled. Please enable it in your Firebase console.');
      }
      throw new Error(error.message);
    }
    throw new Error('An unknown error occurred during sign-in.');
  }
}

export async function handleEmailSignUp(email: string, password: string, displayName: string): Promise<void> {
  const auth = getAuth();
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName });
    }
  } catch (error) {
    console.error('Error during Email sign-up:', error);
    if (error instanceof FirebaseError) {
      if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Email/Password Sign-Up is not enabled. Please enable it in your Firebase console.');
      }
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('This email is already in use. Please sign in or use a different email.');
      }
      throw new Error(error.message);
    }
    throw new Error('An unknown error occurred during sign-up.');
  }
}

export async function handleEmailSignIn(email: string, password: string): Promise<void> {
  const auth = getAuth();
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Error during Email sign-in:', error);
    if (error instanceof FirebaseError) {
       if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Email/Password Sign-In is not enabled. Please enable it in your Firebase console.');
      }
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        throw new Error('Invalid email or password. Please try again.');
      }
      throw new Error(error.message);
    }
    throw new Error('An unknown error occurred during sign-in.');
  }
}


export function handleSignOut() {
  const auth = getAuth();
  signOut(auth).catch((error) => {
    console.error('Error during sign-out:', error);
  });
}
