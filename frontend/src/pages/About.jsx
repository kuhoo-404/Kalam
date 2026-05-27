import React from 'react';
import { motion } from 'framer-motion';
import { PenTool, Brain, Sparkles, Feather } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const STEPS = [
  {
    number: '01',
    icon: <PenTool size={36} strokeWidth={1.5} />,
    title: 'Write Your Poem',
    description:
      'Begin with a single line or pour out entire stanzas. Choose your genre and let the atmospheric editor set the mood.',
    color: '#D96C8A',
    bg: 'linear-gradient(135deg, #2B0D18 0%, #5E1830 100%)',
  },
  {
    number: '02',
    icon: <Brain size={36} strokeWidth={1.5} />,
    title: 'AI Detects Genre & Mood',
    description:
      'Our custom-trained models analyse your words in real time — detecting style, emotional tone, and thematic context.',
    color: '#C89A54',
    bg: 'linear-gradient(135deg, #2B1B0F 0%, #5A381B 100%)',
  },
  {
    number: '03',
    icon: <Sparkles size={36} strokeWidth={1.5} />,
    title: 'Get Contextual Suggestions',
    description:
      'Receive perfectly matched synonyms and rhymes that honour your voice — filtered by genre, sentiment, and theme.',
    color: '#71B97A',
    bg: 'linear-gradient(135deg, #0B2414 0%, #174227 100%)',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: i => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.55, ease: 'easeOut' },
  }),
};

const About = () => {
  const navigate = useNavigate();

  const handleStartWriting = () => {
    const token = localStorage.getItem('access_token');
    navigate(token ? '/write' : '/login');
  };

  return (
    <>
      <Navbar />

      <div style={styles.page}>

        {/* ── Hero ───────────────────────────────────────── */}
        <div style={styles.heroSection}>
          <div style={styles.container}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <p style={styles.eyebrow}>ABOUT Kalam</p>
              <h1 style={styles.heroTitle}>
                Writing Should Feel<br />
                <span style={styles.heroAccent}>Human Again</span>
              </h1>
              <p style={styles.heroSubtitle}>
                Kalam transforms writing into an emotional, atmospheric
                experience — blending poetry, memory, and cinematic design
                into a creative space that feels alive.
              </p>
              <div style={styles.heroBtns}>
                <button style={styles.primaryBtn} onClick={handleStartWriting}>
                  <Feather size={15} style={{ marginRight: 8 }} />
                  Start Writing
                </button>
                <Link to="/templates">
                  <button style={styles.outlineBtn}>Browse Templates</button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── How It Works ───────────────────────────────── */}
        <div style={styles.stepsSection}>
          <div style={styles.container}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={styles.sectionHeader}
            >
              <p style={styles.eyebrow}>HOW IT WORKS</p>
              <h2 style={styles.sectionTitle}>Three Simple Steps</h2>
              <p style={styles.sectionSubtitle}>
                From blank page to polished poetry in moments.
              </p>
            </motion.div>

            <div style={styles.stepsGrid}>
              {STEPS.map((step, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  style={{ ...styles.stepCard, background: step.bg }}
                >
                  <div style={{ ...styles.stepGlow, background: step.color + '33' }} />
                  <span style={{ ...styles.stepNumber, color: step.color }}>{step.number}</span>
                  <div style={{ ...styles.stepIcon, background: step.color + '20', color: step.color }}>
                    {step.icon}
                  </div>
                  <h3 style={styles.stepTitle}>{step.title}</h3>
                  <p style={styles.stepDesc}>{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <Footer />
    </>
  );
};

const styles = {
  page: {
    background: 'linear-gradient(180deg, #F5F1E8 0%, #E8DCC4 100%)',
    minHeight: '100vh',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
  },
  heroSection: {
    padding: '110px 0 90px',
  },
  eyebrow: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.78rem',
    letterSpacing: '4px',
    color: '#8B7355',
    fontWeight: 700,
    marginBottom: '18px',
  },
  heroTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(3rem, 6vw, 5rem)',
    color: '#2C2416',
    fontWeight: 800,
    lineHeight: 1.1,
    marginBottom: '24px',
    letterSpacing: '-1px',
  },
  heroAccent: {
    color: '#8B7355',
  },
  heroSubtitle: {
    fontFamily: 'var(--font-body)',
    fontSize: '1.2rem',
    color: '#4A4033',
    lineHeight: 1.9,
    maxWidth: '600px',
    marginBottom: '36px',
  },
  heroBtns: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    fontFamily: 'var(--font-body)',
    fontSize: '0.95rem',
    fontWeight: 700,
    color: 'white',
    background: 'linear-gradient(135deg, #8B7355 0%, #6B5842 100%)',
    border: 'none',
    borderRadius: '10px',
    padding: '13px 28px',
    cursor: 'pointer',
    letterSpacing: '0.4px',
    boxShadow: '0 6px 20px rgba(107,88,66,0.28)',
  },
  outlineBtn: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#6B5842',
    background: 'transparent',
    border: '2px solid rgba(139,115,85,0.35)',
    borderRadius: '10px',
    padding: '12px 28px',
    cursor: 'pointer',
  },
  stepsSection: {
    padding: '80px 0 120px',
    background: 'rgba(139,115,85,0.04)',
  },
  sectionHeader: {
    marginBottom: '52px',
  },
  sectionTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(2rem, 4vw, 3rem)',
    fontWeight: 800,
    color: '#2C2416',
    marginBottom: '14px',
    letterSpacing: '-0.5px',
  },
  sectionSubtitle: {
    fontFamily: 'var(--font-body)',
    fontSize: '1.1rem',
    color: '#5C4A34',
    lineHeight: 1.8,
    maxWidth: '480px',
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
  },
  stepCard: {
    position: 'relative',
    borderRadius: '24px',
    padding: '36px 28px 32px',
    border: '1px solid rgba(255,255,255,0.08)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  stepGlow: {
    position: 'absolute',
    width: '280px',
    height: '280px',
    borderRadius: '50%',
    filter: 'blur(80px)',
    top: '-80px',
    right: '-60px',
    pointerEvents: 'none',
  },
  stepNumber: {
    fontFamily: 'var(--font-display)',
    fontSize: '3.5rem',
    fontWeight: 800,
    lineHeight: 1,
    opacity: 0.25,
    letterSpacing: '-2px',
  },
  stepIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.3rem',
    fontWeight: 700,
    color: 'rgba(255,255,255,0.92)',
    margin: 0,
  },
  stepDesc: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.95rem',
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 1.75,
    margin: 0,
  },
};

export default About;