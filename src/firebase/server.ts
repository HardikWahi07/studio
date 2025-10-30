
// src/firebase/server.ts
import { initializeApp, getApps, getApp, App, cert } from 'firebase-admin/app';
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
    // use the project's service account credentials if `GOOGLE_APPLICATION_CREDENTIALS` is set.
    // For local development and other environments, we explicitly provide the credential.
    try {
      const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS!);
      initializeApp({
        credential: cert(serviceAccount),
        projectId: firebaseConfig.projectId,
      });
    } catch (e) {
      console.error("Firebase Admin SDK initialization failed. Ensure GOOGLE_APPLICATION_CREDENTIALS is set and valid.", e);
       // Fallback for environments where ADC is set up differently but GOOGLE_APPLICATION_CREDENTIALS env var is not a JSON string.
       initializeApp({
          projectId: firebaseConfig.projectId,
       });
    }
  }

  const app = getApp();
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  return { app, auth, firestore };
}
