# Kalam - Poetry Writing Platform

An AI-powered poetry writing assistant that provides context-aware suggestions to help poets find the perfect words while maintaining their unique voice.

## Project Overview

Kalam is an immersive poetry writing platform designed for semi-experienced poets. Unlike generic writing assistants, Kalam understands poetic context through:

-Genre Classification - Detects poetry style (Romantic, Misery, Nostalgia, Hope & Joy, Philosophical, Everyday Life)
-Sentiment Analysis - Understands emotional tone
-Context-Aware Suggestions - Word suggestions that match your poem's mood and genre
- Intelligent Rhyme Finder- Pronunciation-based rhymes that fit your context

##  Key Features

- 🎭 **6 Genre Detection** - Custom-trained classifier (70% accuracy)
- 💭 **Sentiment Analysis** - Real-time emotional tone detection
- 📚 **11,744 Word Vocabulary** - Poetry-specific embeddings
- 🎵 **Smart Rhyme Matching** - Context-aware, pronunciation-based


## ML Pipeline

### Models

1. Genre Classifier
   - Base: DistilBERT (fine-tuned)
   - Dataset: 300 poems (6 genres)
   - Accuracy: 70%
   - Size: 255 MB

2. Sentiment Analyzer
   - Model: RoBERTa (pre-trained)
   - Source: cardiffnlp/twitter-roberta-base-sentiment-latest
   - Output: positive/negative/neutral + compound score

3. Word Embeddings
   - Algorithm: Word2Vec (Skip-gram)
   - Corpus: 2,139 poems
   - Vocabulary: 11,744 words
   - Dimensions: 100

### Architecture
```
User Input → Context Analysis → Suggestion Engine
                ↓
        ┌───────┴────────┐
        ↓                ↓
   Genre Model    Sentiment Model
        ↓                ↓
        └───────┬────────┘
                ↓
          Word Embeddings
                ↓
    Context-Aware Suggestions
```

##  Getting Started

### Prerequisites

- Python 3.13+
- 8GB RAM minimum
- 5GB disk space

### Installation

1. Clone the repository:
```bash
git clone https://github.com/kuho-404/kalam.git
cd kalam
```

2. Create virtual environment:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Download trained models:
```bash
# Models are too large for GitHub
# Download from [Google Drive link] and extract to models/
```

### Quick Test
```python
from src.models.suggestion_engine import PoetrySuggestionEngine

# Initialize
engine = PoetrySuggestionEngine()

# Test poem
poem = "The rain falls heavy on my soul"
context = engine.analyze_context(poem)

# Get suggestions
suggestions = engine.suggest_words('rain', context)
print(suggestions)
```

## Performance

| Component | Metric | Value |
|-----------|--------|-------|
| Genre Classifier | Accuracy | 70% |
| Genre Classifier | Inference Time | ~200ms |
| Sentiment Analysis | Inference Time | ~150ms |
| Word Embeddings | Vocabulary | 11,744 words |
| Suggestion Engine | Response Time | ~400ms |

##  Project Structure
```
Kalam/
├── data/
│   ├── raw/              # Original genre CSVs
│   ├── processed/        # Train/test splits
│   └── corpus/           # 2,139 poems for embeddings
├── models/
│   ├── genre_classifier/ # Trained DistilBERT (not in git)
│   └── embeddings/       # Word2Vec models (not in git)
├── src/
│   ├── data/
│   │   ├── prepare_dataset.py
│   │   └── collect_poetry_corpus.py
│   └── models/
│       ├── train_classifier.py
│       ├── sentiment_analyzer.py
│       ├── train_embeddings.py
│       ├── analyze.py
│       └── suggestion_engine.py
└── requirements.txt
```

## Tech Stack

- ML Frameworks:PyTorch, Transformers, Gensim
- NLP Libraries: NLTK, Pronouncing (CMU Dictionary)
- Data Processing:Pandas, NumPy
- Visualization: Matplotlib, Seaborn

##  Model Training

### Genre Classifier
```bash
cd src/models
python train_classifier.py
```

### Word Embeddings
```bash
python train_embeddings.py
```



## 🧪 Testing
```bash
# Run tests
python -m pytest

# Run specific test
python src/models/suggestion_engine.py
```



##  Acknowledgments

- PoetryDB for the poetry corpus
- HuggingFace for pre-trained models
- CMU Pronouncing Dictionary for rhyme detection



---

**Built with ❤️ for poets everywhere**
