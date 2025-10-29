
// src/firebase/server.ts
import { initializeApp, getApps, getApp, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

interface FirebaseServerServices {
  app: App;
  auth: Auth;
  firestore: Firestore;
}

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase(): FirebaseServerServices {
  if (!getApps().length) {
    // When running in a Google Cloud environment, the SDK will automatically
    // use the project's service account credentials.
    // For local development, you need to set up the GOOGLE_APPLICATION_CREDENTIALS
    // environment variable.
    initializeApp({
        // projectId is needed for the emulator to work
        projectId: firebaseConfig.projectId,
    });
  }

  const app = getApp();
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  return { app, auth, firestore };
}
