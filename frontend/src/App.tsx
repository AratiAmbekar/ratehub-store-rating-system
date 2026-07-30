import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './utils/authContext';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { NormalUserDashboard } from './pages/NormalUserDashboard';
import { StoreOwnerDashboard } from './pages/StoreOwnerDashboard';
import { Award, RefreshCw } from 'lucide-react';

const RootApp: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'var(--bg-main)',
          color: 'var(--text-primary)',
          gap: '1rem',
        }}
      >
        <Award size={36} />
        <RefreshCw
          size={24}
          style={{ animation: 'spin 2s linear infinite' }}
        />
        <span>Verifying secure session...</span>
      </div>
    );
  }

  return (
    <Routes>
      {!user ? (
        <>
          <Route path="/" element={<Login />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      ) : user.role === 'ADMIN' ? (
        <>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </>
      ) : user.role === 'STORE_OWNER' ? (
        <>
          <Route path="/store-owner" element={<StoreOwnerDashboard />} />
          <Route path="*" element={<Navigate to="/store-owner" replace />} />
        </>
      ) : (
        <>
          <Route path="/" element={<NormalUserDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <RootApp />
    </AuthProvider>
  );
};

export default App;
