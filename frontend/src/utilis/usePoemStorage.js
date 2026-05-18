// usePoemStorage.js
// All save/load/delete logic lives here.
// When Django backend is ready, only replace the functions marked
// with "// TODO: REPLACE WITH API CALL" — nothing else changes.

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'inkmuse_saved_poems';

// ── Helpers ────────────────────────────────────────────────────
const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (poems) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(poems));
  } catch (e) {
    console.error('Could not save poem:', e);
  }
};

const generateId = () =>
  `poem_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

// ── Hook ───────────────────────────────────────────────────────
const usePoemStorage = () => {
  const [poems, setPoems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all poems on mount
  useEffect(() => {
    // TODO: REPLACE WITH API CALL
    // const res = await fetch('/api/poems/', { headers: { Authorization: `Bearer ${token}` } });
    // const data = await res.json();
    // setPoems(data);
    const data = loadFromStorage();
    setPoems(data);
    setIsLoading(false);
  }, []);

  // Save a new poem or update existing
  const savePoem = useCallback(({ id, title, content, genre, wordCount, lineCount }) => {
    // TODO: REPLACE WITH API CALL
    // await fetch('/api/poems/', { method: 'POST', body: JSON.stringify({ title, content, genre }) });

    const now = new Date();
    const poem = {
      id: id || generateId(),
      title: title || untitledTitle(content),
      content,
      genre,
      wordCount,
      lineCount,
      savedAt: now.toISOString(),
      savedAtDisplay: now.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setPoems(prev => {
      const exists = prev.findIndex(p => p.id === poem.id);
      const updated = exists >= 0
        ? prev.map(p => p.id === poem.id ? poem : p)
        : [poem, ...prev];
      saveToStorage(updated);
      return updated;
    });

    return poem;
  }, []);

  // Delete a poem
  const deletePoem = useCallback((id) => {
    // TODO: REPLACE WITH API CALL
    // await fetch(`/api/poems/${id}/`, { method: 'DELETE' });

    setPoems(prev => {
      const updated = prev.filter(p => p.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }, []);

  // Get single poem by id
  const getPoem = useCallback((id) => {
    return poems.find(p => p.id === id) || null;
  }, [poems]);

  return { poems, isLoading, savePoem, deletePoem, getPoem };
};

// Generate a title from the first line of content
const untitledTitle = (content) => {
  if (!content?.trim()) return 'Untitled Poem';
  const firstLine = content.trim().split('\n')[0].trim();
  if (firstLine.length <= 32) return firstLine;
  return firstLine.slice(0, 32).trim() + '…';
};

export default usePoemStorage;