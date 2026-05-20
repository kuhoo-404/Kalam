// usePoemStorage.js
// Replaced localStorage with Django REST API calls.

import { useState, useEffect, useCallback } from 'react';
import { getPoems, createPoem, updatePoem, deletePoem as apiDeletePoem } from './api';

// Generate a title from the first line of content
const untitledTitle = (content) => {
  if (!content?.trim()) return 'Untitled Poem';
  const firstLine = content.trim().split('\n')[0].trim();
  if (firstLine.length <= 32) return firstLine;
  return firstLine.slice(0, 32).trim() + '…';
};

// Format date for display
const formatDate = (isoString) => {
  return new Date(isoString).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Map Django response to frontend shape
const mapPoem = (p) => ({
  id: p.id,
  title: p.title || untitledTitle(p.content),
  content: p.content,
  genre: p.detected_genre || '',
  wordCount: p.word_count || 0,
  savedAt: p.updated_at,
  savedAtDisplay: formatDate(p.updated_at),
});

// ── Hook ───────────────────────────────────────────────────────
const usePoemStorage = () => {
  const [poems, setPoems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load all poems on mount
  useEffect(() => {
    const fetchPoems = async () => {
      try {
        setIsLoading(true);
        const res = await getPoems();
        setPoems(res.data.map(mapPoem));
      } catch (e) {
        console.error('Could not load poems:', e);
        setError('Could not load poems. Are you logged in?');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPoems();
  }, []);

  // Save a new poem or update existing
  const savePoem = useCallback(async ({ id, title, content, genre, wordCount, lineCount }) => {
    try {
      const payload = {
        title: title || untitledTitle(content),
        content,
        detected_genre: genre || '',
      };

      let res;
      if (id) {
        // Update existing poem
        res = await updatePoem(id, payload);
      } else {
        // Create new poem
        res = await createPoem(payload);
      }

      const saved = mapPoem(res.data);

      setPoems(prev => {
        const exists = prev.findIndex(p => p.id === saved.id);
        return exists >= 0
          ? prev.map(p => p.id === saved.id ? saved : p)
          : [saved, ...prev];
      });

      return saved;
    } catch (e) {
      console.error('Could not save poem:', e);
      setError('Could not save poem.');
    }
  }, []);

  // Delete a poem
  const deletePoem = useCallback(async (id) => {
    try {
      await apiDeletePoem(id);
      setPoems(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      console.error('Could not delete poem:', e);
      setError('Could not delete poem.');
    }
  }, []);

  // Get single poem by id
  const getPoem = useCallback((id) => {
    return poems.find(p => p.id === id) || null;
  }, [poems]);

  return { poems, isLoading, error, savePoem, deletePoem, getPoem };
};

export default usePoemStorage;