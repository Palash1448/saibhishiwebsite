import {
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './config';
import { AdminUser } from '../types/user';

export const DEMO_ADMIN_USER: AdminUser = {
  uid: 'demo-admin-uid-101',
  email: 'admin@saibhishi.com',
  displayName: 'Shri Ganesh (Super Admin)',
  role: 'super_admin',
  phoneNumber: '+91 98765 43210',
  photoURL: '',
  isActive: true,
  createdAt: '2025-01-01T00:00:00.000Z',
  lastLoginAt: new Date().toISOString(),
};

/**
 * Sign in admin user with email and password
 */
export async function loginAdmin(email: string, password: string): Promise<AdminUser> {
  // If demo credentials or Firebase not configured, provide realistic local demo login
  if (!isFirebaseConfigured || email.toLowerCase() === 'admin@saibhishi.com' && password === 'admin123') {
    const user: AdminUser = {
      ...DEMO_ADMIN_USER,
      email,
      lastLoginAt: new Date().toISOString(),
    };
    localStorage.setItem('saibhishi_auth_user', JSON.stringify(user));
    return user;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const fbUser = userCredential.user;

    // Fetch user profile from Firestore admins collection
    let adminProfile: AdminUser = {
      uid: fbUser.uid,
      email: fbUser.email || email,
      displayName: fbUser.displayName || 'Finance Administrator',
      role: 'admin',
      phoneNumber: fbUser.phoneNumber || undefined,
      photoURL: fbUser.photoURL || undefined,
      isActive: true,
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    try {
      const adminDocRef = doc(db, 'admins', fbUser.uid);
      const adminDoc = await getDoc(adminDocRef);
      if (adminDoc.exists()) {
        adminProfile = { ...adminProfile, ...(adminDoc.data() as AdminUser) };
      } else {
        await setDoc(adminDocRef, adminProfile);
      }
    } catch {
      // fallback
    }

    localStorage.setItem('saibhishi_auth_user', JSON.stringify(adminProfile));
    return adminProfile;
  } catch (error: any) {
    console.error('Firebase Auth Error:', error);
    throw new Error(error.message || 'Failed to authenticate');
  }
}

/**
 * Sign out admin user
 */
export async function logoutAdmin(): Promise<void> {
  localStorage.removeItem('saibhishi_auth_user');
  if (isFirebaseConfigured) {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Sign out error:', e);
    }
  }
}

/**
 * Send password reset email
 */
export async function requestPasswordReset(email: string): Promise<void> {
  if (!isFirebaseConfigured) {
    // Demo mode simulated reset
    return new Promise((res) => setTimeout(res, 800));
  }
  await sendPasswordResetEmail(auth, email);
}

/**
 * Subscribe to authentication state changes
 */
export function subscribeToAuthState(callback: (user: AdminUser | null) => void): () => void {
  // Check localStorage first
  const cached = localStorage.getItem('saibhishi_auth_user');
  if (cached) {
    try {
      callback(JSON.parse(cached));
    } catch {
      // ignore
    }
  }

  if (!isFirebaseConfigured) {
    return () => {};
  }

  return onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
    if (fbUser) {
      try {
        const adminDoc = await getDoc(doc(db, 'admins', fbUser.uid));
        if (adminDoc.exists()) {
          const user = adminDoc.data() as AdminUser;
          callback(user);
          localStorage.setItem('saibhishi_auth_user', JSON.stringify(user));
          return;
        }
      } catch (e) {
        console.warn('Could not fetch Firestore admin profile:', e);
      }

      const defaultAdmin: AdminUser = {
        uid: fbUser.uid,
        email: fbUser.email || '',
        displayName: fbUser.displayName || 'Admin',
        role: 'admin',
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      callback(defaultAdmin);
    } else {
      callback(null);
      localStorage.removeItem('saibhishi_auth_user');
    }
  });
}
