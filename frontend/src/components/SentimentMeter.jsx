import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity } from 'lucide-react';

// Sentiment scale stops
const SENTIMENT_STOPS = [
  { min: -1.0, max: -0.6, label: 'Very Negative', emoji: '🌧️', color: '#4B5563', bg: '#4B556315' },
  { min: -0.6, max: -0.2, label: 'Negative',      emoji: '🌫️', color: '#6B7280', bg: '#6B728015' },
  { min: -0.2, max:  0.2, label: 'Neutral',        emoji: '🌤️', color: '#9B8EA0', bg: '#9B8EA015' },
  { min:  0.2, max:  0.6, label: 'Positive',       emoji: '🌻', color: '#C9A66B', bg: '#C9A66B15' },
  { min:  0.6, max:  1.0, label: 'Very Positive',  emoji: '☀️', color: '#7B9E6B', bg: '#7B9E6B15' },
];

const GENRE_SENTIMENT_HINTS = {
  Romantic:        { ideal: 0.75,  note: 'Romantic poems tend toward warmth and longing.' },
  Misery:          { ideal: -0.80, note: 'Lean into darkness — let the weight show.' },
  Nostalgia:       { ideal: 0.30,  note: 'A bittersweet blend of joy and ache.' },
  'Hope & Joy':    { ideal: 0.85,  note: 'Let the light in. More warmth here.' },
  Philosophical:   { ideal: 0.00,  note: 'Balanced tension makes philosophy resonate.' },
  'Everyday Life': { ideal: 0.20,  note: 'Grounded, observational, subtly warm.' },
};

const getSentimentStop = (value) =>
  SENTIMENT_STOPS.find(s => value >= s.min && value <= s.max) || SENTIMENT_STOPS[2];

// Convert compound (-1 to 1) → percentage (0 to 100) for the meter
const toPercent = (val) => ((val + 1) / 2) * 100;

const SentimentMeter = ({ compound = 0, label = 'Neutral', genre = null, isAnalyzing = false }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [showHint, setShowHint] = useState(false);

  // Animate the displayed value smoothly
  useEffect(() => {
    const start = displayValue;
    const end = compound;
    const duration = 800;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      setDisplayValue(start + (end - start) * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [compound]);

  const stop = getSentimentStop(displayValue);
  const fillPercent = toPercent(displayValue);
  const genreHint = genre ? GENRE_SENTIMENT_HINTS[genre] : null;

  return (
    <div style={styles.panel}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTitle}>
          <Activity size={15} color="var(--coffee-brown)" />
          <span style={styles.headerText}>EMOTIONAL TONE</span>
        </div>
        {isAnalyzing && (
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={styles.analyzingBadge}
          >
            analysing…
          </motion.span>
        )}
      </div>

      {/* Main meter area */}
      <div style={styles.meterArea}>
        {/* Emoji + Label */}
        <motion.div
          key={stop.label}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ ...styles.labelRow, color: stop.color }}
        >
          <span style={styles.emoji}>{stop.emoji}</span>
          <span style={styles.sentimentLabel}>{stop.label}</span>
        </motion.div>

        {/* Score number */}
        <div style={{ ...styles.scoreDisplay, color: stop.color }}>
          <span style={styles.scoreNum}>
            {displayValue >= 0 ? '+' : ''}{displayValue.toFixed(2)}
          </span>
          <span style={styles.scoreRange}>/ ±1.00</span>
        </div>

        {/* Horizontal bar meter */}
        <div style={styles.barTrack}>
          {/* Gradient fill */}
          <motion.div
            style={{
              ...styles.barFill,
              background: `linear-gradient(90deg, #4B5563 0%, #9B8EA0 40%, #C9A66B 70%, #7B9E6B 100%)`,
              clipPath: `inset(0 ${100 - fillPercent}% 0 0)`,
            }}
            initial={{ clipPath: 'inset(0 100% 0 0)' }}
            animate={{ clipPath: `inset(0 ${100 - fillPercent}% 0 0)` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />

          {/* Center zero mark */}
          <div style={styles.zeroMark} title="Neutral (0)" />

          {/* Needle */}
          <motion.div
            style={{ ...styles.needle, left: `${fillPercent}%`, background: stop.color }}
            animate={{ left: `${fillPercent}%`, background: stop.color }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>

        {/* Scale labels */}
        <div style={styles.scaleLabels}>
          <span style={styles.scaleLabel}>Very Negative</span>
          <span style={styles.scaleLabel}>Neutral</span>
          <span style={styles.scaleLabel}>Very Positive</span>
        </div>

        {/* Genre context hint */}
        <AnimatePresence>
          {genreHint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ ...styles.hintBox, borderColor: stop.color + '40', background: stop.bg }}
            >
              <div style={styles.hintHeader}>
                <span style={{ ...styles.hintGenre, color: stop.color }}>{genre}</span>
                <span style={styles.hintIdeal}>
                  ideal: {genreHint.ideal >= 0 ? '+' : ''}{genreHint.ideal.toFixed(2)}
                </span>
              </div>
              <p style={styles.hintNote}>{genreHint.note}</p>

              {/* Gap from ideal */}
              {Math.abs(displayValue - genreHint.ideal) > 0.25 && (
                <div style={styles.gapRow}>
                  <div style={styles.gapTrack}>
                    <div style={{
                      ...styles.gapFill,
                      width: `${Math.min(Math.abs(displayValue - genreHint.ideal) / 2 * 100, 100)}%`,
                      background: stop.color,
                    }} />
                  </div>
                  <span style={styles.gapText}>
                    {displayValue < genreHint.ideal ? '↑ push warmer' : '↓ push darker'}
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Breakdown dots */}
        <div style={styles.breakdown}>
          {SENTIMENT_STOPS.map((s, i) => (
            <div
              key={i}
              style={{
                ...styles.breakdownItem,
                opacity: stop.label === s.label ? 1 : 0.35,
              }}
            >
              <div style={{
                ...styles.breakdownDot,
                background: stop.label === s.label ? s.color : 'var(--aged-cream)',
                border: `2px solid ${s.color}`,
              }} />
              <span style={{ ...styles.breakdownLabel, color: s.color }}>
                {s.emoji}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {compound === 0 && !isAnalyzing && (
        <p style={styles.emptyNote}>
          Start writing to see the emotional tone of your poem update in real time.
        </p>
      )}
    </div>
  );
};

const styles = {
  panel: {
    background: 'var(--cream)',
    borderRadius: '12px',
    border: '1.5px solid var(--aged-cream)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid var(--aged-cream)',
    background: 'rgba(245, 241, 232, 0.7)',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  headerText: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.78rem',
    letterSpacing: '2px',
    fontWeight: 700,
    color: 'var(--coffee-brown)',
  },
  analyzingBadge: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.75rem',
    color: '#C9A66B',
    fontStyle: 'italic',
    letterSpacing: '0.5px',
  },
  meterArea: {
    padding: '24px 20px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  labelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  emoji: {
    fontSize: '1.6rem',
    lineHeight: 1,
  },
  sentimentLabel: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.2rem',
    fontWeight: 700,
    letterSpacing: '0.3px',
  },
  scoreDisplay: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px',
  },
  scoreNum: {
    fontFamily: 'var(--font-display)',
    fontSize: '2.4rem',
    fontWeight: 800,
    lineHeight: 1,
    letterSpacing: '-1px',
  },
  scoreRange: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.85rem',
    color: 'var(--soft-black)',
    opacity: 0.5,
  },
  barTrack: {
    position: 'relative',
    height: '10px',
    background: 'var(--aged-cream)',
    borderRadius: '10px',
    overflow: 'visible',
  },
  barFill: {
    position: 'absolute',
    inset: 0,
    borderRadius: '10px',
  },
  zeroMark: {
    position: 'absolute',
    left: '50%',
    top: '-4px',
    bottom: '-4px',
    width: '2px',
    background: 'rgba(0,0,0,0.15)',
    borderRadius: '2px',
    transform: 'translateX(-50%)',
  },
  needle: {
    position: 'absolute',
    top: '50%',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    border: '2.5px solid white',
    zIndex: 2,
    transition: 'background 0.8s ease',
  },
  scaleLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '-8px',
  },
  scaleLabel: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.7rem',
    color: 'var(--soft-black)',
    opacity: 0.5,
  },
  hintBox: {
    borderRadius: '10px',
    border: '1.5px solid',
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  hintHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hintGenre: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.8rem',
    fontWeight: 700,
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  hintIdeal: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.78rem',
    color: 'var(--soft-black)',
    opacity: 0.6,
  },
  hintNote: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.85rem',
    color: 'var(--soft-black)',
    lineHeight: 1.6,
    margin: 0,
    fontStyle: 'italic',
  },
  gapRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '4px',
  },
  gapTrack: {
    flex: 1,
    height: '4px',
    background: 'var(--aged-cream)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  gapFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.8s ease',
  },
  gapText: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.75rem',
    color: 'var(--soft-black)',
    opacity: 0.65,
    whiteSpace: 'nowrap',
  },
  breakdown: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 4px 0',
    borderTop: '1px solid var(--aged-cream)',
  },
  breakdownItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    transition: 'opacity 0.3s ease',
  },
  breakdownDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    transition: 'all 0.3s ease',
  },
  breakdownLabel: {
    fontSize: '0.9rem',
  },
  emptyNote: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.82rem',
    color: 'var(--soft-black)',
    opacity: 0.5,
    textAlign: 'center',
    fontStyle: 'italic',
    padding: '0 20px 20px',
    lineHeight: 1.6,
    margin: 0,
  },
};

export default SentimentMeter;