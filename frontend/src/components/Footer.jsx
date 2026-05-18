import React from 'react';
import { Link } from 'react-router-dom';
import { Feather } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.topGlow} />

      <div style={styles.container}>
        {/* Brand */}
        <div style={styles.brandSection}>
          <div style={styles.logoRow}>
            <div style={styles.logoCircle}>
              <Feather size={18} color="#F5F1E8" />
            </div>
            <h2 style={styles.logoText}>Kalam</h2>
          </div>
          <p style={styles.description}>
            A cinematic writing experience crafted for poets,
            dreamers, romantics, and midnight thinkers.
          </p>
        </div>

        {/* Navigation */}
        <div style={styles.linksWrapper}>
          <div>
            <p style={styles.linkHeading}>Explore</p>
            <div style={styles.linkColumn}>
              <Link to="/"          style={styles.link}>Home</Link>
              <Link to="/templates" style={styles.link}>Templates</Link>
              <Link to="/write"     style={styles.link}>Write</Link>
              <Link to="/saved"     style={styles.link}>My Poems</Link>  {/* ← new */}
            </div>
          </div>

          <div>
            <p style={styles.linkHeading}>Experience</p>
            <div style={styles.linkColumn}>
              <span style={styles.link}>Cinematic UI</span>
              <span style={styles.link}>Mood Writing</span>
              <span style={styles.link}>Atmospheric Poetry</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div style={styles.bottomBar}>
        <p style={styles.bottomText}>
          Crafted with ink, memory, and atmosphere.
        </p>
        <p style={styles.copyright}>© 2025 Kalam</p>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    position: 'relative',
    overflow: 'hidden',
    background: 'linear-gradient(180deg, #E7DAC5 0%, #DCCAB0 100%)',
    borderTop: '1px solid rgba(139,115,85,0.14)',
    marginTop: '120px',
  },
  topGlow: {
    position: 'absolute',
    top: '-120px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '500px',
    height: '240px',
    background: 'radial-gradient(circle, rgba(201,166,107,0.16) 0%, transparent 70%)',
    filter: 'blur(60px)',
    pointerEvents: 'none',
  },
  container: {
    maxWidth: '1300px',
    margin: '0 auto',
    padding: '80px 24px 60px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '80px',
    flexWrap: 'wrap',
    position: 'relative',
    zIndex: 2,
  },
  brandSection: { maxWidth: '420px' },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '22px',
  },
  logoCircle: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #8B7355 0%, #6B5842 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(107,88,66,0.28)',
  },
  logoText: {
    fontFamily: 'var(--font-display)',
    fontSize: '2rem',
    color: '#2C2416',
    fontWeight: 700,
    margin: 0,
  },
  description: {
    fontFamily: 'var(--font-body)',
    fontSize: '1.05rem',
    color: '#5C5144',
    lineHeight: 1.9,
    margin: 0,
  },
  linksWrapper: {
    display: 'flex',
    gap: '80px',
    flexWrap: 'wrap',
  },
  linkHeading: {
    fontSize: '0.82rem',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    color: '#7B6854',
    marginBottom: '18px',
    fontWeight: 700,
    fontFamily: 'var(--font-body)',
  },
  linkColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  link: {
    textDecoration: 'none',
    color: '#4B4034',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
    fontFamily: 'var(--font-body)',
  },
  bottomBar: {
    borderTop: '1px solid rgba(139,115,85,0.12)',
    padding: '22px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    maxWidth: '1300px',
    margin: '0 auto',
  },
  bottomText: {
    fontSize: '0.92rem',
    color: '#7A6957',
    margin: 0,
    fontStyle: 'italic',
  },
  copyright: {
    fontSize: '0.88rem',
    color: '#8B7355',
    margin: 0,
    letterSpacing: '1px',
  },
};

export default Footer;