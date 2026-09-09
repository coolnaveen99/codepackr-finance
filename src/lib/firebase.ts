import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// Centralized Firebase configuration for CodePackr Finance
// Users can override via VITE_FIREBASE_* variables or pass new account details.
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyARUk9QZbmUSWPT4oHIwm7ho6l0trjrem8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "codepackr-cf6b1.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "codepackr-cf6b1",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "codepackr-cf6b1.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "779918234930",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:779918234930:web:a94837a6204de9026a732b",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-TC54P43M6G",
};

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firestoreDb: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null;
  try {
    if (!firebaseApp) {
      firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    }
    return firebaseApp;
  } catch (err) {
    console.warn("[CodePackr] Firebase initialization fallback:", err);
    return null;
  }
}

export function getFirebaseAuth(): Auth | null {
  if (typeof window === "undefined") return null;
  try {
    if (!firebaseAuth) {
      const app = getFirebaseApp();
      if (app) {
        firebaseAuth = getAuth(app);
      }
    }
    return firebaseAuth;
  } catch (err) {
    console.warn("[CodePackr] Firebase Auth fallback:", err);
    return null;
  }
}

export function getFirebaseFirestore(): Firestore | null {
  if (typeof window === "undefined") return null;
  try {
    if (!firestoreDb) {
      const app = getFirebaseApp();
      if (app) {
        firestoreDb = getFirestore(app);
      }
    }
    return firestoreDb;
  } catch (err) {
    console.warn("[CodePackr] Firestore fallback:", err);
    return null;
  }
}
