import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function LoginModal({ isOpen, onClose, onSwitchToRegister }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginWithPhone, setLoginWithPhone] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(loginWithPhone ? null : email, password, loginWithPhone ? phone : null);
    
    if (result.success) {
      onClose();
      setEmail('');
      setPhone('');
      setPassword('');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="auth-modal-container">
        <span className="auth-close-btn" onClick={onClose}>&times;</span>
        <h2><i className="fas fa-user"></i> Sign In</h2> REPLACE
        
        <div className="login-toggle">
          <button 
            type="button"
            className={`toggle-btn ${!loginWithPhone ? 'active' : ''}`}
            onClick={() => { setLoginWithPhone(false); setError(''); }}
          >
            Email
          </button>
          <button 
            type="button"
            className={`toggle-btn ${loginWithPhone ? 'active' : ''}`}
            onClick={() => { setLoginWithPhone(true); setError(''); }}
          >
            Phone
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {!loginWithPhone ? (
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
          ) : (
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                required
              />
            </div>
          )}
          
          <div className="form-group">
            <label>Password</label>
            <div className="password-input">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-divider">
          <span>Or</span>
        </div>

        <div className="social-login">
          <button type="button" className="social-btn google">
            <img src="https://www.google.com/favicon.ico" alt="Google" />
            Google
          </button>
          <button type="button" className="social-btn facebook">
            <img src="https://www.facebook.com/favicon.ico" alt="Facebook" />
            Facebook
          </button>
        </div>

        <div className="auth-switch">
          Don't have an account? 
          <button type="button" onClick={onSwitchToRegister}>Sign Up</button>
        </div>
      </div>
    </div>
  );
}

export function RegisterModal({ isOpen, onClose, onSwitchToLogin }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [usePhone, setUsePhone] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!agreeTerms) {
      setError('Please agree to the Terms & Conditions');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const result = await register(
      name, 
      usePhone ? null : email, 
      password, 
      usePhone ? phone : null
    );
    
    if (result.success) {
      onClose();
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setConfirmPassword('');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content auth-modal">
        <span className="close-modal" onClick={onClose}>&times;</span>
        <h2><i className="fas fa-user-plus"></i> Create Account</h2>

        <div className="login-toggle">
          <button 
            type="button"
            className={`toggle-btn ${!usePhone ? 'active' : ''}`}
            onClick={() => { setUsePhone(false); setError(''); }}
          >
            Email
          </button>
          <button 
            type="button"
            className={`toggle-btn ${usePhone ? 'active' : ''}`}
            onClick={() => { setUsePhone(true); setError(''); }}
          >
            Phone
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

          {!usePhone ? (
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
          ) : (
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                required
              />
            </div>
          )}
          
          <div className="form-group">
            <label>Password</label>
            <div className="password-input">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
            />
          </div>

          <div className="terms-checkbox">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
            />
            <label htmlFor="terms">
              I agree to the <a href="#terms">Terms & Conditions</a> and <a href="#privacy">Privacy Policy</a>
            </label>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-divider">
          <span>Or</span>
        </div>

        <div className="social-login">
          <button type="button" className="social-btn google">
            <img src="https://www.google.com/favicon.ico" alt="Google" />
            Google
          </button>
          <button type="button" className="social-btn facebook">
            <img src="https://www.facebook.com/favicon.ico" alt="Facebook" />
            Facebook
          </button>
        </div>

        <div className="auth-switch">
          Already have an account? 
          <button type="button" onClick={onSwitchToLogin}>Sign In</button>
        </div>
      </div>
    </div>
  );
}

