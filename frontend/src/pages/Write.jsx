import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WritingEditor from '../components/WritingEditor';
import SuggestionPanel from '../components/SuggestionPanel';
import SentimentMeter from '../components/SentimentMeter';

const Write = () => {
  const location = useLocation();

  const initialPoem =
    location.state?.poem || '';

  const selectedGenre =
    location.state?.genre || 'Romantic';

  const [poem, setPoem] = useState(initialPoem);

  const [sentiment, setSentiment] = useState(50);

  return (
    <>
      <Navbar />

      <div
        style={{
          minHeight: '100vh',
          padding: '50px 20px',
          background:
            'linear-gradient(180deg, #F5F1E8 0%, #E8DCC4 100%)',
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '300px 1fr 260px',
            gap: '24px',
            alignItems: 'start',
          }}
        >
          {/* LEFT PANEL */}
          <div>
            <SuggestionPanel poem={poem} />
          </div>

          {/* CENTER */}
          <div>
            <WritingEditor
              onPoemChange={setPoem}
              sentiment={sentiment}
              initialPoem={initialPoem}
              initialGenre={selectedGenre}
            />
          </div>

          {/* RIGHT PANEL */}
          <div>
            <SentimentMeter sentiment={sentiment} />
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Write;