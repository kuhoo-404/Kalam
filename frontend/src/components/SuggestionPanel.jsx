import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Music, ChevronRight, RefreshCw, Hash } from 'lucide-react';
import { getSuggestions } from '../utilis/api';

const SuggestionCard = ({ suggestion, index, onInsert, accentColor }) => (
  <motion.div
    initial={{ opacity: 0, x: 20, rotate: 1 }}
    animate={{
      opacity: 1,
      x: 0,
      rotate: (index % 3 === 0 ? -0.8 : index % 3 === 1 ? 0.5 : -0.3),
    }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ delay: index * 0.07, type: 'spring', stiffness: 140 }}
    whileHover={{ y: -3, rotate: 0, transition: { duration: 0.2 } }}
    style={{
      ...styles.suggCard,
      borderLeft: `3px solid ${accentColor}`,
    }}
  >
    <div style={styles.suggTop}>
      <span style={{ ...styles.suggWord, color: accentColor }}>
        {suggestion.word}
      </span>
      <button
        onClick={() => onInsert(suggestion.word)}
        style={{ ...styles.insertBtn, background: accentColor + '20', color: accentColor }}
      >
        Insert <ChevronRight size={12} />
      </button>
    </div>
    <p style={styles.suggReason}>{suggestion.reason}</p>
  </motion.div>
);

const SuggestionPanel = ({ genre, sentiment, poemText }) => {
  const [activeTab, setActiveTab]     = useState('synonyms');
  const [inputWord, setInputWord]     = useState('');
  const [suggestions, setSuggestions] = useState(null);
  const [isLoading, setIsLoading]     = useState(false);
  const [insertedWord, setInsertedWord] = useState(null);
  const [error, setError]             = useState(null);

  const genreColors = {
    romantic:      '#D4A5A5',
    misery:        '#6B7280',
    nostalgia:     '#C9A66B',
    hope:          '#7B9E6B',
    philosophical: '#8B7355',
    everyday:      '#9B8EA0',
  };
  const accentColor = genre
    ? genreColors[genre.toLowerCase()] || '#8B7355'
    : '#8B7355';

  const handleFetch = async () => {
    if (!inputWord.trim()) return;
    if (!poemText || !poemText.trim()) {
      setError('Write some poem text first so suggestions can match your context!');
      return;
    }

    setIsLoading(true);
    setSuggestions(null);
    setError(null);

    try {
      const res = await getSuggestions(inputWord.trim(), poemText.trim());
      setSuggestions({
        synonyms: res.data.synonyms || [],
        rhymes:   res.data.rhymes   || [],
      });
    } catch (err) {
      console.error('Suggestion fetch failed:', err);
      setError('Could not fetch suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsert = (word) => {
    // Copy to clipboard
    navigator.clipboard.writeText(word).catch(() => {});
    setInsertedWord(word);
    setTimeout(() => setInsertedWord(null), 2000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleFetch();
  };

  const currentSuggestions = suggestions?.[activeTab] || [];

  return (
    <div style={styles.panel}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTitle}>
          <Sparkles size={16} color={accentColor} />
          <span style={{ ...styles.headerText, color: accentColor }}>SUGGESTIONS</span>
        </div>
        {genre && (
          <span style={{ ...styles.genreBadge, background: accentColor + '20', color: accentColor }}>
            {genre}
          </span>
        )}
      </div>

      {/* Word input */}
      <div style={styles.inputRow}>
        <div style={{ ...styles.inputWrapper, borderColor: accentColor + '60' }}>
          <Hash size={14} color={accentColor} style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Enter a word..."
            value={inputWord}
            onChange={e => setInputWord(e.target.value)}
            onKeyDown={handleKeyDown}
            style={styles.wordInput}
          />
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleFetch}
          disabled={isLoading || !inputWord.trim()}
          style={{
            ...styles.fetchBtn,
            background: accentColor,
            opacity: (!inputWord.trim() || isLoading) ? 0.5 : 1,
          }}
        >
          {isLoading
            ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
            : 'Find'
          }
        </motion.button>
      </div>

      {/* Error message */}
      {error && (
        <p style={styles.errorText}>{error}</p>
      )}

      {/* Tabs */}
      <div style={styles.tabs}>
        {[
          { id: 'synonyms', label: 'Synonyms', icon: <Sparkles size={13} /> },
          { id: 'rhymes',   label: 'Rhymes',   icon: <Music size={13} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tab,
              borderBottom: activeTab === tab.id ? `2px solid ${accentColor}` : '2px solid transparent',
              color:      activeTab === tab.id ? accentColor : 'var(--soft-black)',
              fontWeight: activeTab === tab.id ? 700 : 400,
            }}
          >
            {tab.icon}
            {tab.label}
            {suggestions && (
              <span style={{ ...styles.tabCount, background: accentColor + '25', color: accentColor }}>
                {suggestions[tab.id]?.length || 0}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Suggestions list */}
      <div style={styles.suggList}>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={styles.loadingState}
            >
              {[1, 2, 3].map(i => (
                <div key={i} style={{ ...styles.skeleton, animationDelay: `${i * 0.15}s` }} />
              ))}
            </motion.div>
          ) : suggestions && currentSuggestions.length > 0 ? (
            <motion.div key={activeTab}>
              {currentSuggestions.map((s, i) => (
                <SuggestionCard
                  key={s.word}
                  suggestion={s}
                  index={i}
                  onInsert={handleInsert}
                  accentColor={accentColor}
                />
              ))}
            </motion.div>
          ) : suggestions && currentSuggestions.length === 0 ? (
            <motion.div
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={styles.emptyState}
            >
              <p style={styles.emptyText}>
                No {activeTab} found for "<strong>{inputWord}</strong>".
              </p>
              <p style={styles.emptyHint}>Try a different word.</p>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={styles.emptyState}
            >
              <Sparkles size={32} color={accentColor} style={{ opacity: 0.4, marginBottom: 12 }} />
              <p style={styles.emptyText}>
                Type a word above and press <strong>Find</strong> to get
                context-aware suggestions.
              </p>
              <p style={styles.emptyHint}>
                Suggestions adapt to your poem's genre and mood.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Insert confirmation toast */}
      <AnimatePresence>
        {insertedWord && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ ...styles.toast, background: accentColor }}
          >
            ✦ "{insertedWord}" copied to clipboard
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
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
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
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
  },
  genreBadge: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.75rem',
    padding: '3px 10px',
    borderRadius: '12px',
    fontWeight: 600,
  },
  inputRow: {
    display: 'flex',
    gap: '10px',
    padding: '16px 20px 0',
  },
  inputWrapper: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: '1.5px solid',
    borderRadius: '8px',
    padding: '8px 12px',
    background: 'white',
    transition: 'border-color 0.3s',
  },
  wordInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontFamily: 'var(--font-body)',
    fontSize: '0.95rem',
    color: 'var(--ink-black)',
  },
  fetchBtn: {
    border: 'none',
    borderRadius: '8px',
    padding: '8px 18px',
    color: 'white',
    fontFamily: 'var(--font-body)',
    fontSize: '0.9rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  errorText: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.82rem',
    color: '#C0392B',
    padding: '8px 20px 0',
    margin: 0,
  },
  tabs: {
    display: 'flex',
    padding: '12px 20px 0',
    gap: '4px',
  },
  tab: {
    flex: 1,
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    padding: '8px 4px',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    fontSize: '0.88rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'all 0.2s',
  },
  tabCount: {
    fontSize: '0.72rem',
    fontWeight: 700,
    padding: '1px 6px',
    borderRadius: '10px',
  },
  suggList: {
    padding: '16px 20px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    minHeight: '280px',
    overflowY: 'auto',
  },
  suggCard: {
    background: 'white',
    borderRadius: '8px',
    padding: '12px 14px',
    cursor: 'default',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    marginBottom: '8px',
  },
  suggTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  suggWord: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.1rem',
    fontWeight: 700,
    letterSpacing: '0.3px',
  },
  insertBtn: {
    border: 'none',
    borderRadius: '6px',
    padding: '4px 10px',
    fontSize: '0.78rem',
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    transition: 'all 0.2s',
  },
  suggReason: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.78rem',
    color: 'var(--soft-black)',
    opacity: 0.65,
    lineHeight: 1.5,
    margin: 0,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    textAlign: 'center',
  },
  emptyText: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.95rem',
    color: 'var(--soft-black)',
    lineHeight: 1.6,
    marginBottom: '8px',
  },
  emptyHint: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.82rem',
    color: 'var(--soft-black)',
    opacity: 0.55,
    fontStyle: 'italic',
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '8px 0',
  },
  skeleton: {
    height: '72px',
    borderRadius: '8px',
    background: 'linear-gradient(90deg, var(--aged-cream) 25%, var(--cream) 50%, var(--aged-cream) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  },
  toast: {
    position: 'absolute',
    bottom: '16px',
    left: '50%',
    transform: 'translateX(-50%)',
    color: 'white',
    fontFamily: 'var(--font-body)',
    fontSize: '0.82rem',
    fontWeight: 600,
    padding: '8px 18px',
    borderRadius: '20px',
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
};

export default SuggestionPanel;