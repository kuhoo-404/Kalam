import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Music } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Brain size={48} />,
      title: "Understands Your Style",
      description: "Our AI detects whether you're writing sonnets, haikus, free verse, or something entirely new. It adapts to your unique voice.",
      color: "#D4A5A5"
    },
    {
      icon: <Sparkles size={48} />,
      title: "Words That Fit Your Mood",
      description: "Suggestions that match the emotional tone of your poem. Melancholic? Joyful? Contemplative? We understand.",
      color: "#C9A66B"
    },
    {
      icon: <Music size={48} />,
      title: "Perfect Rhymes, Every Time",
      description: "Find the exact rhyme you need, from perfect matches to slant rhymes that add subtle musical quality.",
      color: "#8B7355"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };

  return (
    <section style={styles.section}>
      <div className="container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={styles.header}
        >
          <p style={styles.eyebrow}>FEATURES</p>
          <h2 style={styles.title}>Crafted for Poets</h2>
          <p style={styles.subtitle}>
            Every feature designed to enhance your creative flow, not interrupt it.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          style={styles.grid}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="card-paper"
              style={styles.card}
            >
              {/* Icon */}
              <div style={{
                ...styles.iconWrapper,
                background: `${feature.color}15`
              }}>
                <div style={{ color: feature.color }}>
                  {feature.icon}
                </div>
              </div>

              {/* Title */}
              <h3 style={styles.featureTitle}>{feature.title}</h3>

              {/* Description */}
              <p style={styles.featureDescription}>{feature.description}</p>

              {/* Decorative line */}
              <div style={{
                ...styles.decorativeLine,
                background: feature.color
              }} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const styles = {
  section: {
    padding: '100px 20px',
    background: 'linear-gradient(180deg, var(--cream) 0%, var(--aged-cream) 100%)'
  },
  header: {
    textAlign: 'center',
    marginBottom: '60px'
  },
  eyebrow: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.9rem',
    letterSpacing: '3px',
    color: 'var(--coffee-brown)',
    fontWeight: 600,
    marginBottom: '12px'
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    fontWeight: 700,
    color: 'var(--ink-black)',
    marginBottom: '16px'
  },
  subtitle: {
    fontFamily: 'var(--font-body)',
    fontSize: '1.2rem',
    color: 'var(--soft-black)',
    maxWidth: '600px',
    margin: '0 auto'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '32px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  card: {
    padding: '40px 32px',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },
  iconWrapper: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px'
  },
  featureTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.6rem',
    fontWeight: 600,
    color: 'var(--ink-black)',
    marginBottom: '16px'
  },
  featureDescription: {
    fontFamily: 'var(--font-body)',
    fontSize: '1.05rem',
    color: 'var(--soft-black)',
    lineHeight: 1.7,
    marginBottom: '24px'
  },
  decorativeLine: {
    width: '60px',
    height: '3px',
    margin: '0 auto',
    borderRadius: '2px',
    opacity: 0.6
  }
};

export default Features;