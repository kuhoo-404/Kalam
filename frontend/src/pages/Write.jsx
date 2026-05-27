import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WritingEditor from '../components/WritingEditor';
import SuggestionPanel from '../components/SuggestionPanel';
import SentimentMeter from '../components/SentimentMeter';
import { analyzePoem } from '../utilis/api';

const Write = () => {
  const location = useLocation();

  const initialPoem  = location.state?.poem  || '';
  const initialGenre = location.state?.genre || 'Romantic';

  const [poem, setPoem]                   = useState(initialPoem);
  const [sentiment, setSentiment]         = useState(0);        // ← -1 to 1, not 0-100
  const [detectedGenre, setDetectedGenre] = useState(null);
  const [isAnalyzing, setIsAnalyzing]     = useState(false);

  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!poem || poem.trim().length < 20) return;

    debounceRef.current = setTimeout(async () => {
      try {
        setIsAnalyzing(true);
        const res = await analyzePoem(poem);

        // Keep raw -1 to 1 score — SentimentMeter expects compound prop in this range
        const score = res.data.sentiment_score;
        setSentiment(score);
        setDetectedGenre(res.data.genre);

      } catch (err) {
        console.error('Analysis failed:', err);
      } finally {
        setIsAnalyzing(false);
      }
    }, 800);

    return () => clearTimeout(debounceRef.current);
  }, [poem]);

  return (
    <>
      <Navbar />

      <div style={{
        minHeight: '100vh',
        padding: '50px 20px',
        background: 'linear-gradient(180deg, #F5F1E8 0%, #E8DCC4 100%)',
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '300px 1fr 260px',
          gap: '24px',
          alignItems: 'start',
        }}>

          {/* LEFT — Suggestions */}
          <div>
            <SuggestionPanel
              poemText={poem}
              genre={detectedGenre}
              sentiment={sentiment}
            />
          </div>

          {/* CENTER — Editor */}
          <div>
            <WritingEditor
              onPoemChange={setPoem}
              initialPoem={initialPoem}
              initialGenre={initialGenre}
              detectedGenre={detectedGenre}
            />
          </div>

          {/* RIGHT — Sentiment */}
          <div>
            <SentimentMeter
              compound={sentiment}          // ← was "sentiment", now "compound"
              genre={detectedGenre}         // ← added so genre hint shows
              isAnalyzing={isAnalyzing}
            />
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
};

export default Write;