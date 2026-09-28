export type UserRole = 'super_admin' | 'admin' | 'manager' | 'viewer';

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phoneNumber?: string;
  photoURL?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface AuthState {
  user: AdminUser | null;
  loading: boolean;
  error: string | null;
  isDemoMode: boolean;
}
