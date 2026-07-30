import React, { useState } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../utils/authContext';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onClose }) => {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Validation checks
  const isLengthValid = password.length >= 8 && password.length <= 16;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  const isValid = isLengthValid && hasUppercase && hasSpecialChar;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setMessage(null);
    setError(null);

    const res = await updatePassword(password);
    if (res.data) {
      setMessage('Password updated successfully!');
      setPassword('');
      setTimeout(() => {
        onClose();
        setMessage(null);
      }, 1500);
    } else {
      setError(res.error || 'Failed to update password');
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" id="password-modal-overlay">
      <div className="glass-card modal-content" id="password-modal-content">
        <div className="modal-header">
          <h2>Update Password</h2>
          <button className="modal-close" onClick={onClose} id="close-password-modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {message && (
            <div
              style={{
                color: 'var(--color-success)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              id="password-success-msg"
            >
              <Check size={16} />
              {message}
            </div>
          )}

          {error && (
            <div
              style={{
                color: 'var(--color-error)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              id="password-error-msg"
            >
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="new-password">
              New Password
            </label>
            <input
              type="password"
              id="new-password"
              className="form-control"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* Live checklist */}
            <div className="live-checks" id="password-checks">
              <div className={`live-check-item ${isLengthValid ? 'valid' : ''}`}>
                <Check size={12} />
                8-16 characters
              </div>
              <div className={`live-check-item ${hasUppercase ? 'valid' : ''}`}>
                <Check size={12} />
                At least one uppercase letter
              </div>
              <div className={`live-check-item ${hasSpecialChar ? 'valid' : ''}`}>
                <Check size={12} />
                At least one special character
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              id="cancel-password-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !isValid}
              id="submit-password-btn"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
