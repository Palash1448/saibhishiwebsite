import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Read configuration from Vite environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Check if valid Firebase configuration is provided
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== 'your_api_key_here'
);

// Initialize Firebase App safely
const app = getApps().length > 0 
  ? getApp() 
  : initializeApp(
      isFirebaseConfigured 
        ? firebaseConfig 
        : {
            apiKey: 'AIzaSyDemoDummyApiKeyForLocalDevelopment01',
            authDomain: 'saibhishi-demo.firebaseapp.com',
            projectId: 'saibhishi-demo',
            storageBucket: 'saibhishi-demo.appspot.com',
            messagingSenderId: '123456789012',
            appId: '1:123456789012:web:demo1234567890abcdef',
          }
    );

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
