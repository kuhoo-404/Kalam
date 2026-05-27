"""
Context-Aware Suggestion Engine for Poetry
Uses embeddings + genre classifier + sentiment analyzer + pronunciation-based rhyming
"""

import os
import sys
import json
import numpy as np
from gensim.models import KeyedVectors
from collections import Counter
import re
import pronouncing

# Add the current directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from analyze import CompletePoetryAnalyzer


class PoetrySuggestionEngine:
    def __init__(self):
        """Initialize the suggestion engine with all components"""
        print("Initializing Poetry Suggestion Engine...")
        
        # Load word embeddings
        # Dynamic path — works from anywhere
        current_dir = os.path.dirname(os.path.abspath(__file__))
        embeddings_path = os.path.join(current_dir, '..', '..', 'models', 'embeddings', 'poetry_embeddings.kv')
        print(f"Loading embeddings from {embeddings_path}...")
        self.embeddings = KeyedVectors.load(embeddings_path, mmap='r')
        print(f"✓ Loaded {len(self.embeddings)} word vectors")
        
        # Load poetry analyzer (genre + sentiment)
        print("Loading poetry analyzer...")
        self.analyzer = CompletePoetryAnalyzer()
        print("✓ Analyzer loaded")
        
        # Load training data for genre-word associations
        print("Loading training data for genre associations...")
        self.genre_word_freq = self._build_genre_word_frequencies()
        print("✓ Genre associations built")
        
        print("\n✅ Suggestion engine ready!\n")
    
    def _build_genre_word_frequencies(self):
        """
        Build word frequency maps for each genre
        This tells us which words are common in which genres
        """
        train_path = '../../data/processed/train.csv'
        
        if not os.path.exists(train_path):
            print(f"Warning: {train_path} not found")
            return {}
        
        import pandas as pd
        df = pd.read_csv(train_path)
        
        genre_words = {}
        
        for genre in df['label'].unique():
            genre_poems = df[df['label'] == genre]['text']
            
            # Count all words in this genre
            all_words = []
            for poem in genre_poems:
                words = self._tokenize(poem.lower())
                all_words.extend(words)
            
            # Store frequency
            genre_words[genre] = Counter(all_words)
        
        return genre_words
    
    def _tokenize(self, text):
        """Simple tokenization"""
        # Remove special chars, keep letters and apostrophes
        text = re.sub(r'[^a-z\s\'-]', ' ', text.lower())
        words = text.split()
        return [w for w in words if len(w) > 1]
    
    def analyze_context(self, poem_text):
        """
        Analyze the context of current poem
        Returns genre, sentiment, themes
        """
        if not poem_text or len(poem_text.strip()) < 10:
            return None
        
        # Get genre and sentiment
        analysis = self.analyzer.analyze_complete(poem_text)
        
        # Extract key themes (most important words)
        words = self._tokenize(poem_text)
        word_freq = Counter(words)
        themes = [word for word, count in word_freq.most_common(10) 
                  if word in self.embeddings]
        
        return {
            'genre': analysis['genre']['genre'],
            'genre_confidence': analysis['genre']['confidence'],
            'sentiment_label': analysis['sentiment']['label'],
            'sentiment_compound': analysis['sentiment']['compound'],
            'themes': themes[:5]  # Top 5 themes
        }
    
    def word_frequency_in_genre(self, word, genre):
        """
        How common is this word in this genre?
        Returns normalized frequency (0 to 1)
        """
        if genre not in self.genre_word_freq:
            return 0.0
        
        genre_counter = self.genre_word_freq[genre]
        total_words = sum(genre_counter.values())
        
        if total_words == 0:
            return 0.0
        
        word_count = genre_counter.get(word, 0)
        return word_count / total_words
    
    def filter_by_genre(self, word_list, genre, threshold=0.000001):
        """
        Keep words that are common in this genre
        """
        filtered = []
        
        for word, score in word_list:
            freq = self.word_frequency_in_genre(word, genre)
            
            # Accept words even if rare in genre (looser filtering)
            if freq > threshold or len(filtered) < 20:
                boosted_score = score * (1 + freq * 10)
                filtered.append((word, boosted_score))
        
        # If still empty, just return original list
        if not filtered:
            return word_list[:20]
        
        return filtered
    
    def get_word_sentiment(self, word):
        """
        Get sentiment of a single word
        Uses the sentiment analyzer on just the word
        """
        result = self.analyzer.sentiment_analyzer.analyze(word)
        return result['compound']
    
    def filter_by_sentiment(self, word_list, target_sentiment, tolerance=0.5):
        """
        Keep words with similar sentiment
        
        Args:
            word_list: List of (word, score) tuples
            target_sentiment: Target sentiment compound score (-1 to 1)
            tolerance: How much deviation is acceptable
        """
        filtered = []
        
        for word, score in word_list:
            word_sent = self.get_word_sentiment(word)
            
            # Check if sentiment is similar (looser matching)
            if abs(word_sent - target_sentiment) < tolerance:
                filtered.append((word, score))
        
        # If filtering removed everything, keep top words anyway
        if not filtered and word_list:
            return word_list[:10]
        
        return filtered
    
    def theme_coherence(self, word, themes):
        """
        How well does this word fit with existing themes?
        Uses embeddings to measure similarity to theme words
        """
        if not themes or word not in self.embeddings:
            return 0.5  # Neutral
        
        similarities = []
        
        for theme in themes:
            if theme in self.embeddings:
                sim = self.embeddings.similarity(word, theme)
                similarities.append(sim)
        
        if not similarities:
            return 0.5
        
        # Return average similarity
        return np.mean(similarities)
    
    def suggest_words(self, current_word, context, num_suggestions=5):
        """
        Main suggestion function: context-aware word suggestions
        
        Args:
            current_word: The word to find alternatives for
            context: Context dict from analyze_context()
            num_suggestions: How many suggestions to return
        
        Returns:
            List of suggested words with explanations
        """
        if not current_word or current_word not in self.embeddings:
            print(f"  ⚠️  '{current_word}' not in vocabulary")
            return []
        
        if not context:
            # No context - just return similar words
            similar = self.embeddings.most_similar(current_word, topn=num_suggestions)
            return [{'word': w, 'score': s, 'reason': 'Similar word'} 
                    for w, s in similar]
        
        # Step 1: Get semantically similar words (large pool)
        similar_words = self.embeddings.most_similar(current_word, topn=100)
        print(f"  Step 1: Found {len(similar_words)} similar words")
        
        # Step 2: Filter by genre
        genre_filtered = self.filter_by_genre(
            similar_words,
            context['genre']
        )
        print(f"  Step 2: {len(genre_filtered)} words after genre filter")
        
        # Step 3: Filter by sentiment
        sentiment_filtered = self.filter_by_sentiment(
            genre_filtered,
            context['sentiment_compound'],
            tolerance=0.5
        )
        print(f"  Step 3: {len(sentiment_filtered)} words after sentiment filter")
        
        # If we filtered out everything, just use similar words
        if not sentiment_filtered:
            print("  ⚠️  Filters too strict, using top similar words")
            sentiment_filtered = similar_words[:20]
        
        # Step 4: Rank by theme coherence
        final_suggestions = []
        
        for word, score in sentiment_filtered[:50]:
            coherence = self.theme_coherence(word, context['themes'])
            
            # Combined score
            final_score = score * (1 + coherence)
            
            # Explain why this word was suggested
            reasons = []
            
            freq = self.word_frequency_in_genre(word, context['genre'])
            if freq > 0.0001:
                reasons.append(f"Common in {context['genre']} poetry")
            
            word_sent = self.get_word_sentiment(word)
            if abs(word_sent - context['sentiment_compound']) < 0.3:
                reasons.append(f"Matches {context['sentiment_label']} tone")
            
            if coherence > 0.4:
                reasons.append("Fits thematic context")
            
            final_suggestions.append({
                'word': word,
                'score': final_score,
                'reason': '; '.join(reasons) if reasons else 'Semantically similar'
            })
        
        # Sort by final score and return top N
        final_suggestions.sort(key=lambda x: x['score'], reverse=True)
        
        return final_suggestions[:num_suggestions]
    
    def find_rhymes(self, word, context=None, num_candidates=100):
        """
        Find rhymes using pronunciation matching (CMU Dictionary)
        Then filter by context
        """
        # Get rhymes using pronunciation
        rhyme_words = pronouncing.rhymes(word)
        
        if not rhyme_words:
            # Fallback to ending-based for words not in dictionary
            print(f"  No pronunciation data for '{word}', using fallback")
            return self._find_rhymes_by_ending(word, context, num_candidates)
        
        print(f"  Found {len(rhyme_words)} pronunciation-based rhymes")
        
        # Filter to words in our vocabulary
        vocab_rhymes = [
            (w, 1.0) for w in rhyme_words 
            if w in self.embeddings
        ]
        
        print(f"  {len(vocab_rhymes)} rhymes are in vocabulary")
        
        if not context:
            return [{'word': w, 'score': s, 'reason': 'Rhymes with input'} 
                    for w, s in vocab_rhymes[:num_candidates]]
        
        # Now apply context filtering
        context_rhymes = []
        
        for rhyme_word, base_score in vocab_rhymes:
            # Check sentiment match
            word_sent = self.get_word_sentiment(rhyme_word)
            sentiment_diff = abs(word_sent - context['sentiment_compound'])
            
            # Check genre frequency
            genre_freq = self.word_frequency_in_genre(rhyme_word, context['genre'])
            
            # Check theme coherence
            coherence = self.theme_coherence(rhyme_word, context['themes'])
            
            # Score based on context fit
            context_score = 1.0
            
            # Sentiment match (most important for rhymes)
            if sentiment_diff < 0.3:
                context_score *= 1.5
                sentiment_match = True
            else:
                sentiment_match = False
            
            # Genre appropriateness
            if genre_freq > 0.0001:
                context_score *= 1.3
                genre_match = True
            else:
                genre_match = False
            
            # Theme fit
            if coherence > 0.4:
                context_score *= 1.2
                theme_match = True
            else:
                theme_match = False
            
            # Build explanation
            reasons = ["Rhymes with input"]
            if sentiment_match:
                reasons.append(f"Matches {context['sentiment_label']} tone")
            if genre_match:
                reasons.append(f"Common in {context['genre']} poetry")
            if theme_match:
                reasons.append("Fits thematic context")
            
            context_rhymes.append({
                'word': rhyme_word,
                'score': context_score,
                'reason': '; '.join(reasons),
                'sentiment_diff': sentiment_diff
            })
        
        # Sort by context score
        context_rhymes.sort(key=lambda x: x['score'], reverse=True)
        
        print(f"  {len(context_rhymes)} rhymes after context scoring")
        
        return context_rhymes
    
    def _find_rhymes_by_ending(self, word, context, num_candidates):
        """
        Fallback: Find rhymes by word ending
        Used when word not in CMU dictionary
        """
        if len(word) < 3:
            return []
        
        ending = word[-2:] if len(word) <= 3 else word[-3:]
        
        rhymes = []
        for vocab_word in self.embeddings.index_to_key[:5000]:
            if vocab_word != word and vocab_word.endswith(ending):
                rhymes.append({'word': vocab_word, 'score': 1.0, 'reason': 'Rhymes with input (approximate)'})
        
        return rhymes[:num_candidates]
    
    def suggest_with_rhyme(self, current_word, context, num_suggestions=5, 
                           prioritize_context=True):
        """
        Suggest rhyming words with context awareness
        
        Args:
            prioritize_context: If True, only show rhymes that fit context well
                              If False, show all rhymes (less strict)
        """
        # Get context-aware rhymes
        rhymes = self.find_rhymes(current_word, context, num_candidates=50)
        
        if not rhymes:
            return []
        
        if prioritize_context:
            # Only keep rhymes that fit context reasonably well
            # (at least match sentiment OR genre)
            good_rhymes = [
                r for r in rhymes 
                if r['score'] > 1.2  # Above baseline means some context match
            ]
            
            if good_rhymes:
                return good_rhymes[:num_suggestions]
            else:
                # If no good context matches, show best available with warning
                print(f"  ⚠️  No rhymes strongly match context, showing closest fits")
                return rhymes[:num_suggestions]
        else:
            # Show all rhymes regardless of context
            return rhymes[:num_suggestions]


def main():
    """Test the suggestion engine"""
    print("="*70)
    print("TESTING POETRY SUGGESTION ENGINE")
    print("="*70)
    
    # Initialize
    engine = PoetrySuggestionEngine()
    
    # Test poem
    test_poem = """
    The rain falls heavy on my soul,
    Darkness wraps around my heart,
    I'm drowning in this endless hole,
    My world is falling apart.
    """
    
    print("\nTest Poem:")
    print(test_poem)
    print("\n" + "-"*70)
    
    # Analyze context
    context = engine.analyze_context(test_poem)
    
    print("\nDetected Context:")
    print(f"  Genre: {context['genre']} ({context['genre_confidence']:.1%} confidence)")
    print(f"  Sentiment: {context['sentiment_label']} (score: {context['sentiment_compound']:.2f})")
    print(f"  Themes: {', '.join(context['themes'])}")
    
    # Test word suggestions
    test_words = ['rain', 'heart', 'soul']
    
    for word in test_words:
        print(f"\n{'='*70}")
        print(f"WORD: '{word}'")
        print(f"{'='*70}")
        
        print(f"\n--- Contextual Synonyms ---")
        suggestions = engine.suggest_words(word, context, num_suggestions=5)
        
        if suggestions:
            for i, sugg in enumerate(suggestions, 1):
                print(f"{i}. {sugg['word']:15} → {sugg['reason']}")
        else:
            print("  No suggestions found")
        
        print(f"\n--- Context-Aware Rhymes ---")
        rhymes = engine.suggest_with_rhyme(word, context, num_suggestions=5)
        
        if rhymes:
            for i, rhyme in enumerate(rhymes, 1):
                print(f"{i}. {rhyme['word']:15} → {rhyme['reason']}")
        else:
            print("  No rhymes found")
    
    print(f"\n{'='*70}")
    print("✅ SUGGESTION ENGINE TEST COMPLETE!")
    print(f"{'='*70}\n")


if __name__ == "__main__":
    main()