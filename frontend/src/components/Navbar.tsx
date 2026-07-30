import React, { useState } from 'react';
import { LogOut, Lock, Award } from 'lucide-react';
import { useAuth } from '../utils/authContext';
import { PasswordModal } from './PasswordModal';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  if (!user) return null;

  // Format display role name
  const displayRole = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'System Administrator';
      case 'STORE_OWNER':
        return 'Store Owner';
      default:
        return 'Normal User';
    }
  };

  const getRoleClass = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'badge-admin';
      case 'STORE_OWNER':
        return 'badge-store';
      default:
        return 'badge-user';
    }
  };

  return (
    <>
      <nav className="navbar" id="app-navbar">
        <div className="brand" id="app-brand">
          <Award size={28} style={{ color: 'var(--color-primary)' }} />
          <span>RatingSphere</span>
        </div>

        <div className="nav-user" id="navbar-user-section">
          <div className="user-tag" id="user-tag-details">
            <span className="user-tag-name" id="user-display-name">
              {user.name}
            </span>
            <span className={`badge ${getRoleClass(user.role)}`} id="user-display-role">
              {displayRole(user.role)}
            </span>
          </div>

          {(
            <button
              className="btn btn-secondary"
              onClick={() => setPasswordModalOpen(true)}
              id="change-password-trigger"
              title="Change Password"
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
            >
              <Lock size={16} />
              Password
            </button>
          )}

          <button className="btn btn-danger" onClick={logout} id="logout-btn" title="Log out">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <PasswordModal isOpen={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} />
    </>
  );
};
