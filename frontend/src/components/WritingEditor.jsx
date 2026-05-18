import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Feather, Trash2, Download, BookOpen, Sparkles } from 'lucide-react';
import usePoemStorage from '../utilis/usePoemStorage';

const GENRES = [
  {
    id: 'romantic',
    label: 'Romantic',
    color: '#D96C8A',
    bg: 'linear-gradient(135deg, #2B0D18 0%, #5E1830 100%)',
    glow: 'rgba(217,108,138,0.28)',
  },
  {
    id: 'misery',
    label: 'Misery',
    color: '#6E7FAE',
    bg: 'linear-gradient(135deg, #0B1020 0%, #1B2745 100%)',
    glow: 'rgba(110,127,174,0.25)',
  },
  {
    id: 'nostalgia',
    label: 'Nostalgia',
    color: '#C89A54',
    bg: 'linear-gradient(135deg, #2B1B0F 0%, #5A381B 100%)',
    glow: 'rgba(200,154,84,0.28)',
  },
  {
    id: 'hope',
    label: 'Hope & Joy',
    color: '#71B97A',
    bg: 'linear-gradient(135deg, #0B2414 0%, #174227 100%)',
    glow: 'rgba(113,185,122,0.25)',
  },
  {
    id: 'philosophical',
    label: 'Philosophical',
    color: '#9D7AE0',
    bg: 'linear-gradient(135deg, #140B24 0%, #2B1848 100%)',
    glow: 'rgba(157,122,224,0.24)',
  },
  {
    id: 'everyday',
    label: 'Everyday Life',
    color: '#63B6C9',
    bg: 'linear-gradient(135deg, #081C22 0%, #163843 100%)',
    glow: 'rgba(99,182,201,0.24)',
  },
];

const WritingEditor = ({ onPoemChange, detectedGenre, initialGenre, initialPoem, poemId }) => {
  const [poem, setPoem]               = useState(initialPoem || '');
  const [selectedGenre, setSelectedGenre] = useState(
    GENRES.find(g => g.label.toLowerCase() === (initialGenre || '').toLowerCase()) || null
  );
  const [wordCount, setWordCount]     = useState(0);
  const [lineCount, setLineCount]     = useState(0);
  const [isSaved, setIsSaved]         = useState(false);
  const [lastSaved, setLastSaved]     = useState(null);
  const [inkBlots, setInkBlots]       = useState([]);
  const [particles, setParticles]     = useState([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { savePoem }      = usePoemStorage();
  const textareaRef       = useRef(null);
  const saveTimerRef      = useRef(null);
  const currentPoemId     = useRef(poemId || null);

  const activeGenre = detectedGenre
    ? GENRES.find(g => g.label.toLowerCase().includes(detectedGenre.toLowerCase())) || GENRES[0]
    : selectedGenre || GENRES[0];

  // ── Auto-save indicator (not real save — just "unsaved changes" dot) ──
  useEffect(() => {
    const lines = poem ? poem.split('\n') : [];
    const words = poem.trim() ? poem.trim().split(/\s+/).length : 0;
    setLineCount(lines.filter(l => l.trim()).length);
    setWordCount(words);
    if (onPoemChange) onPoemChange(poem);
    setIsSaved(false);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      if (poem.trim()) {
        setIsSaved(true);
        setLastSaved(new Date());
      }
    }, 1800);
    return () => clearTimeout(saveTimerRef.current);
  }, [poem]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!poem.trim()) return;
    const saved = savePoem({
      id: currentPoemId.current,
      title: null,
      content: poem,
      genre: activeGenre.label,
      wordCount,
      lineCount,
    });
    currentPoemId.current = saved.id;
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2200);
  };

  const createInkEffect = () => {
    const blot = {
      id: Date.now(),
      x: Math.random() * 80 + 10,
      y: Math.random() * 70 + 12,
      size: Math.random() * 70 + 20,
      opacity: Math.random() * 0.08 + 0.03,
    };
    setInkBlots(prev => [...prev.slice(-8), blot]);
  };

  const createParticle = () => {
    const particle = {
      id: Date.now() + Math.random(),
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: Math.random() * 4 + 6,
      size: Math.random() * 3 + 1,
    };
    setParticles(prev => [...prev.slice(-18), particle]);
  };

  const handleKeyDown = () => {
    if (Math.random() > 0.92) createInkEffect();
    if (Math.random() > 0.88) createParticle();
  };

  const handleClear = () => {
    if (poem && window.confirm('Clear the page?')) {
      setPoem('');
      setInkBlots([]);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([poem], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `${activeGenre.id}-poem.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div style={styles.wrapper}>

      {/* Genre Selector */}
      <div style={styles.genreRow}>
        <span style={styles.genreLabel}>
          <BookOpen size={14} style={{ marginRight: 6 }} />
          WRITING MOOD
        </span>
        <div style={styles.genrePills}>
          {GENRES.map(g => (
            <motion.button
              key={g.id}
              whileHover={{ y: -2, scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedGenre(g)}
              style={{
                ...styles.genrePill,
                background:   activeGenre?.id === g.id ? `${g.color}22` : 'rgba(255,255,255,0.03)',
                borderColor:  activeGenre?.id === g.id ? g.color : 'rgba(255,255,255,0.08)',
                color:        activeGenre?.id === g.id ? g.color : 'rgba(255,255,255,0.6)',
                boxShadow:    activeGenre?.id === g.id ? `0 0 25px ${g.glow}` : 'none',
              }}
            >
              {g.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Main Editor */}
      <motion.div
        layout
        transition={{ duration: 0.45 }}
        style={{
          ...styles.editorCard,
          background: activeGenre.bg,
          boxShadow: `0 30px 80px ${activeGenre.glow}`,
        }}
      >
        {/* Atmospheric glow */}
        <div style={{ ...styles.genreGlow, background: activeGenre.glow }} />

        {/* Floating particles */}
        {particles.map(p => (
          <span
            key={p.id}
            className="dust-particle"
            style={{
              left: `${p.left}%`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              width: p.size,
              height: p.size,
            }}
          />
        ))}

        {/* Ink blots */}
        {inkBlots.map(blot => (
          <motion.div
            key={blot.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: blot.opacity }}
            transition={{ duration: 1.2 }}
            style={{
              position: 'absolute',
              left: `${blot.x}%`,
              top: `${blot.y}%`,
              width: blot.size,
              height: blot.size,
              borderRadius: '50%',
              background: activeGenre.color,
              filter: 'blur(18px)',
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* Film grain */}
        <div className="film-grain" style={styles.filmGrain} />

        {/* Toolbar */}
        <div style={styles.toolbar}>
          <div style={styles.toolbarLeft}>
            <Feather size={16} color={activeGenre.color} />
            <span style={{ ...styles.toolbarText, color: activeGenre.color }}>
              {activeGenre.label}
            </span>
          </div>

          <div style={styles.toolbarRight}>
            <AnimatePresence>
              {isSaved && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{ ...styles.savedBadge, color: activeGenre.color }}
                >
                  <Sparkles size={12} />
                  saved
                </motion.div>
              )}
            </AnimatePresence>

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={!poem.trim()}
              title="Save poem to library"
              style={{
                ...styles.toolBtn,
                background:  saveSuccess ? `${activeGenre.color}30` : 'rgba(255,255,255,0.05)',
                borderColor: saveSuccess ? activeGenre.color : 'rgba(255,255,255,0.08)',
                opacity:     poem.trim() ? 1 : 0.35,
                cursor:      poem.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              {saveSuccess
                ? <span style={{ fontSize: '13px' }}>✦</span>
                : <Save size={15} />
              }
            </button>

            <button onClick={handleDownload} style={styles.toolBtn}>
              <Download size={15} />
            </button>

            <button onClick={handleClear} style={styles.toolBtn}>
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Writing area */}
        <div style={styles.writingArea}>
          {/* Ruled lines */}
          <div style={styles.ruledLines}>
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={i}
                style={{ ...styles.ruledLine, borderBottomColor: `${activeGenre.color}16` }}
              />
            ))}
          </div>

          {/* Margin line */}
          <div style={{ ...styles.marginLine, background: `${activeGenre.color}55` }} />

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={poem}
            onChange={e => setPoem(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            placeholder={`Begin here...\n\nLet the words arrive slowly.\nLet the silence shape the sentence.`}
            style={{ ...styles.textarea, caretColor: activeGenre.color }}
          />
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <div style={styles.stats}>
            <span style={styles.stat}>{lineCount} lines</span>
            <span style={styles.dot}>•</span>
            <span style={styles.stat}>{wordCount} words</span>
            {lastSaved && (
              <>
                <span style={styles.dot}>•</span>
                <span style={styles.stat}>
                  saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const styles = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' },
  genreRow: { display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' },
  genreLabel: {
    fontFamily: 'var(--font-body)', fontSize: '0.78rem', letterSpacing: '2px',
    color: 'var(--coffee-brown)', fontWeight: 700, display: 'flex', alignItems: 'center',
  },
  genrePills: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  genrePill: {
    fontFamily: 'var(--font-body)', fontSize: '0.8rem', padding: '8px 16px',
    borderRadius: '999px', border: '1px solid', background: 'transparent',
    cursor: 'pointer', transition: 'all 0.3s ease', backdropFilter: 'blur(8px)',
    letterSpacing: '0.5px',
  },
  editorCard: {
    position: 'relative', overflow: 'hidden', borderRadius: '28px',
    minHeight: '700px', display: 'flex', flexDirection: 'column',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  genreGlow: {
    position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
    filter: 'blur(120px)', top: '-120px', right: '-120px', opacity: 0.45, pointerEvents: 'none',
  },
  filmGrain: { position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.45 },
  toolbar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '18px 26px', borderBottom: '1px solid rgba(255,255,255,0.06)',
    backdropFilter: 'blur(14px)', zIndex: 5,
  },
  toolbarLeft:  { display: 'flex', alignItems: 'center', gap: '10px' },
  toolbarText:  { fontFamily: 'var(--font-body)', fontSize: '0.82rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700 },
  toolbarRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  savedBadge: {
    display: 'flex', alignItems: 'center', gap: '6px',
    fontFamily: 'var(--font-body)', fontSize: '0.78rem', letterSpacing: '1px', marginRight: '6px',
  },
  toolBtn: {
    width: '34px', height: '34px', borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.05)',
    color: 'rgba(255,255,255,0.7)', cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)',
    transition: 'all 0.25s ease',
  },
  writingArea: { position: 'relative', flex: 1, overflow: 'hidden' },
  ruledLines:  { position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' },
  ruledLine:   { height: '36px', borderBottom: '1px solid' },
  marginLine:  { position: 'absolute', top: 0, bottom: 0, left: '72px', width: '1px', zIndex: 2, opacity: 0.5 },
  textarea: {
    position: 'relative', zIndex: 3, width: '100%', height: '100%', minHeight: '560px',
    background: 'transparent', border: 'none', outline: 'none', resize: 'none',
    padding: '24px 40px 40px 100px', color: 'rgba(255,255,255,0.92)',
    fontFamily: 'var(--font-display)', fontSize: '1.18rem', lineHeight: '36px', letterSpacing: '0.3px',
  },
  footer: { padding: '16px 28px', borderTop: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', zIndex: 5 },
  stats: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  stat: { fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.4px' },
  dot:  { color: 'rgba(255,255,255,0.18)' },
};

export default WritingEditor;