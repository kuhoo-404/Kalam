import os
import sys
from pathlib import Path

# ── Path fix — point Django to your ML code ──────────────────────
# backend/ is inside Kalam/, so we go up one level to reach src/
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))
sys.path.insert(0, str(PROJECT_ROOT / 'src' / 'models'))

# Set HuggingFace cache
cache_dir = str(PROJECT_ROOT / '.cache' / 'huggingface')
os.makedirs(cache_dir, exist_ok=True)
os.environ['HF_HOME'] = cache_dir
os.environ['TRANSFORMERS_CACHE'] = cache_dir
os.environ['HF_DATASETS_CACHE'] = cache_dir


class MLService:
    """
    Singleton service — loads all ML models once at server start.
    All views use this single instance.
    """
    _instance  = None
    _analyzer  = None
    _engine    = None
    _is_loaded = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MLService, cls).__new__(cls)
        return cls._instance

    def load(self):
        """Load all models — called once from AppConfig.ready()"""
        if self._is_loaded:
            return

        print("Loading ML models...")

        try:
            from analyze import CompletePoetryAnalyzer
            from suggestion_engine import PoetrySuggestionEngine

            self._analyzer = CompletePoetryAnalyzer()
            self._engine   = PoetrySuggestionEngine()
            self._is_loaded = True
            print("✓ All ML models loaded successfully!")

        except Exception as e:
            print(f"✗ ML model loading failed: {e}")
            raise

    def analyze_poem(self, poem_text):
        """
        Analyze poem — returns genre + sentiment

        Returns:
            {
                'genre': { 'genre': str, 'confidence': float, 'top_3': list },
                'sentiment': { 'label': str, 'compound': float },
                'interpretation': str
            }
        """
        if not self._is_loaded:
            raise RuntimeError("ML models not loaded")
        return self._analyzer.analyze_complete(poem_text)

    def get_context(self, poem_text):
        """Get poem context for suggestion engine"""
        if not self._is_loaded:
            raise RuntimeError("ML models not loaded")
        return self._engine.analyze_context(poem_text)

    def get_word_suggestions(self, word, poem_text, num_suggestions=5):
        """
        Get context-aware word suggestions

        Returns:
            list of { 'word': str, 'score': float, 'reason': str }
        """
        if not self._is_loaded:
            raise RuntimeError("ML models not loaded")

        context = self._engine.analyze_context(poem_text)
        if not context:
            return []

        return self._engine.suggest_words(word, context, num_suggestions)

    def get_rhyme_suggestions(self, word, poem_text, num_suggestions=5):
        """
        Get context-aware rhyme suggestions

        Returns:
            list of { 'word': str, 'score': float, 'reason': str }
        """
        if not self._is_loaded:
            raise RuntimeError("ML models not loaded")

        context = self._engine.analyze_context(poem_text)
        if not context:
            return []

        return self._engine.suggest_with_rhyme(word, context, num_suggestions)

    def get_all_suggestions(self, word, poem_text):
        """
        Get both word suggestions and rhymes in one call.
        This is what the frontend calls on word select.

        Returns:
            {
                'synonyms': [...],
                'rhymes': [...],
                'context': { 'genre': str, 'sentiment': str, 'sentiment_score': float }
            }
        """
        if not self._is_loaded:
            raise RuntimeError("ML models not loaded")

        context = self._engine.analyze_context(poem_text)
        if not context:
            return {'synonyms': [], 'rhymes': [], 'context': {}}

        synonyms = self._engine.suggest_words(word, context, num_suggestions=5)
        rhymes   = self._engine.suggest_with_rhyme(word, context, num_suggestions=5)

        return {
            'synonyms': synonyms,
            'rhymes':   rhymes,
            'context': {
                'genre':           context['genre'],
                'sentiment':       context['sentiment_label'],
                'sentiment_score': context['sentiment_compound'],
            }
        }


# ── Single shared instance ─────────────────────────────────────
ml_service = MLService()