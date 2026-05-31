import os
import sys
from pathlib import Path

# ── Path fix ──────────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))
sys.path.insert(0, str(PROJECT_ROOT / 'src' / 'models'))

# ── HuggingFace cache setup ───────────────────────────────────
cache_dir = str(PROJECT_ROOT / '.cache' / 'huggingface')
os.makedirs(cache_dir, exist_ok=True)
os.environ['HF_HOME'] = cache_dir
os.environ['TRANSFORMERS_CACHE'] = cache_dir
os.environ['HF_DATASETS_CACHE'] = cache_dir


def download_models_from_hub():
    """
    Download models from HuggingFace Hub to local cache.
    Only downloads if not already cached.
    """
    from huggingface_hub import snapshot_download
    import shutil

    repo_id  = os.environ.get('HF_REPO_ID', 'eo-the-reds/kalam-models')
    hf_token = os.environ.get('HF_TOKEN', None)

    print(f"Downloading models from HuggingFace: {repo_id}")

    # Download entire repo to cache
    local_dir = snapshot_download(
        repo_id=repo_id,
        repo_type='model',
        token=hf_token,
        local_dir=str(PROJECT_ROOT / '.cache' / 'kalam-models'),
    )

    print(f"✓ Models downloaded to: {local_dir}")
    return local_dir


class MLService:
    _instance  = None
    _analyzer  = None
    _engine    = None
    _is_loaded = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MLService, cls).__new__(cls)
        return cls._instance

    def load(self):
        if self._is_loaded:
            return

        print("Loading ML models...")

        try:
            # Download from HuggingFace if on production (Render)
            # Use local models if available
            local_models = PROJECT_ROOT / 'models'
            hf_cache     = PROJECT_ROOT / '.cache' / 'kalam-models'

            if not local_models.exists() or not (local_models / 'genre_classifier').exists():
                print("Local models not found — downloading from HuggingFace...")
                model_base = Path(download_models_from_hub())
            else:
                print("Using local models...")
                model_base = local_models

            # Set model paths in environment so analyze.py can find them
            os.environ['KALAM_MODELS_PATH'] = str(model_base)

            from analyze import CompletePoetryAnalyzer
            from suggestion_engine import PoetrySuggestionEngine

            self._analyzer  = CompletePoetryAnalyzer()
            self._engine    = PoetrySuggestionEngine()
            self._is_loaded = True
            print("✓ All ML models loaded successfully!")

        except Exception as e:
            print(f"✗ ML model loading failed: {e}")
            raise

    def analyze_poem(self, poem_text):
        if not self._is_loaded:
            raise RuntimeError("ML models not loaded")
        return self._analyzer.analyze_complete(poem_text)

    def get_word_suggestions(self, word, poem_text, num_suggestions=5):
        if not self._is_loaded:
            raise RuntimeError("ML models not loaded")
        context = self._engine.analyze_context(poem_text)
        if not context:
            return []
        return self._engine.suggest_words(word, context, num_suggestions)

    def get_rhyme_suggestions(self, word, poem_text, num_suggestions=5):
        if not self._is_loaded:
            raise RuntimeError("ML models not loaded")
        context = self._engine.analyze_context(poem_text)
        if not context:
            return []
        return self._engine.suggest_with_rhyme(word, context, num_suggestions)

    def get_all_suggestions(self, word, poem_text):
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


ml_service = MLService()