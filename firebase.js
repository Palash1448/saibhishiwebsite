// SaiBhishi - Firebase Configuration & SDK Initialization
// Project: bhishi-a61c1

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// -------------------------------------------------------------
// Firebase Config Object
// -------------------------------------------------------------
export const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "AIzaSyBehS3RC9ESa4L5EXY-marowirdNzaGgsU",
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "bhishi-a61c1.firebaseapp.com",
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "bhishi-a61c1",
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "bhishi-a61c1.firebasestorage.app",
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "545270942699",
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || "1:545270942699:web:3a1c1dcd0001e20a7fa7ae",
  measurementId: import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID || "G-CRRFX6RMJZ",
};

// Check if valid Firebase configuration is active
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes('your_firebase_api_key')
);

// Initialize Firebase App safely (singleton pattern)
export const app = getApps().length > 0
  ? getApp()
  : initializeApp(firebaseConfig);

// Export Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Export Auth Methods
export {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
};

// Export Firestore Methods
export {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  writeBatch,
};

// Default export
export default app;
