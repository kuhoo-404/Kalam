import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Feather, Eye, EyeOff, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { register, login } from '../utilis/api';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      // Register then auto-login
      await register(form.username, form.email, form.password);
      const res = await login(form.username, form.password);
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      navigate('/write');
    } catch (err) {
      const data = err.response?.data;
      if (data?.username) setError(`Username: ${data.username[0]}`);
      else if (data?.email) setError(`Email: ${data.email[0]}`);
      else if (data?.password) setError(`Password: ${data.password[0]}`);
      else setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={styles.card}
        className="card-paper"
      >
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <Feather size={32} color="#8B7355" />
          <span style={styles.logoText}>Kalam</span>
        </Link>

        <p style={styles.eyebrow}>JOIN KALAM</p>
        <h1 style={styles.title}>Create Account</h1>
        <p style={styles.subtitle}>Begin your poetic journey today</p>

        <div style={styles.divider} />

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={styles.errorBox}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Username</label>
            <input
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              placeholder="your_username"
              required
              style={styles.input}
              onFocus={e => e.target.style.borderColor = '#8B7355'}
              onBlur={e => e.target.style.borderColor = '#D4C5A9'}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email <span style={styles.optional}>(optional)</span></label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              style={styles.input}
              onFocus={e => e.target.style.borderColor = '#8B7355'}
              onBlur={e => e.target.style.borderColor = '#D4C5A9'}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.passwordWrapper}>
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 8 characters"
                required
                style={{ ...styles.input, paddingRight: '48px' }}
                onFocus={e => e.target.style.borderColor = '#8B7355'}
                onBlur={e => e.target.style.borderColor = '#D4C5A9'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              style={styles.input}
              onFocus={e => e.target.style.borderColor = '#8B7355'}
              onBlur={e => e.target.style.borderColor = '#D4C5A9'}
            />
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            className="btn-vintage"
            style={styles.submitButton}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              'Creating account...'
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <UserPlus size={18} /> Create Account
              </span>
            )}
          </motion.button>
        </form>

        <p style={styles.switchText}>
          Already have an account?{' '}
          <Link to="/login" style={styles.switchLink}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #F5F1E8 0%, #E8DCC4 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
  },
  card: {
    width: '100%',
    maxWidth: '460px',
    padding: '48px 40px',
    textAlign: 'center',
  },
  logo: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    marginBottom: '24px',
  },
  logoText: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.8rem',
    fontWeight: 700,
    color: 'var(--ink-black)',
  },
  eyebrow: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.8rem',
    letterSpacing: '3px',
    color: 'var(--coffee-brown)',
    fontWeight: 600,
    marginBottom: '8px',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '2.2rem',
    fontWeight: 700,
    color: 'var(--ink-black)',
    marginBottom: '8px',
  },
  subtitle: {
    fontFamily: 'var(--font-body)',
    fontSize: '1rem',
    color: 'var(--soft-black)',
  },
  divider: {
    width: '60px',
    height: '3px',
    background: '#8B7355',
    margin: '24px auto',
    borderRadius: '2px',
    opacity: 0.6,
  },
  errorBox: {
    background: '#FDF0F0',
    border: '1px solid #E8B4B4',
    color: '#C0392B',
    padding: '12px 16px',
    borderRadius: '8px',
    fontFamily: 'var(--font-body)',
    fontSize: '0.95rem',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    textAlign: 'left',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.9rem',
    fontWeight: 600,
    color: 'var(--ink-black)',
    letterSpacing: '0.5px',
  },
  optional: {
    fontWeight: 400,
    color: 'var(--soft-black)',
    fontSize: '0.85rem',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontFamily: 'var(--font-body)',
    fontSize: '1rem',
    color: 'var(--ink-black)',
    background: 'rgba(255,255,255,0.7)',
    border: '2px solid #D4C5A9',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.3s ease',
    boxSizing: 'border-box',
  },
  passwordWrapper: {
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#8B7355',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
  },
  submitButton: {
    width: '100%',
    padding: '14px',
    fontSize: '1rem',
    marginTop: '8px',
    cursor: 'pointer',
  },
  switchText: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.95rem',
    color: 'var(--soft-black)',
    marginTop: '24px',
  },
  switchLink: {
    color: 'var(--coffee-brown)',
    fontWeight: 600,
    textDecoration: 'none',
  },
};

export default Register;