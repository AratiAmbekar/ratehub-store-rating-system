import React, { useState } from 'react';
import { useAuth } from '../utils/authContext';
import { Check, AlertCircle, Sparkles } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, registerUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Live password checks
  const isPasswordLengthValid = password.length >= 8 && password.length <= 16;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  const isPasswordValid = isPasswordLengthValid && hasUppercase && hasSpecialChar;

  // Name check (only relevant on signup)
  const isNameLengthValid = name.length >= 20 && name.length <= 60;
  // Address check (only relevant on signup)
  const isAddressValid = address.length <= 400;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Standard email check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Password checks
    if (!isPasswordLengthValid) {
      newErrors.password = 'Password must be between 8 and 16 characters.';
    } else if (!hasUppercase) {
      newErrors.password = 'Password must contain at least one uppercase letter.';
    } else if (!hasSpecialChar) {
      newErrors.password = 'Password must contain at least one special character.';
    }

    if (!isLogin) {
      // Name checks
      if (!isNameLengthValid) {
        newErrors.name = 'Name must be between 20 and 60 characters long.';
      }
      // Address checks
      if (address.length > 400) {
        newErrors.address = 'Address cannot exceed 400 characters.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setErrors({});

    if (!validateForm()) return;

    setLoading(true);

    if (isLogin) {
      const res = await login(email, password);
      if (res.error) {
        setGeneralError(res.error);
        if (res.errors) setErrors(res.errors);
      }
    } else {
      const res = await registerUser(name, email, password, address);
      if (res.error) {
        setGeneralError(res.error);
        if (res.errors) setErrors(res.errors);
      }
    }

    setLoading(false);
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setGeneralError(null);
    setName('');
    setEmail('');
    setAddress('');
    setPassword('');
  };

  return (
    <div className="auth-wrapper" id="auth-page-wrapper">
      <div
        className="app-container"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3rem',
          alignItems: 'center',
          minHeight: 'auto',
          width: '100%',
          maxWidth: '1100px',
        }}
      >
        {/* Left Side Info Panel */}
        <div style={{ padding: '1rem' }} id="auth-left-panel">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: 'var(--color-primary)',
              fontSize: '1.8rem',
              marginBottom: '1.5rem',
            }}
          >
            <Sparkles size={36} />
            <h1 style={{ letterSpacing: '-0.03em' }}>RatingSphere</h1>
          </div>
          <h2
            style={{
              fontSize: '2.5rem',
              lineHeight: '1.2',
              marginBottom: '1rem',
              fontWeight: 800,
            }}
          >
            Real opinions. Verified stores.
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6' }}>
            RatingSphere bridges the gap between consumers and businesses. Share your experiences, grade
            stores from 1 to 5, and view insights instantly on our role-based, glassmorphic dashboard.
          </p>
        </div>

        {/* Right Side Glass Card Form */}
        <div className="glass-card" style={{ padding: '2.5rem' }} id="auth-form-card">
          <div className="tabs-container" style={{ marginBottom: '2rem' }} id="auth-tabs">
            <button
              type="button"
              className={`tab-btn ${isLogin ? 'active' : ''}`}
              onClick={isLogin ? undefined : handleToggleMode}
              id="login-tab-btn"
            >
              Sign In
            </button>
            <button
              type="button"
              className={`tab-btn ${!isLogin ? 'active' : ''}`}
              onClick={!isLogin ? undefined : handleToggleMode}
              id="signup-tab-btn"
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} id="auth-form">
            {generalError && (
              <div
                style={{
                  color: 'var(--color-error)',
                  background: 'rgba(255, 71, 87, 0.1)',
                  border: '1px solid rgba(255, 71, 87, 0.2)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                }}
                id="auth-general-error"
              >
                <AlertCircle size={16} />
                <span>{generalError}</span>
              </div>
            )}

            {!isLogin && (
              <div className="form-group">
                <label className="form-label" htmlFor="signup-name">
                  Full Name
                </label>
                <input
                  type="text"
                  id="signup-name"
                  className="form-control"
                  placeholder="Min 20, Max 60 characters"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                {!isNameLengthValid && name.length > 0 && (
                  <div className="form-error" id="name-length-validation-error">
                    Name must be between 20 and 60 characters (currently: {name.length}).
                  </div>
                )}
                {errors.name && <div className="form-error">{errors.name}</div>}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="auth-email">
                Email Address
              </label>
              <input
                type="email"
                id="auth-email"
                className="form-control"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            {!isLogin && (
              <div className="form-group">
                <label className="form-label" htmlFor="signup-address">
                  Address
                </label>
                <textarea
                  id="signup-address"
                  className="form-control"
                  placeholder="Max 400 characters"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{ resize: 'vertical', minHeight: '80px' }}
                  required
                />
                {!isAddressValid && (
                  <div className="form-error" id="address-validation-error">
                    Address cannot exceed 400 characters (currently: {address.length}).
                  </div>
                )}
                {errors.address && <div className="form-error">{errors.address}</div>}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="auth-password">
                Password
              </label>
              <input
                type="password"
                id="auth-password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {errors.password && <div className="form-error">{errors.password}</div>}

              {/* Password indicator checklist */}
              <div className="live-checks" id="auth-password-checks">
                <div className={`live-check-item ${isPasswordLengthValid ? 'valid' : ''}`}>
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

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={loading || (!isLogin && (!isPasswordValid || !isNameLengthValid || !isAddressValid))}
              id="auth-submit-btn"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
