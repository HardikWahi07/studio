
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
    // When running in a Google Cloud environment, the SDK automatically
    // uses the project's service account credentials. For local development,
    // ensure the GOOGLE_APPLICATION_CREDENTIALS environment variable is set.
    try {
      const serviceAccountCred = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      if (serviceAccountCred) {
        // If the credential is a JSON string, parse and use it.
        const serviceAccount = JSON.parse(serviceAccountCred);
        initializeApp({
            credential: cert(serviceAccount),
            projectId: firebaseConfig.projectId,
        });
      } else {
        // Otherwise, let Firebase Admin SDK try to find credentials automatically.
        // This works for Cloud environments (like App Hosting) where the env var is not a JSON string but a path,
        // or where Application Default Credentials (ADC) are configured.
        initializeApp({
            projectId: firebaseConfig.projectId,
        });
      }
    } catch (e) {
        console.error("Firebase Admin SDK initialization failed.", e);
        // Provide a clear fallback if everything else fails.
        // This might happen in a misconfigured local environment.
        if (!getApps().length) {
             initializeApp({
                projectId: firebaseConfig.projectId,
             });
        }
    }
  }

  const app = getApp();
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  return { app, auth, firestore };
}
// final commit
