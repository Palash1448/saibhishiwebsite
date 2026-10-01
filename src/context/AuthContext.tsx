import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser, AuthState, UserRole } from '../types/user';
import {
  loginAdmin,
  registerAdmin,
  logoutAdmin,
  requestPasswordReset,
  subscribeToAuthState,
} from '../firebase/auth';
import { isFirebaseConfigured } from '../firebase/config';

interface AuthContextType extends AuthState {
  login: (email: string, pass: string) => Promise<AdminUser>;
  register: (email: string, pass: string, displayName: string, role?: UserRole) => Promise<AdminUser>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  switchUserRole: (role: UserRole) => void;
  isSuperAdmin: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    const cached = localStorage.getItem('saibhishi_auth_user');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string): Promise<AdminUser> => {
    setLoading(true);
    setError(null);
    try {
      const loggedUser = await loginAdmin(email, pass);
      setUser(loggedUser);
      return loggedUser;
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    pass: string,
    displayName: string,
    role: UserRole = 'admin'
  ): Promise<AdminUser> => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await registerAdmin(email, pass, displayName, role);
      setUser(newUser);
      return newUser;
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await logoutAdmin();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    await requestPasswordReset(email);
  };

  const switchUserRole = (role: UserRole) => {
    if (!user) return;
    const updated = { ...user, role };
    setUser(updated);
    localStorage.setItem('saibhishi_auth_user', JSON.stringify(updated));
  };

  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isDemoMode: !isFirebaseConfigured,
        login,
        register,
        logout,
        resetPassword,
        switchUserRole,
        isSuperAdmin,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
