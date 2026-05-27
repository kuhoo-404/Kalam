import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Feather, Trash2, Clock, Edit3, Search, FileText } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import usePoemStorage from '../utilis/usePoemStorage';

const GENRE_COLORS = {
  'Romantic':       { color: '#D96C8A', bg: 'linear-gradient(135deg, #2B0D18 0%, #5E1830 100%)', glow: 'rgba(217,108,138,0.20)' },
  'Misery':         { color: '#6E7FAE', bg: 'linear-gradient(135deg, #0B1020 0%, #1B2745 100%)', glow: 'rgba(110,127,174,0.18)' },
  'Nostalgia':      { color: '#C89A54', bg: 'linear-gradient(135deg, #2B1B0F 0%, #5A381B 100%)', glow: 'rgba(200,154,84,0.20)' },
  'Hope & Joy':     { color: '#71B97A', bg: 'linear-gradient(135deg, #0B2414 0%, #174227 100%)', glow: 'rgba(113,185,122,0.18)' },
  'Philosophical':  { color: '#9D7AE0', bg: 'linear-gradient(135deg, #140B24 0%, #2B1848 100%)', glow: 'rgba(157,122,224,0.18)' },
  'Everyday Life':  { color: '#63B6C9', bg: 'linear-gradient(135deg, #081C22 0%, #163843 100%)', glow: 'rgba(99,182,201,0.18)' },
};

const getGenreStyle = (genre) =>
  GENRE_COLORS[genre] || { color: '#8B7355', bg: 'linear-gradient(135deg, #2C2416 0%, #4A3C28 100%)', glow: 'rgba(139,115,85,0.18)' };

// ── Poem Card ────────────────────────────────────────────────
const PoemCard = ({ poem, onOpen, onDelete, index }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const style = getGenreStyle(poem.genre);
  const preview = poem.content
    ?.split('\n')
    .filter(l => l.trim())
    .slice(0, 3)
    .join('\n') || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.07, duration: 0.45 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      style={{ ...cardStyles.card, background: style.bg, boxShadow: `0 16px 48px ${style.glow}` }}
    >
      <div style={{ ...cardStyles.glow, background: style.glow }} />

      <div style={{ ...cardStyles.genrePill, color: style.color, border: `1px solid ${style.color}40` }}>
        {poem.genre || 'Unknown'}
      </div>

      <h3 style={cardStyles.title}>{poem.title}</h3>
      <p style={cardStyles.preview}>{preview}</p>

      <div style={cardStyles.meta}>
        <div style={cardStyles.metaItem}>
          <Clock size={11} color="rgba(255,255,255,0.35)" />
          <span style={cardStyles.metaText}>{poem.savedAtDisplay}</span>
        </div>
        <div style={cardStyles.metaItem}>
          <FileText size={11} color="rgba(255,255,255,0.35)" />
          <span style={cardStyles.metaText}>{poem.wordCount || 0} words</span>
        </div>
      </div>

      <div style={cardStyles.actions}>
        <button
          onClick={() => onOpen(poem)}
          style={{ ...cardStyles.openBtn, background: style.color }}
        >
          <Edit3 size={13} style={{ marginRight: 6 }} />
          Open & Edit
        </button>

        {confirmDelete ? (
          <div style={cardStyles.confirmRow}>
            <span style={cardStyles.confirmText}>Delete?</span>
            <button onClick={() => onDelete(poem.id)} style={cardStyles.confirmYes}>Yes</button>
            <button onClick={() => setConfirmDelete(false)} style={cardStyles.confirmNo}>No</button>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(true)} style={cardStyles.deleteBtn}>
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ── Empty State ───────────────────────────────────────────────
const EmptyState = () => {
  const navigate = useNavigate();

  const handleStartWriting = () => {
    const token = localStorage.getItem('access_token');
    navigate(token ? '/write' : '/login');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={pageStyles.empty}
    >
      <div style={pageStyles.emptyIcon}>
        <Feather size={36} color="#8B7355" />
      </div>
      <h3 style={pageStyles.emptyTitle}>No poems saved yet</h3>
      <p style={pageStyles.emptySubtitle}>
        Start writing and save your first poem. It will appear here.
      </p>
      <button onClick={handleStartWriting} style={pageStyles.emptyBtn}>
        <Feather size={15} style={{ marginRight: 8 }} />
        Start Writing
      </button>
    </motion.div>
  );
};

// ── Main Page ─────────────────────────────────────────────────
const SavedPoems = () => {
  const navigate = useNavigate();
  const { poems, isLoading, deletePoem } = usePoemStorage();
  const [search, setSearch] = useState('');
  const [filterGenre, setFilterGenre] = useState('All');

  const genres = ['All', ...Object.keys(GENRE_COLORS)];

  const filtered = poems.filter(p => {
    const matchesSearch =
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.content?.toLowerCase().includes(search.toLowerCase());
    const matchesGenre = filterGenre === 'All' || p.genre === filterGenre;
    return matchesSearch && matchesGenre;
  });

  const handleOpen = (poem) => {
    navigate('/write', {
      state: { poem: poem.content, genre: poem.genre, poemId: poem.id },
    });
  };

  return (
    <>
      <Navbar />
      <div style={pageStyles.page}>
        <div style={pageStyles.container}>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={pageStyles.header}
          >
            <p style={pageStyles.eyebrow}>YOUR LIBRARY</p>
            <h1 style={pageStyles.title}>Saved Poems</h1>
            <p style={pageStyles.subtitle}>
              {poems.length} {poems.length === 1 ? 'poem' : 'poems'} in your collection
            </p>
          </motion.div>

          {/* Search + Filter */}
          {poems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              style={pageStyles.controls}
            >
              <div style={pageStyles.searchWrapper}>
                <Search size={15} color="#8B7355" style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Search your poems..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={pageStyles.searchInput}
                />
              </div>

              <div style={pageStyles.filterRow}>
                {genres.map(g => (
                  <button
                    key={g}
                    onClick={() => setFilterGenre(g)}
                    style={{
                      ...pageStyles.filterBtn,
                      background: filterGenre === g
                        ? (GENRE_COLORS[g]?.color || '#8B7355')
                        : 'rgba(139,115,85,0.10)',
                      color: filterGenre === g ? 'white' : '#5C4A34',
                      border: filterGenre === g
                        ? '1.5px solid transparent'
                        : '1.5px solid rgba(139,115,85,0.20)',
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Content */}
          {isLoading ? (
            <div style={pageStyles.loadingGrid}>
              {[1, 2, 3].map(i => (
                <div key={i} style={pageStyles.skeleton} />
              ))}
            </div>
          ) : filtered.length === 0 && poems.length === 0 ? (
            <EmptyState />
          ) : filtered.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={pageStyles.noResults}
            >
              No poems match your search.
            </motion.p>
          ) : (
            <motion.div style={pageStyles.grid} layout>
              <AnimatePresence>
                {filtered.map((poem, i) => (
                  <PoemCard
                    key={poem.id}
                    poem={poem}
                    index={i}
                    onOpen={handleOpen}
                    onDelete={deletePoem}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

// ── Card Styles ───────────────────────────────────────────────
const cardStyles = {
  card: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '20px',
    padding: '28px 24px 22px',
    border: '1px solid rgba(255,255,255,0.07)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    cursor: 'default',
    transition: 'box-shadow 0.3s ease',
  },
  glow: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    filter: 'blur(80px)',
    top: '-100px',
    right: '-80px',
    opacity: 0.5,
    pointerEvents: 'none',
  },
  genrePill: {
    display: 'inline-block',
    fontFamily: 'var(--font-body)',
    fontSize: '0.68rem',
    fontWeight: 700,
    letterSpacing: '2.5px',
    textTransform: 'uppercase',
    padding: '4px 11px',
    borderRadius: '20px',
    background: 'rgba(255,255,255,0.06)',
    alignSelf: 'flex-start',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.3rem',
    fontWeight: 700,
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 1.3,
    margin: 0,
  },
  preview: {
    fontFamily: 'var(--font-display)',
    fontSize: '0.92rem',
    color: 'rgba(255,255,255,0.42)',
    lineHeight: 1.8,
    whiteSpace: 'pre-line',
    margin: 0,
    flex: 1,
    fontStyle: 'italic',
  },
  meta: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    marginTop: '4px',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  metaText: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.72rem',
    color: 'rgba(255,255,255,0.32)',
    letterSpacing: '0.3px',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '6px',
  },
  openBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-body)',
    fontSize: '0.8rem',
    fontWeight: 700,
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '9px 16px',
    cursor: 'pointer',
    letterSpacing: '0.3px',
    transition: 'opacity 0.2s',
  },
  deleteBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.10)',
    color: 'rgba(255,100,100,0.7)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    flexShrink: 0,
  },
  confirmRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  confirmText: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.5)',
  },
  confirmYes: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.75rem',
    fontWeight: 700,
    padding: '4px 10px',
    borderRadius: '6px',
    background: 'rgba(220,60,60,0.3)',
    border: '1px solid rgba(220,60,60,0.4)',
    color: '#FF9090',
    cursor: 'pointer',
  },
  confirmNo: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.75rem',
    padding: '4px 10px',
    borderRadius: '6px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.10)',
    color: 'rgba(255,255,255,0.5)',
    cursor: 'pointer',
  },
};

// ── Page Styles ───────────────────────────────────────────────
const pageStyles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #F5F1E8 0%, #E8DCC4 100%)',
    padding: '60px 20px 120px',
  },
  container: {
    maxWidth: '1300px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '40px',
  },
  eyebrow: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.78rem',
    letterSpacing: '4px',
    color: '#8B7355',
    fontWeight: 700,
    marginBottom: '10px',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(2.4rem, 5vw, 3.6rem)',
    fontWeight: 800,
    color: '#2C2416',
    marginBottom: '10px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontFamily: 'var(--font-body)',
    fontSize: '1rem',
    color: '#6B5B42',
    opacity: 0.8,
  },
  controls: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '40px',
  },
  searchWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'white',
    border: '1.5px solid rgba(139,115,85,0.20)',
    borderRadius: '10px',
    padding: '10px 16px',
    maxWidth: '420px',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontFamily: 'var(--font-body)',
    fontSize: '0.95rem',
    color: '#2C2416',
  },
  filterRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  filterBtn: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.78rem',
    fontWeight: 600,
    padding: '6px 14px',
    borderRadius: '20px',
    cursor: 'pointer',
    transition: 'all 0.22s ease',
    letterSpacing: '0.3px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  loadingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  skeleton: {
    height: '280px',
    borderRadius: '20px',
    background: 'linear-gradient(90deg, #E8DCC4 25%, #F5F1E8 50%, #E8DCC4 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '100px 20px',
    textAlign: 'center',
  },
  emptyIcon: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: 'rgba(139,115,85,0.10)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  emptyTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.8rem',
    fontWeight: 700,
    color: '#2C2416',
    marginBottom: '10px',
  },
  emptySubtitle: {
    fontFamily: 'var(--font-body)',
    fontSize: '1rem',
    color: '#6B5B42',
    lineHeight: 1.7,
    maxWidth: '360px',
    marginBottom: '28px',
  },
  emptyBtn: {
    display: 'flex',
    alignItems: 'center',
    fontFamily: 'var(--font-body)',
    fontSize: '0.9rem',
    fontWeight: 700,
    color: 'white',
    background: 'linear-gradient(135deg, #8B7355 0%, #6B5842 100%)',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 28px',
    cursor: 'pointer',
    letterSpacing: '0.5px',
    boxShadow: '0 6px 20px rgba(107,88,66,0.30)',
  },
  noResults: {
    fontFamily: 'var(--font-body)',
    fontSize: '1rem',
    color: '#6B5B42',
    textAlign: 'center',
    padding: '60px 0',
    opacity: 0.65,
    fontStyle: 'italic',
  },
};

export default SavedPoems;