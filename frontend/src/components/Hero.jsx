import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Feather, ArrowDown } from 'lucide-react';
import '../styles/hero.css';

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="hero paper-crumpled">
      {/* Decorative ink blots */}
      <div className="ink-blot ink-blot-1"></div>
      <div className="ink-blot ink-blot-2"></div>
      <div className="ink-blot ink-blot-3"></div>

      <div className="hero-container">
        {/* Floating quill icon */}
        <div className={`hero-icon ${isVisible ? 'float' : ''}`}>
          <Feather size={56} strokeWidth={1.5} />
        </div>

        {/* Main headline */}
        <h1 className={`hero-title ${isVisible ? 'fade-in-up-1' : ''}`}>
          Write Poetry That{' '}
          <span className="hero-highlight">Feels Alive</span>
        </h1>

        {/* Subheading */}
        <p className={`hero-subtitle ${isVisible ? 'fade-in-up-2' : ''}`}>
          Context-aware suggestions that understand your voice, your mood,
          and the rhythm of your words.
        </p>

        {/* CTA Buttons */}
        <div className={`hero-buttons ${isVisible ? 'fade-in-up-3' : ''}`}>
          <Link to="/write">
            <button className="btn-vintage btn-hero-primary">
              <Feather size={18} style={{ marginRight: '8px' }} />
              Start Writing
            </button>
          </Link>
          <Link to="/templates">
            <button className="btn-outline-vintage">
              Browse Templates
            </button>
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className={`scroll-indicator ${isVisible ? 'fade-in-up-4' : ''}`}>
          <span className="scroll-text">SCROLL</span>
          <ArrowDown size={20} className="scroll-arrow" />
        </div>
      </div>
    </section>
  );
};

export default Hero;