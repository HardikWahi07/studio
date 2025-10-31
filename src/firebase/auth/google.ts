
'use client';

import { getAuth, signInWithPopup, signInWithRedirect, GoogleAuthProvider, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

const provider = new GoogleAuthProvider();

export async function handleGoogleSignIn() {
  const auth = getAuth();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    console.error('Error during Google sign-in:', error);
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
      // If popup is blocked, fall back to redirect method.
      // This will navigate the user to the Google sign-in page
      // and then redirect back to your app.
      console.log('Popup blocked, falling back to redirect sign-in.');
      await signInWithRedirect(auth, provider);
      // No need to return anything here, as the page will redirect.
      // Firebase auth state observer will handle the user session on return.
    } else {
      // For other errors, throw the original message for debugging.
      throw new Error(error.message || 'An unknown error occurred during sign-in.');
    }
  }
}

export async function handleEmailSignUp(email: string, password: string, displayName: string): Promise<void> {
  const auth = getAuth();
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
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
    console.error('Error during Email sign-in:', error);
    if (error instanceof FirebaseError) {
       if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Email/Password Sign-In is not enabled. Please enable it in your Firebase console.');
      }
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        throw new Error('Invalid email or password. Please try again.');
      }
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
