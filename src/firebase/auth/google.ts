'use client';

import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

const provider = new GoogleAuthProvider();

export function handleSignIn() {
  const auth = getAuth();
  signInWithPopup(auth, provider)
    .catch((error) => {
      console.error('Error during sign-in:', error);
    });
}

export function handleSignOut() {
  const auth = getAuth();
  signOut(auth).catch((error) => {
    console.error('Error during sign-out:', error);
  });
}
