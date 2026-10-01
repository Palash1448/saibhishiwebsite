import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ConfirmationProvider } from './context/ConfirmationContext';
import { DataProvider } from './context/DataContext';

import { AdminLayout } from './components/layout/AdminLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

// Members
import { MembersListPage } from './pages/members/MembersListPage';
import { MemberProfilePage } from './pages/members/MemberProfilePage';
import { AddMemberPage } from './pages/members/AddMemberPage';

// Bhishi
import { BhishiPlansPage } from './pages/bhishi/BhishiPlansPage';
import { BhishiMembershipsPage } from './pages/bhishi/BhishiMembershipsPage';
import { MonthlyCollectionsPage } from './pages/bhishi/MonthlyCollectionsPage';
import { ReturnsInterestPage } from './pages/bhishi/ReturnsInterestPage';

// Loans
import { LoansListPage } from './pages/loans/LoansListPage';
import { IssueLoanPage } from './pages/loans/IssueLoanPage';
import { LoanDetailPage } from './pages/loans/LoanDetailPage';
import { LoanRepaymentsPage } from './pages/loans/LoanRepaymentsPage';
import { OutstandingLoansPage } from './pages/loans/OutstandingLoansPage';

// Other Modules
import { TransactionsPage } from './pages/TransactionsPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { ReportsPage } from './pages/ReportsPage';
import { CalculatorsPage } from './pages/CalculatorsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { NotFoundPage } from './pages/NotFoundPage';

import { SplashScreen } from './components/common/SplashScreen';

// Loading / Splash Screen Component
const AuthLoadingScreen: React.FC = () => (
  <SplashScreen minDuration={1800} />
);

// Protected Route Wrapper - Requires Authenticated Firebase Admin
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Only Route Wrapper - Redirects logged-in users to Dashboard
const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export function App() {
  const [showInitialSplash, setShowInitialSplash] = React.useState(() => {
    // Only show once per tab session or fresh load
    return !sessionStorage.getItem('saibhishi_splash_shown');
  });

  const handleSplashFinish = () => {
    sessionStorage.setItem('saibhishi_splash_shown', 'true');
    setShowInitialSplash(false);
  };

  return (
    <>
      {showInitialSplash && (
        <SplashScreen
          minDuration={2200}
          showSkip={true}
          onFinish={handleSplashFinish}
        />
      )}
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <ConfirmationProvider>
              <DataProvider>
                <Routes>
                  {/* Public Authentication Route */}
                  <Route
                    path="/login"
                    element={
                      <PublicOnlyRoute>
                        <LoginPage />
                      </PublicOnlyRoute>
                    }
                  />

                  {/* Protected Admin Routes */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <AdminLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<DashboardPage />} />

                    {/* Members */}
                    <Route path="members" element={<MembersListPage />} />
                    <Route path="members/add" element={<AddMemberPage />} />
                    <Route path="members/:id" element={<MemberProfilePage />} />

                    {/* Bhishi / Investments */}
                    <Route path="bhishi/plans" element={<BhishiPlansPage />} />
                    <Route path="bhishi/memberships" element={<BhishiMembershipsPage />} />
                    <Route path="bhishi/collections" element={<MonthlyCollectionsPage />} />
                    <Route path="bhishi/returns" element={<ReturnsInterestPage />} />

                    {/* Loans */}
                    <Route path="loans" element={<LoansListPage />} />
                    <Route path="loans/issue" element={<IssueLoanPage />} />
                    <Route path="loans/repayments" element={<LoanRepaymentsPage />} />
                    <Route path="loans/outstanding" element={<OutstandingLoansPage />} />
                    <Route path="loans/:id" element={<LoanDetailPage />} />

                    {/* Core Ledger & Business Modules */}
                    <Route path="transactions" element={<TransactionsPage />} />
                    <Route path="expenses" element={<ExpensesPage />} />
                    <Route path="reports" element={<ReportsPage />} />
                    <Route path="calculators" element={<CalculatorsPage />} />
                    <Route path="audit-logs" element={<AuditLogsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                  </Route>

                  {/* 404 Route */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </DataProvider>
            </ConfirmationProvider>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
