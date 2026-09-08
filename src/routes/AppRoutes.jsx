import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import ChangePasswordPage from '../pages/ChangePasswordPage';
import CustomerDashboard from '../pages/CustomerDashboard';
import AdminPortal from '../pages/AdminPortal';
import PublicInvitationPage from '../pages/PublicInvitationPage';
import PreviewPage from '../pages/PreviewPage';

function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-viewport" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid rgba(255, 77, 109, 0.2)',
          borderTopColor: '#ff4d6d',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Enforce password change on first login
  if (user?.mustChangePassword && window.location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/d/:slug" element={<PublicInvitationPage />} />

      {/* Authenticated Pages */}
      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePasswordPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredRole="customer">
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminPortal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/preview/:publicId"
        element={
          <ProtectedRoute>
            <PreviewPage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
