import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser, AuthState } from '../types/user';
import { loginAdmin, logoutAdmin, requestPasswordReset, subscribeToAuthState, DEMO_ADMIN_USER } from '../firebase/auth';
import { isFirebaseConfigured } from '../firebase/config';

interface AuthContextType extends AuthState {
  login: (email: string, pass: string) => Promise<AdminUser>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  switchUserRole: (role: 'super_admin' | 'admin' | 'manager' | 'viewer') => void;
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
    // Default to DEMO_ADMIN_USER for instant out-of-the-box evaluation if not set
    return DEMO_ADMIN_USER;
  });

  const [loading, setLoading] = useState<boolean>(false);
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

  const switchUserRole = (role: 'super_admin' | 'admin' | 'manager' | 'viewer') => {
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
