import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pencil,
  Sparkles,
  Heart,
  CloudRain,
  Clock3,
  Sun,
  MoonStar,
  Coffee,
} from 'lucide-react';

const ICONS = {
  romantic: <Heart size={18} />,
  misery: <CloudRain size={18} />,
  nostalgia: <Clock3 size={18} />,
  hope: <Sun size={18} />,
  philosophical: <MoonStar size={18} />,
  everyday: <Coffee size={18} />,
};

const TemplateCard = ({ genre, onOpen }) => {
  const [hovered, setHovered] = useState(false);

  const renderDecorations = () => {
    switch (genre.id) {
      case 'nostalgia':
        return (
          <>
            {/* Old tape */}
            <div style={styles.tapeTop} />
            <div style={styles.tapeBottom} />

            {/* Photo corners */}
            <div style={styles.cornerTL} />
            <div style={styles.cornerTR} />
            <div style={styles.cornerBL} />
            <div style={styles.cornerBR} />

            {/* Stamp */}
            <div style={styles.postageStamp}>
              1987
            </div>

            {/* Film grain */}
            <div className="film-grain" style={styles.overlayFill} />
          </>
        );

      case 'hope':
        return (
          <>
            {/* Watercolor blobs */}
            <motion.div
              animate={{
                scale: hovered ? 1.15 : 1,
                rotate: hovered ? 8 : 0,
              }}
              transition={{ duration: 0.6 }}
              style={styles.watercolorOne}
            />

            <motion.div
              animate={{
                scale: hovered ? 1.1 : 1,
                y: hovered ? -5 : 0,
              }}
              transition={{ duration: 0.7 }}
              style={styles.watercolorTwo}
            />

            {/* Floating sparkles */}
            {hovered &&
              [1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: [0, 1, 0],
                    y: [-10, -40],
                    x: [0, i % 2 === 0 ? 10 : -10],
                  }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  style={{
                    ...styles.sparkle,
                    left: `${20 + i * 15}%`,
                    top: `${30 + i * 8}%`,
                  }}
                >
                  ✦
                </motion.div>
              ))}
          </>
        );

      case 'romantic':
        return (
          <>
            <motion.div
              animate={{
                scale: hovered ? 1.2 : 1,
                opacity: hovered ? 0.35 : 0.2,
              }}
              style={styles.roseGlow}
            />

            <div style={styles.rosePetal1} />
            <div style={styles.rosePetal2} />
          </>
        );

      case 'misery':
        return (
          <>
            {/* Rain overlay */}
            <div style={styles.rainOverlay} />

            {/* Dark vignette */}
            <div style={styles.heavyVignette} />

            {/* Fog */}
            <motion.div
              animate={{
                x: hovered ? 10 : -10,
                opacity: hovered ? 0.3 : 0.15,
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              style={styles.fog}
            />
          </>
        );

      case 'philosophical':
        return (
          <>
            <motion.div
              animate={{
                rotate: hovered ? 180 : 0,
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              style={styles.cosmicRing}
            />

            <div style={styles.stars} />
          </>
        );

      case 'everyday':
        return (
          <>
            {/* Coffee stain */}
            <div style={styles.coffeeStain} />

            {/* Notebook lines */}
            <div style={styles.notebookLines}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.noteLine,
                    top: `${40 + i * 18}px`,
                  }}
                />
              ))}
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => onOpen(genre)}
      whileHover={{
        scale: 1.08,
        y: -12,
        rotate: genre.id === 'nostalgia' ? -2 : 0,
        zIndex: 10,
        boxShadow: `0 30px 70px ${genre.color}55`,
        transition: {
          type: 'spring',
          stiffness: 260,
          damping: 20,
        },
      }}
      whileTap={{
        scale: 1.03,
      }}
      className={
        genre.id === 'nostalgia'
          ? 'film-grain polaroid-flash'
          : ''
      }
      style={{
        ...styles.card,
        background: genre.bg,
        ...(genre.id === 'nostalgia'
          ? styles.nostalgiaCard
          : {}),
        ...(genre.id === 'hope'
          ? styles.hopeCard
          : {}),
        ...(genre.id === 'misery'
          ? styles.miseryCard
          : {}),
      }}
      tabIndex={0}
      role="button"
      aria-label={`Open ${genre.label} template`}
      onKeyDown={(e) =>
        (e.key === 'Enter' || e.key === ' ') &&
        onOpen(genre)
      }
    >
      {/* Main texture */}
      <div style={styles.noise} />

      {/* Decorative genre layers */}
      {renderDecorations()}

      {/* Hover top bar */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={styles.hoverStrip}
          >
            <div style={styles.stripBtn}>
              <Pencil size={12} color="white" />
            </div>

            <div style={styles.stripBtn}>
              <Sparkles size={12} color="white" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gradient overlay */}
      <div style={styles.vignette} />

      {/* Main content */}
      <div style={styles.body}>
        {/* Icon */}
        <motion.div
          animate={{
            rotate: hovered ? 8 : 0,
            scale: hovered ? 1.1 : 1,
          }}
          transition={{ duration: 0.3 }}
          style={styles.iconWrap}
        >
          {ICONS[genre.id]}
        </motion.div>

        {/* Genre tag */}
        <span
          style={{
            ...styles.tag,
            background:
              genre.id === 'nostalgia'
                ? 'rgba(120,80,30,0.25)'
                : 'rgba(255,255,255,0.18)',
            border:
              genre.id === 'nostalgia'
                ? '1px solid rgba(90,60,20,0.25)'
                : '1px solid rgba(255,255,255,0.28)',
            color:
              genre.id === 'nostalgia'
                ? '#3F2A16'
                : 'rgba(255,255,255,0.92)',
          }}
        >
          {genre.label.toUpperCase()}
        </span>

        {/* Title */}
        <h3
          style={{
            ...styles.tagline,
            color:
              genre.id === 'nostalgia'
                ? '#2D1D10'
                : '#fff',
            fontFamily:
              genre.id === 'nostalgia'
                ? '"Courier New", monospace'
                : 'var(--font-display)',
          }}
        >
          {genre.tagline}
        </h3>

        {/* Description */}
        <p
          style={{
            ...styles.desc,
            color:
              genre.id === 'nostalgia'
                ? 'rgba(50,30,10,0.75)'
                : 'rgba(255,255,255,0.68)',
          }}
        >
          {genre.desc.split('\n')[0]}
        </p>
      </div>

      {/* Hover glow */}
      <motion.div
        animate={{
          opacity: hovered ? 1 : 0,
        }}
        transition={{ duration: 0.25 }}
        style={{
          ...styles.hoverGlow,
          background: `radial-gradient(circle at center, ${genre.accentColor}55 0%, transparent 70%)`,
        }}
      />
    </motion.div>
  );
};

const styles = {
  card: {
    width: '220px',
    height: '320px',
    borderRadius: '18px',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    flexShrink: 0,
    userSelect: 'none',
    border: '1px solid rgba(255,255,255,0.08)',
    transformStyle: 'preserve-3d',
    transition: 'all 0.35s ease',
  },

  nostalgiaCard: {
    filter: 'sepia(0.15)',
    backgroundBlendMode: 'multiply',
  },

  hopeCard: {
    boxShadow: '0 12px 40px rgba(255,220,120,0.12)',
  },

  miseryCard: {
    boxShadow: '0 18px 50px rgba(20,30,60,0.25)',
  },

  overlayFill: {
    position: 'absolute',
    inset: 0,
  },

  noise: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`,
    opacity: 0.35,
    mixBlendMode: 'overlay',
    pointerEvents: 'none',
  },

  hoverStrip: {
    position: 'absolute',
    top: 14,
    right: 14,
    display: 'flex',
    gap: '8px',
    zIndex: 10,
  },

  stripBtn: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.16)',
    border: '1px solid rgba(255,255,255,0.2)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  vignette: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.12) 55%, transparent 100%)',
    pointerEvents: 'none',
  },

  body: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '20px',
    zIndex: 5,
  },

  iconWrap: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.14)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    marginBottom: '16px',
    backdropFilter: 'blur(8px)',
  },

  tag: {
    display: 'inline-block',
    fontSize: '9px',
    fontWeight: 700,
    letterSpacing: '2.5px',
    fontFamily: 'var(--font-body)',
    padding: '4px 10px',
    borderRadius: '6px',
    marginBottom: '10px',
    backdropFilter: 'blur(4px)',
  },

  tagline: {
    fontSize: '22px',
    fontWeight: 700,
    lineHeight: 1.15,
    marginBottom: '8px',
  },

  desc: {
    fontFamily: 'var(--font-body)',
    fontSize: '13px',
    lineHeight: 1.55,
    margin: 0,
  },

  hoverGlow: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    opacity: 0,
  },

  /* Nostalgia */
  tapeTop: {
    position: 'absolute',
    width: '80px',
    height: '20px',
    background: 'rgba(255,240,200,0.28)',
    top: '14px',
    left: '20px',
    transform: 'rotate(-8deg)',
    backdropFilter: 'blur(2px)',
  },

  tapeBottom: {
    position: 'absolute',
    width: '70px',
    height: '18px',
    background: 'rgba(255,240,200,0.22)',
    bottom: '90px',
    right: '16px',
    transform: 'rotate(6deg)',
  },

  postageStamp: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    width: '52px',
    height: '52px',
    border: '2px dashed rgba(60,40,20,0.5)',
    background: 'rgba(255,240,210,0.4)',
    color: '#5B3A18',
    fontSize: '10px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transform: 'rotate(8deg)',
  },

  cornerTL: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    width: '24px',
    height: '24px',
    borderTop: '2px solid rgba(70,40,10,0.45)',
    borderLeft: '2px solid rgba(70,40,10,0.45)',
  },

  cornerTR: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    width: '24px',
    height: '24px',
    borderTop: '2px solid rgba(70,40,10,0.45)',
    borderRight: '2px solid rgba(70,40,10,0.45)',
  },

  cornerBL: {
    position: 'absolute',
    bottom: '12px',
    left: '12px',
    width: '24px',
    height: '24px',
    borderBottom: '2px solid rgba(70,40,10,0.45)',
    borderLeft: '2px solid rgba(70,40,10,0.45)',
  },

  cornerBR: {
    position: 'absolute',
    bottom: '12px',
    right: '12px',
    width: '24px',
    height: '24px',
    borderBottom: '2px solid rgba(70,40,10,0.45)',
    borderRight: '2px solid rgba(70,40,10,0.45)',
  },

  /* Hope */
  watercolorOne: {
    position: 'absolute',
    width: '180px',
    height: '180px',
    borderRadius: '50%',
    background:
      'radial-gradient(circle, rgba(255,255,180,0.35) 0%, transparent 70%)',
    top: '-30px',
    right: '-40px',
    filter: 'blur(8px)',
  },

  watercolorTwo: {
    position: 'absolute',
    width: '140px',
    height: '140px',
    borderRadius: '50%',
    background:
      'radial-gradient(circle, rgba(180,255,220,0.25) 0%, transparent 70%)',
    bottom: '30px',
    left: '-20px',
    filter: 'blur(10px)',
  },

  sparkle: {
    position: 'absolute',
    color: '#fff7c0',
    fontSize: '14px',
    zIndex: 4,
    pointerEvents: 'none',
  },

  /* Romantic */
  roseGlow: {
    position: 'absolute',
    width: '220px',
    height: '220px',
    borderRadius: '50%',
    background:
      'radial-gradient(circle, rgba(255,120,150,0.4) 0%, transparent 70%)',
    top: '-50px',
    left: '-40px',
    filter: 'blur(12px)',
  },

  rosePetal1: {
    position: 'absolute',
    width: '24px',
    height: '16px',
    borderRadius: '50%',
    background: 'rgba(255,180,200,0.2)',
    top: '70px',
    right: '34px',
    transform: 'rotate(24deg)',
  },

  rosePetal2: {
    position: 'absolute',
    width: '18px',
    height: '12px',
    borderRadius: '50%',
    background: 'rgba(255,180,200,0.16)',
    top: '100px',
    right: '60px',
    transform: 'rotate(-20deg)',
  },

  /* Misery */
  rainOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)',
    backgroundSize: '2px 14px',
    opacity: 0.15,
  },

  heavyVignette: {
    position: 'absolute',
    inset: 0,
    background:
      'radial-gradient(circle at center, transparent 20%, rgba(0,0,0,0.35) 100%)',
  },

  fog: {
    position: 'absolute',
    width: '220px',
    height: '100px',
    background:
      'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
    bottom: '30px',
    left: '-30px',
    filter: 'blur(20px)',
  },

  /* Philosophical */
  cosmicRing: {
    position: 'absolute',
    width: '180px',
    height: '180px',
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.08)',
    top: '-20px',
    right: '-30px',
  },

  stars: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.8) 1px, transparent 1px), radial-gradient(circle at 70% 20%, rgba(255,255,255,0.6) 1px, transparent 1px), radial-gradient(circle at 80% 60%, rgba(255,255,255,0.7) 1px, transparent 1px)',
  },

  /* Everyday */
  coffeeStain: {
    position: 'absolute',
    width: '90px',
    height: '90px',
    border: '5px solid rgba(120,70,20,0.12)',
    borderRadius: '50%',
    top: '24px',
    right: '22px',
    transform: 'rotate(12deg)',
  },

  notebookLines: {
    position: 'absolute',
    inset: 0,
    opacity: 0.08,
  },

  noteLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderBottom: '1px solid white',
  },
};

export default TemplateCard;