import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Feather, Menu, X, LogIn, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isLoggedIn = !!localStorage.getItem('access_token');

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
    setIsOpen(false);
  };

  const navLinks = [
    { name: 'Home',      path: '/' },
    { name: 'Templates', path: '/templates' },
    { name: 'Write',     path: '/write' },
    { name: 'My Poems',  path: '/saved' },
    { name: 'About',     path: '/about' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.container}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <Feather size={28} color="#8B7355" />
          <span style={styles.logoText}>Kalam</span>
        </Link>

        {/* Desktop Navigation */}
        <div style={styles.desktopNav}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                ...styles.navLink,
                ...(isActive(link.path) ? styles.navLinkActive : {}),
              }}
            >
              {link.name}
            </Link>
          ))}

          {isLoggedIn ? (
            <button
              className="btn-vintage"
              style={styles.ctaButton}
              onClick={handleLogout}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <LogOut size={16} /> Logout
              </span>
            </button>
          ) : (
            <Link to="/login">
              <button className="btn-vintage" style={styles.ctaButton}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <LogIn size={16} /> Start Writing
                </span>
              </button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button style={styles.menuButton} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={styles.mobileNav}
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  ...styles.mobileLink,
                  ...(isActive(link.path) ? styles.mobileLinkActive : {}),
                }}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}

            {isLoggedIn ? (
              <button
                className="btn-vintage"
                style={{ ...styles.ctaButton, width: '100%', marginTop: '16px' }}
                onClick={handleLogout}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                  <LogOut size={16} /> Logout
                </span>
              </button>
            ) : (
              <Link to="/login" onClick={() => setIsOpen(false)}>
                <button
                  className="btn-vintage"
                  style={{ ...styles.ctaButton, width: '100%', marginTop: '16px' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                    <LogIn size={16} /> Start Writing
                  </span>
                </button>
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const styles = {
  nav: {
    background: 'rgba(245, 241, 232, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '2px solid var(--aged-cream)',
    padding: '16px 0',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
    transition: 'transform 0.3s ease',
  },
  logoText: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--ink-black)',
    letterSpacing: '0.5px',
  },
  desktopNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '28px',
  },
  navLink: {
    fontFamily: 'var(--font-body)',
    fontSize: '1rem',
    color: 'var(--soft-black)',
    textDecoration: 'none',
    padding: '8px 14px',
    borderRadius: '6px',
    transition: 'all 0.3s ease',
    fontWeight: 600,
  },
  navLinkActive: {
    color: 'var(--coffee-brown)',
    background: 'var(--aged-cream)',
  },
  ctaButton: {
    padding: '12px 28px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  menuButton: {
    display: 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--coffee-brown)',
  },
  mobileNav: {
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    background: 'var(--cream)',
    borderTop: '1px solid var(--aged-cream)',
  },
  mobileLink: {
    fontFamily: 'var(--font-body)',
    fontSize: '1.1rem',
    color: 'var(--soft-black)',
    textDecoration: 'none',
    padding: '12px 16px',
    borderRadius: '6px',
    fontWeight: 600,
    marginBottom: '8px',
  },
  mobileLinkActive: {
    color: 'var(--coffee-brown)',
    background: 'var(--aged-cream)',
  },
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @media (max-width: 768px) {
    nav > div > div:first-of-type { display: none !important; }
    nav > div > button { display: block !important; }
  }
`;
document.head.appendChild(styleSheet);

export default Navbar;