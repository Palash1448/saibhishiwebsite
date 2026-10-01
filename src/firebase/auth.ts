import {
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './config';
import { AdminUser, UserRole } from '../types/user';

/**
 * Sign in admin user with email and password via Firebase Auth
 */
export async function loginAdmin(email: string, password: string): Promise<AdminUser> {
  const cleanEmail = email.trim();

  if (!isFirebaseConfigured) {
    throw new Error(
      'Cloud authentication service is not configured yet. Please verify credentials in .env.'
    );
  }

  try {
    console.log(`[SaiBhishi Auth] Attempting Firebase sign-in for: ${cleanEmail}`);
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
    const fbUser = userCredential.user;
    console.log(`[SaiBhishi Auth] Successfully authenticated UID: ${fbUser.uid}`);

    // Create base admin profile from authenticated Firebase User
    let adminProfile: AdminUser = {
      uid: fbUser.uid,
      email: fbUser.email || cleanEmail,
      displayName: fbUser.displayName || 'Administrator',
      role: 'super_admin',
      phoneNumber: fbUser.phoneNumber || undefined,
      photoURL: fbUser.photoURL || undefined,
      isActive: true,
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // Attempt to sync with Firestore 'admins' collection if database is available
    try {
      const adminDocRef = doc(db, 'admins', fbUser.uid);
      const adminDoc = await getDoc(adminDocRef);
      if (adminDoc.exists()) {
        const existingData = adminDoc.data() as AdminUser;
        adminProfile = {
          ...adminProfile,
          ...existingData,
          lastLoginAt: new Date().toISOString(),
        };
        // Update last login timestamp in background
        setDoc(adminDocRef, { lastLoginAt: new Date().toISOString() }, { merge: true }).catch(() => {});
      } else {
        // Create initial admin document in background
        setDoc(adminDocRef, adminProfile, { merge: true }).catch(() => {});
      }
    } catch (firestoreErr) {
      console.warn('[SaiBhishi Auth] Firestore profile sync note (login still successful):', firestoreErr);
    }

    localStorage.setItem('saibhishi_auth_user', JSON.stringify(adminProfile));
    return adminProfile;
  } catch (error: any) {
    console.error('[SaiBhishi Auth] Firebase Auth Login Error:', error);
    let message = error.message || 'Failed to authenticate';
    
    if (
      error.code === 'auth/invalid-credential' ||
      error.code === 'auth/wrong-password' ||
      error.code === 'auth/user-not-found'
    ) {
      message = 'Invalid email or password. Please check your credentials and try again.';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Please enter a valid email address format.';
    } else if (error.code === 'auth/invalid-api-key' || error.code === 'auth/api-key-not-valid') {
      message = 'Invalid cloud database API key. Please check your configuration in .env.';
    } else if (error.code === 'auth/network-request-failed') {
      message = 'Network error: Failed to reach cloud servers. Please check your internet connection.';
    } else if (error.code === 'auth/user-disabled') {
      message = 'This admin account has been disabled. Please contact your system administrator.';
    } else if (error.code === 'auth/too-many-requests') {
      message = 'Too many failed login attempts. Please wait a moment or reset your password.';
    } else if (error.code === 'auth/operation-not-allowed') {
      message = 'Email/Password sign-in is disabled in security settings.';
    }

    throw new Error(message);
  }
}

/**
 * Register a new admin user in Firebase Auth
 */
export async function registerAdmin(
  email: string,
  password: string,
  displayName: string,
  role: UserRole = 'admin'
): Promise<AdminUser> {
  if (!isFirebaseConfigured) {
    throw new Error('Cloud database is not configured. Please add credentials in .env');
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const fbUser = userCredential.user;

    const newAdmin: AdminUser = {
      uid: fbUser.uid,
      email: fbUser.email || email.trim(),
      displayName: displayName || 'Admin',
      role,
      isActive: true,
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    try {
      const adminDocRef = doc(db, 'admins', fbUser.uid);
      await setDoc(adminDocRef, newAdmin, { merge: true });
    } catch (e) {
      console.warn('Could not write admin doc to Firestore:', e);
    }

    localStorage.setItem('saibhishi_auth_user', JSON.stringify(newAdmin));
    return newAdmin;
  } catch (error: any) {
    console.error('Auth Register Error:', error);
    let message = error.message || 'Failed to create admin user';
    if (error.code === 'auth/email-already-in-use') {
      message = 'An account with this email address already exists.';
    } else if (error.code === 'auth/weak-password') {
      message = 'Password must be at least 6 characters.';
    } else if (error.code === 'auth/operation-not-allowed') {
      message = 'Email/Password registration is disabled in security settings.';
    }
    throw new Error(message);
  }
}

/**
 * Sign out admin user from Firebase Auth
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
 * Send password reset email via Firebase Auth
 */
export async function requestPasswordReset(email: string): Promise<void> {
  if (!isFirebaseConfigured) {
    throw new Error('Cloud database is not configured. Please add credentials in .env');
  }
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Subscribe to authentication state changes via Firebase Auth
 */
export function subscribeToAuthState(callback: (user: AdminUser | null) => void): () => void {
  if (!isFirebaseConfigured) {
    const cached = localStorage.getItem('saibhishi_auth_user');
    callback(cached ? JSON.parse(cached) : null);
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
        role: 'super_admin',
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      callback(defaultAdmin);
      localStorage.setItem('saibhishi_auth_user', JSON.stringify(defaultAdmin));
    } else {
      callback(null);
      localStorage.removeItem('saibhishi_auth_user');
    }
  });
}
