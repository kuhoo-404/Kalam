"""
Train Word2Vec embeddings on poetry corpus
Creates domain-specific word vectors for context-aware suggestions
"""

import json
import re
import numpy as np
from gensim.models import Word2Vec
from gensim.models.phrases import Phrases, Phraser
import pickle
import os
from tqdm import tqdm

class PoetryEmbeddingTrainer:
    def __init__(self, corpus_path='../../data/corpus/poetry_corpus.json'):
        """Initialize trainer with poetry corpus"""
        self.corpus_path = corpus_path
        self.sentences = []
        self.model = None
        
    def load_corpus(self):
        """Load and preprocess poetry corpus"""
        print("Loading poetry corpus...")
        
        with open(self.corpus_path, 'r', encoding='utf-8') as f:
            poems = json.load(f)
        
        print(f"✓ Loaded {len(poems)} poems")
        return poems
    
    def preprocess_text(self, text):
        """
        Clean and tokenize poem text
        Preserve poetic structure while normalizing
        """
        # Lowercase
        text = text.lower()
        
        # Remove special characters but keep apostrophes and hyphens
        text = re.sub(r'[^a-z\s\'-]', ' ', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Split into words
        words = text.strip().split()
        
        # Remove very short words (likely artifacts) but keep meaningful ones
        words = [w for w in words if len(w) > 1 or w in ['i', 'a']]
        
        return words
    
    def prepare_sentences(self, poems):
        """
        Convert poems into sentences for training
        Each line becomes a sentence
        """
        print("\nPreparing sentences for training...")
        
        sentences = []
        
        for poem in tqdm(poems):
            text = poem['text']
            
            # Split by lines (poems are line-based)
            lines = text.split('\n')
            
            for line in lines:
                words = self.preprocess_text(line)
                
                # Only keep lines with at least 3 words
                if len(words) >= 3:
                    sentences.append(words)
        
        print(f"✓ Prepared {len(sentences)} sentences")
        
        # Show sample
        print("\nSample sentences:")
        for i, sent in enumerate(sentences[:3]):
            print(f"  {i+1}. {' '.join(sent)}")
        
        return sentences
    
    def detect_phrases(self, sentences):
        """
        Detect common phrases (bigrams) like "broken heart", "falling rain"
        This helps the model learn multi-word expressions
        """
        print("\nDetecting common phrases...")
        
        # Train phrase detector
        phrases = Phrases(sentences, min_count=5, threshold=10)
        phraser = Phraser(phrases)
        
        # Apply phrase detection
        sentences_with_phrases = []
        for sent in sentences:
            # This converts ["broken", "heart"] to ["broken_heart"]
            phrased = phraser[sent]
            sentences_with_phrases.append(phrased)
        
        # Show detected phrases
        detected = [token for sent in sentences_with_phrases for token in sent if '_' in token]
        unique_phrases = set(detected)
        
        print(f"✓ Detected {len(unique_phrases)} common phrases")
        print("\nSample phrases:")
        for phrase in list(unique_phrases)[:10]:
            print(f"  - {phrase.replace('_', ' ')}")
        
        return sentences_with_phrases
    
    def train_word2vec(self, sentences):
        """
        Train Word2Vec model on poetry
        
        Parameters chosen for poetry:
        - vector_size=100: Balanced size (not too small, not too large)
        - window=5: Context window (considers 5 words before/after)
        - min_count=2: Keep words appearing at least twice
        - sg=1: Skip-gram (better for rare words, common in poetry)
        """
        print("\nTraining Word2Vec model...")
        print(f"Training on {len(sentences)} sentences...")
        
        model = Word2Vec(
            sentences=sentences,
            vector_size=100,      # Embedding dimension
            window=5,             # Context window size
            min_count=2,          # Minimum word frequency
            workers=4,            # Parallel processing
            sg=1,                 # Use skip-gram (1) vs CBOW (0)
            epochs=10,            # Training iterations
            seed=42               # Reproducibility
        )
        
        print("✓ Training complete!")
        
        # Show vocabulary size
        vocab_size = len(model.wv)
        print(f"\nVocabulary size: {vocab_size} words")
        
        return model
    
    def evaluate_embeddings(self, model):
        """
        Test the trained embeddings with poetry-specific examples
        """
        print("\n" + "="*60)
        print("EVALUATING EMBEDDINGS")
        print("="*60)
        
        test_words = [
            'love', 'heart', 'moon', 'night', 'death',
            'joy', 'sorrow', 'dream', 'soul', 'tears'
        ]
        
        print("\nSemantic Similarity Tests:\n")
        
        for word in test_words:
            if word in model.wv:
                similar = model.wv.most_similar(word, topn=5)
                print(f"{word:12} → {', '.join([w for w, _ in similar])}")
            else:
                print(f"{word:12} → (not in vocabulary)")
        
        print("\n" + "-"*60)
        print("Analogy Tests:\n")
        
        # Test poetic analogies
        analogies = [
            ('day', 'night', 'sun'),      # day:night :: sun:?
            ('love', 'hate', 'joy'),      # love:hate :: joy:?
            ('life', 'death', 'birth'),   # life:death :: birth:?
        ]
        
        for pos1, neg1, pos2 in analogies:
            try:
                if all(w in model.wv for w in [pos1, neg1, pos2]):
                    result = model.wv.most_similar(
                        positive=[pos2, neg1],
                        negative=[pos1],
                        topn=1
                    )
                    print(f"{pos1}:{neg1} :: {pos2}:{result[0][0]}")
            except:
                pass
        
        print("="*60 + "\n")
    
    def save_model(self, model, output_dir='../../models/embeddings'):
        """
        Save the trained model
        """
        os.makedirs(output_dir, exist_ok=True)
        
        # Save full model
        model_path = os.path.join(output_dir, 'poetry_word2vec.model')
        model.save(model_path)
        print(f"✓ Model saved to {model_path}")
        
        # Save just the word vectors (smaller, faster to load)
        wv_path = os.path.join(output_dir, 'poetry_embeddings.kv')
        model.wv.save(wv_path)
        print(f"✓ Word vectors saved to {wv_path}")
        
        # Save vocabulary for reference
        vocab = {
            'vocab_size': len(model.wv),
            'vector_size': model.wv.vector_size,
            'top_words': [word for word in model.wv.index_to_key[:100]]
        }
        
        vocab_path = os.path.join(output_dir, 'vocabulary.json')
        with open(vocab_path, 'w') as f:
            json.dump(vocab, f, indent=2)
        print(f"✓ Vocabulary info saved to {vocab_path}")
    
    def train(self):
        """
        Complete training pipeline
        """
        print("="*60)
        print("POETRY WORD2VEC TRAINING")
        print("="*60)
        
        # Load corpus
        poems = self.load_corpus()
        
        # Prepare sentences
        sentences = self.prepare_sentences(poems)
        self.sentences = sentences
        
        # Detect phrases
        sentences_with_phrases = self.detect_phrases(sentences)
        
        # Train Word2Vec
        model = self.train_word2vec(sentences_with_phrases)
        self.model = model
        
        # Evaluate
        self.evaluate_embeddings(model)
        
        # Save
        self.save_model(model)
        
        print("="*60)
        print("✅ TRAINING COMPLETE!")
        print("="*60)
        print("\nYour embeddings are ready for context-aware suggestions!")
        
        return model


def main():
    """Main execution"""
    trainer = PoetryEmbeddingTrainer()
    model = trainer.train()


if __name__ == "__main__":
    main()