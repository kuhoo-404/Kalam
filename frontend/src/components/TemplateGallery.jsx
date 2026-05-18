import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Feather, Download, Trash2 } from 'lucide-react';
import TemplateCard from './TemplateCard';

export const GENRES = [
  {
    id: 'romantic',
    label: 'Romantic',
    tagline: 'Love & Longing',
    desc: 'Pour your heart onto the page.\nLet love speak in the only language it knows.',
    bg: 'linear-gradient(160deg, #7B1A2E 0%, #C0394B 45%, #E8758A 100%)',
    color: '#C0394B',
    accentColor: '#E8758A',
    pillBg: 'rgba(192,57,75,0.35)',
    modalBg: 'linear-gradient(160deg, #4A0D1C 0%, #8B2035 100%)',
    btnColor: '#C0394B',
    placeholder: 'Your eyes like stars above the tide...\n\nLet love speak in the only tongue it knows.',
  },
  {
    id: 'misery',
    label: 'Misery',
    tagline: 'Shadow & Rain',
    desc: 'Let the darkness have its say.\nSome truths only emerge in shadow.',
    bg: 'linear-gradient(160deg, #0D1525 0%, #2C3E6B 50%, #4A5E8A 100%)',
    color: '#2C3E6B',
    accentColor: '#6A8FD4',
    pillBg: 'rgba(44,62,107,0.4)',
    modalBg: 'linear-gradient(160deg, #080E1C 0%, #1A2A50 100%)',
    btnColor: '#2C3E6B',
    placeholder: 'The rain falls heavy on my soul...\n\nDarkness wraps around like a familiar coat.',
  },
  {
    id: 'nostalgia',
    label: 'Nostalgia',
    tagline: 'Memory & Time',
    desc: 'A memory waiting to be written.\nWhere does the past live, if not in words?',
    bg: 'linear-gradient(160deg, #3D2000 0%, #8B5E1A 50%, #C9943A 100%)',
    color: '#8B5E1A',
    accentColor: '#D4A96A',
    pillBg: 'rgba(139,94,26,0.35)',
    modalBg: 'linear-gradient(160deg, #241200 0%, #5C3D10 100%)',
    btnColor: '#8B5E1A',
    placeholder: 'I remember summer days of old...\n\nThe laughter that lived in those long afternoons.',
  },
  {
    id: 'hope',
    label: 'Hope & Joy',
    tagline: 'Light & Bloom',
    desc: 'Let the light find its words.\nJoy is never too small a subject.',
    bg: 'linear-gradient(160deg, #0A2E1A 0%, #1A6B3C 50%, #3AAD6A 100%)',
    color: '#1A6B3C',
    accentColor: '#72C99A',
    pillBg: 'rgba(26,107,60,0.35)',
    modalBg: 'linear-gradient(160deg, #061A0E 0%, #0E4524 100%)',
    btnColor: '#1A6B3C',
    placeholder: 'The morning broke like a song...\n\nAnd everything felt possible again.',
  },
  {
    id: 'philosophical',
    label: 'Philosophical',
    tagline: 'Thought & Cosmos',
    desc: 'Begin with a question.\nThe deepest poems ask — they do not answer.',
    bg: 'linear-gradient(160deg, #1A0A30 0%, #4A2C6B 50%, #7A52A8 100%)',
    color: '#4A2C6B',
    accentColor: '#B07AE0',
    pillBg: 'rgba(74,44,107,0.35)',
    modalBg: 'linear-gradient(160deg, #0E0620 0%, #2E1848 100%)',
    btnColor: '#4A2C6B',
    placeholder: 'What is the weight of a single thought...\n\nDoes the universe feel it when we grieve?',
  },
  {
    id: 'everyday',
    label: 'Everyday Life',
    tagline: 'Ordinary & Sacred',
    desc: 'Notice what others walk past.\nThe ordinary holds the most extraordinary light.',
    bg: 'linear-gradient(160deg, #062030 0%, #1A5A6B 50%, #3A96A8 100%)',
    color: '#1A5A6B',
    accentColor: '#6AC5D4',
    pillBg: 'rgba(26,90,107,0.35)',
    modalBg: 'linear-gradient(160deg, #031018 0%, #0E3A48 100%)',
    btnColor: '#1A5A6B',
    placeholder: 'Tuesday smelled like coffee and old rain...\n\nThe bus was late. Nobody noticed the sky.',
  },
];

/* ── Modal writing experience ───────────────────────────────── */
const GenreModal = ({ genre, onClose }) => {
  const [poem, setPoem] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const textareaRef = useRef(null);
  const saveTimer = useRef(null);
  const navigate = useNavigate();

  const wordCount = poem.trim() ? poem.trim().split(/\s+/).length : 0;
  const lineCount = poem ? poem.split('\n').filter(l => l.trim()).length : 0;

  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 320);
  }, []);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  useEffect(() => {
    setIsSaved(false);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (poem.trim()) {
      saveTimer.current = setTimeout(() => {
        setIsSaved(true);
        setLastSaved(new Date());
      }, 2000);
    }
    return () => clearTimeout(saveTimer.current);
  }, [poem]);

  const handleDownload = () => {
    const blob = new Blob([poem], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${genre.id}-poem.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (poem && window.confirm('Clear the page?')) setPoem('');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={modalStyles.overlay}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.88, y: 32 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 24, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        style={{ ...modalStyles.modal, background: genre.modalBg }}
      >
        {/* ── Header ── */}
        <div style={{
          ...modalStyles.header,
          borderBottom: `1px solid ${genre.accentColor}22`,
        }}>
          <div>
            <span style={{
              ...modalStyles.pill,
              background: genre.pillBg,
              color: genre.accentColor,
              border: `1px solid ${genre.accentColor}44`,
            }}>
              {genre.label.toUpperCase()}
            </span>
            <h2 style={modalStyles.modalTitle}>{genre.tagline}</h2>
            <p style={modalStyles.modalSub}>{genre.desc.replace('\n', ' ')}</p>
          </div>

          <div style={modalStyles.headerRight}>
            {/* Toolbar buttons */}
            <AnimatePresence>
              {isSaved && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ ...modalStyles.savedTag, color: genre.accentColor }}
                >
                  ✦ saved
                </motion.span>
              )}
            </AnimatePresence>
            <button onClick={handleDownload} style={modalStyles.iconBtn} title="Download">
              <Download size={15} color="rgba(255,255,255,0.7)" />
            </button>
            <button onClick={handleClear} style={modalStyles.iconBtn} title="Clear">
              <Trash2 size={15} color="rgba(255,255,255,0.7)" />
            </button>
            <button onClick={onClose} style={modalStyles.closeBtn} aria-label="Close">
              <X size={16} color="rgba(255,255,255,0.85)" />
            </button>
          </div>
        </div>

        {/* ── Writing area ── */}
        <div style={modalStyles.writingArea}>
          {/* Ruled lines */}
          <div style={modalStyles.ruledLines} aria-hidden="true">
            {Array.from({ length: 22 }).map((_, i) => (
              <div
                key={i}
                style={{
                  ...modalStyles.ruledLine,
                  borderBottomColor: `${genre.accentColor}14`,
                }}
              />
            ))}
          </div>

          {/* Margin rule */}
          <div style={{
            ...modalStyles.marginRule,
            background: genre.accentColor,
          }} aria-hidden="true" />

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={poem}
            onChange={e => setPoem(e.target.value)}
            placeholder={genre.placeholder}
            spellCheck={false}
            style={{
              ...modalStyles.textarea,
              caretColor: genre.accentColor,
            }}
          />
        </div>

        {/* ── Footer ── */}
        <div style={{
          ...modalStyles.footer,
          borderTop: `1px solid ${genre.accentColor}18`,
        }}>
          <div style={modalStyles.footerStats}>
            <span style={modalStyles.footerStat}>
              {lineCount} {lineCount === 1 ? 'line' : 'lines'}
            </span>
            <span style={modalStyles.footerDot}>·</span>
            <span style={modalStyles.footerStat}>
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </span>
            {lastSaved && (
              <>
                <span style={modalStyles.footerDot}>·</span>
                <span style={modalStyles.footerStat}>
                  saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </>
            )}
          </div>

          <div style={modalStyles.footerRight}>
            <button
              onClick={() => navigate('/write', { state: { genre: genre.label, poem } })}
              style={{
                ...modalStyles.fullEditorBtn,
                background: genre.btnColor,
              }}
            >
              <Feather size={13} style={{ marginRight: 6 }} />
              Full Editor
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ── Gallery page ───────────────────────────────────────────── */
const TemplateGallery = () => {
  const [activeGenre, setActiveGenre] = useState(null);

  // Lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = activeGenre ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [activeGenre]);

  return (
    <section style={galleryStyles.section}>
      <div style={galleryStyles.container}>

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={galleryStyles.header}
        >
          <p style={galleryStyles.eyebrow}>TEMPLATES</p>
          <h2 style={galleryStyles.title}>Choose Your Genre</h2>
          <p style={galleryStyles.subtitle}>
            Every genre opens its own world. Hover to preview, click to begin.
          </p>
        </motion.div>

        {/* Card rail */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          style={galleryStyles.rail}
        >
          {GENRES.map((g, i) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <TemplateCard genre={g} onOpen={setActiveGenre} />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {activeGenre && (
          <GenreModal
            genre={activeGenre}
            onClose={() => setActiveGenre(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

/* ── Modal styles ── */
const modalStyles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.75)',
    zIndex: 2000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    backdropFilter: 'blur(6px)',
  },
  modal: {
    width: '100%',
    maxWidth: '800px',
    borderRadius: '14px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '88vh',
    boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '22px 26px 18px',
    flexShrink: 0,
  },
  pill: {
    display: 'inline-block',
    fontSize: '9px',
    fontWeight: 700,
    letterSpacing: '3px',
    fontFamily: 'var(--font-body)',
    padding: '4px 11px',
    borderRadius: '20px',
    marginBottom: '9px',
  },
  modalTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '24px',
    fontWeight: 700,
    color: '#fff',
    lineHeight: 1.2,
    marginBottom: '5px',
  },
  modalSub: {
    fontFamily: 'var(--font-body)',
    fontSize: '13px',
    color: 'rgba(255,255,255,0.5)',
    margin: 0,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },
  savedTag: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.72rem',
    fontStyle: 'italic',
    letterSpacing: '0.8px',
  },
  iconBtn: {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '6px',
    cursor: 'pointer',
    padding: '6px 8px',
    display: 'flex',
    alignItems: 'center',
    transition: 'background 0.2s',
  },
  closeBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.2)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s',
    marginLeft: '4px',
  },
  writingArea: {
    flex: 1,
    position: 'relative',
    background: 'rgba(0,0,0,0.22)',
    minHeight: '380px',
    overflow: 'hidden',
  },
  ruledLines: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 1,
  },
  ruledLine: {
    height: '36px',
    borderBottom: '1px solid',
  },
  marginRule: {
    position: 'absolute',
    left: '60px',
    top: 0,
    bottom: 0,
    width: '1.5px',
    opacity: 0.18,
    zIndex: 1,
    pointerEvents: 'none',
    borderRadius: '2px',
  },
  textarea: {
    position: 'absolute',
    inset: 0,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    resize: 'none',
    fontFamily: 'var(--font-display)',
    fontSize: '1.1rem',
    lineHeight: '36px',
    color: 'rgba(255,255,255,0.92)',
    padding: '4px 28px 16px 76px',
    zIndex: 2,
    letterSpacing: '0.2px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 26px',
    flexShrink: 0,
    background: 'rgba(0,0,0,0.2)',
  },
  footerStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  footerStat: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.4)',
  },
  footerDot: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: '0.75rem',
  },
  footerRight: {
    display: 'flex',
    gap: '10px',
  },
  fullEditorBtn: {
    display: 'flex',
    alignItems: 'center',
    fontFamily: 'var(--font-body)',
    fontSize: '0.82rem',
    fontWeight: 700,
    color: 'white',
    border: 'none',
    borderRadius: '7px',
    padding: '8px 18px',
    cursor: 'pointer',
    letterSpacing: '0.3px',
    transition: 'opacity 0.2s, transform 0.15s',
  },
};

/* ── Gallery styles ── */
const galleryStyles = {
  section: {
    padding: '80px 20px 100px',
    background: 'linear-gradient(180deg, var(--cream) 0%, var(--aged-cream) 100%)',
  },
  container: {
    maxWidth: '1300px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '48px',
  },
  eyebrow: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.85rem',
    letterSpacing: '3px',
    color: 'var(--coffee-brown)',
    fontWeight: 700,
    marginBottom: '10px',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(2rem, 4vw, 3rem)',
    fontWeight: 800,
    color: 'var(--ink-black)',
    marginBottom: '12px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontFamily: 'var(--font-body)',
    fontSize: '1.1rem',
    color: 'var(--soft-black)',
    opacity: 0.7,
    maxWidth: '480px',
    lineHeight: 1.7,
  },
  rail: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    paddingBottom: '16px',
  },
};

export default TemplateGallery;