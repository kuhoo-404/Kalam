// Mock data for development (before backend is ready)

export const mockAnalysis = {
  genre: {
    genre: "Misery",
    confidence: 0.75,
    top_3: [
      { genre: "Misery", confidence: 0.75 },
      { genre: "Nostalgia", confidence: 0.15 },
      { genre: "Philosophical & Reflective", confidence: 0.10 }
    ],
    all_probabilities: {
      "Misery": 0.75,
      "Nostalgia": 0.15,
      "Philosophical & Reflective": 0.10,
      "Romantic": 0.05,
      "Hope&Joy": 0.03,
      "Everyday Life": 0.02
    }
  },
  sentiment: {
    label: "negative",
    compound: -0.85,
    confidence: 0.88,
    scores: {
      negative: 0.88,
      neutral: 0.10,
      positive: 0.02
    }
  },
  interpretation: "A very negative Misery poem"
};

export const mockSuggestions = [
  {
    word: "storm",
    score: 1.85,
    reason: "Common in Misery poetry; Matches negative tone; Fits thematic context"
  },
  {
    word: "clouds",
    score: 1.72,
    reason: "Fits thematic context; Common in Misery poetry"
  },
  {
    word: "drizzle",
    score: 1.68,
    reason: "Semantically similar; Common in Misery poetry"
  },
  {
    word: "tempest",
    score: 1.54,
    reason: "Matches negative tone; Fits thematic context"
  },
  {
    word: "downpour",
    score: 1.48,
    reason: "Semantically similar"
  }
];

export const mockRhymes = [
  {
    word: "pain",
    score: 2.15,
    reason: "Rhymes with input; Common in Misery poetry; Matches negative tone"
  },
  {
    word: "drain",
    score: 2.08,
    reason: "Rhymes with input; Common in Misery poetry; Fits thematic context"
  },
  {
    word: "strain",
    score: 1.95,
    reason: "Rhymes with input; Matches negative tone"
  },
  {
    word: "stain",
    score: 1.87,
    reason: "Rhymes with input; Fits thematic context"
  },
  {
    word: "disdain",
    score: 1.75,
    reason: "Rhymes with input; Matches negative tone"
  }
];

export const templates = [
  {
    id: 1,
    genre: "Romantic",
    name: "Love Letters",
    description: "Express your deepest emotions with words that touch the heart. Perfect for romantic verses, love poems, and heartfelt declarations.",
    colors: {
      primary: "#FFF0F0",
      secondary: "#FFE0E0",
      accent: "#D4A5A5",
      text: "#8B4755"
    },
    icon: "❤️",
    sample: "Your eyes like stars in velvet night,\nMy heart beats faster in your sight...",
    decorations: "Rose petals, soft watercolor edges, delicate flourishes"
  },
  {
    id: 2,
    genre: "Misery",
    name: "Dark Depths",
    description: "Pour your sorrow onto paper, find solace in words. For expressing loss, pain, and melancholic thoughts.",
    colors: {
      primary: "#E8E0D5",
      secondary: "#D8D0C5",
      accent: "#6B6B6B",
      text: "#2C2416"
    },
    icon: "💔",
    sample: "The rain falls heavy on my soul,\nDarkness wraps around my heart...",
    decorations: "Rain textures, ink blots, heavy shadows, torn edges"
  },
  {
    id: 3,
    genre: "Nostalgia",
    name: "Memory Lane",
    description: "Revisit cherished moments through the lens of time. Perfect for reminiscing about the past and treasured memories.",
    colors: {
      primary: "#F4E8D0",
      secondary: "#E8DCC4",
      accent: "#A68A64",
      text: "#6B5B3D"
    },
    icon: "📷",
    sample: "I remember summer days of old,\nWhen laughter filled the golden air...",
    decorations: "Vintage photo corners, sepia tones, old postage stamps, aged paper"
  },
  {
    id: 4,
    genre: "Hope&Joy",
    name: "Sunshine Pages",
    description: "Celebrate life's beautiful moments with uplifting verses. For expressing joy, optimism, and positive energy.",
    colors: {
      primary: "#FFFEF0",
      secondary: "#FFF8E0",
      accent: "#FFD700",
      text: "#8B7355"
    },
    icon: "☀️",
    sample: "The morning brings a brand new day,\nWith endless possibilities...",
    decorations: "Watercolor splashes, sunshine rays, flower doodles, light textures"
  },
  {
    id: 5,
    genre: "Philosophical & Reflective",
    name: "Deep Thoughts",
    description: "Explore existence, truth, and the human condition. For contemplative verses and philosophical musings.",
    colors: {
      primary: "#F0EBE0",
      secondary: "#E5E0D5",
      accent: "#8B7355",
      text: "#4A3C28"
    },
    icon: "🤔",
    sample: "What is the nature of our being?\nIn this vast cosmos, what is meaning?...",
    decorations: "Library book pages, margin notes, underlines, quill marks"
  },
  {
    id: 6,
    genre: "Everyday Life",
    name: "Simple Moments",
    description: "Find poetry in the ordinary, beauty in the mundane. For capturing daily observations and simple pleasures.",
    colors: {
      primary: "#F5F0E5",
      secondary: "#EAE5DA",
      accent: "#A89078",
      text: "#6B5842"
    },
    icon: "☕",
    sample: "Morning coffee, bitter and warm,\nSunlight dancing on the table...",
    decorations: "Coffee rings, casual doodles, notebook lines, everyday textures"
  }
];

// API mock functions
export const analyzePoem = async (poemText) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockAnalysis;
};

export const getSuggestions = async (word, poemText) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return {
    synonyms: mockSuggestions,
    rhymes: mockRhymes,
    context: mockAnalysis
  };
};