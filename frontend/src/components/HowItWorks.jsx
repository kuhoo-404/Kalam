import React from 'react';
import { PenTool, Brain, Sparkles } from 'lucide-react';
import '../styles/how-it-works.css';

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      icon: <PenTool size={40} strokeWidth={1.5} />,
      title: "Write Your Poem",
      description: "Begin with a single line or pour out entire stanzas. Our vintage editor provides a distraction-free writing experience.",
      color: "#D4A5A5"
    },
    {
      number: "02",
      icon: <Brain size={40} strokeWidth={1.5} />,
      title: "AI Detects Genre & Mood",
      description: "Our intelligent system analyzes your words, detecting the style, mood, and emotional undertones of your poetry.",
      color: "#C9A66B"
    },
    {
      number: "03",
      icon: <Sparkles size={40} strokeWidth={1.5} />,
      title: "Get Contextual Suggestions",
      description: "Receive perfectly matched word suggestions, rhymes, and synonyms that enhance your unique poetic voice.",
      color: "#8B7355"
    }
  ];

  return (
    <section className="how-it-works paper-crumpled torn-edge-top">
      <div className="how-container">
        {/* Section header */}
        <div className="how-header scroll-reveal">
          <p className="how-eyebrow">HOW IT WORKS</p>
          <h2 className="how-title">Three Simple Steps</h2>
          <p className="how-subtitle">
            From blank page to polished poetry in moments.
          </p>
        </div>

        {/* Steps timeline */}
        <div className="steps-timeline">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`step-card scroll-reveal fade-in-up-${index + 1}`}
            >
              {/* Step number */}
              <div className="step-number" style={{ color: step.color }}>
                {step.number}
              </div>

              {/* Icon */}
              <div 
                className="step-icon"
                style={{ 
                  background: `${step.color}15`,
                  color: step.color
                }}
              >
                {step.icon}
              </div>

              {/* Content */}
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>

              {/* Connecting line (not on last item) */}
              {index < steps.length - 1 && (
                <div className="step-connector" style={{ background: step.color }}></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;