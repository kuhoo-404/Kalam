"""
Complete Poem Analysis
Combines genre classification and sentiment analysis
"""

import os
import sys

# CRITICAL: Set cache BEFORE importing anything from transformers
cache_dir = 'E:/Phase0/Kalam/.cache/huggingface'
os.makedirs(cache_dir, exist_ok=True)
os.environ['HF_HOME'] = cache_dir
os.environ['TRANSFORMERS_CACHE'] = cache_dir
os.environ['HF_DATASETS_CACHE'] = cache_dir

print(f"HuggingFace cache set to: {cache_dir}\n")

from transformers import DistilBertTokenizer, DistilBertForSequenceClassification
import torch
import json
import os
from pathlib import Path
from sentiment_analyzer import PoetrySentimentAnalyzer

class CompletePoetryAnalyzer:
    def __init__(self):
        """Initialize both genre classifier and sentiment analyzer"""
        print("Initializing Complete Poetry Analyzer...")
        
        # Load genre classifier
        current_dir = Path(__file__).parent
        models_base = Path(os.environ.get('KALAM_MODELS_PATH', str(current_dir.parent.parent / 'models')))
        model_path = models_base / "genre_classifier"
        model_path = str(model_path)
        
        print(f"Loading genre classifier from: {model_path}")
        self.genre_model = DistilBertForSequenceClassification.from_pretrained(
            model_path,
            local_files_only=True
        )
        self.genre_tokenizer = DistilBertTokenizer.from_pretrained(
            model_path,
            local_files_only=True
        )
        
        # Load label mapping
        with open(os.path.join(model_path, 'label_map.json'), 'r') as f:
            label_map = json.load(f)
        self.reverse_label_map = {v: k for k, v in label_map.items()}
        
        # Set to eval mode
        self.genre_device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.genre_model.to(self.genre_device)
        self.genre_model.eval()
        
        # Load sentiment analyzer
        self.sentiment_analyzer = PoetrySentimentAnalyzer()
        
        print("✓ Complete analyzer ready!\n")
    
    def predict_genre(self, poem):
        """Predict genre of poem"""
        inputs = self.genre_tokenizer(
            poem,
            return_tensors='pt',
            truncation=True,
            max_length=512,
            padding=True
        )
        inputs = {k: v.to(self.genre_device) for k, v in inputs.items()}
        
        with torch.no_grad():
            outputs = self.genre_model(**inputs)
            prediction = torch.argmax(outputs.logits, dim=1).item()
            probabilities = torch.softmax(outputs.logits, dim=1)[0]
        
        # Get top 3 predictions
        top3_indices = torch.argsort(probabilities, descending=True)[:3]
        top3 = [
            {
                'genre': self.reverse_label_map[idx.item()],
                'confidence': probabilities[idx].item()
            }
            for idx in top3_indices
        ]
        
        return {
            'genre': self.reverse_label_map[prediction],
            'confidence': probabilities[prediction].item(),
            'top_3': top3,
            'all_probabilities': {
                self.reverse_label_map[i]: probabilities[i].item()
                for i in range(len(probabilities))
            }
        }
    
    def analyze_complete(self, poem):
        """
        Complete analysis: genre + sentiment
        
        Args:
            poem: String containing the poem text
            
        Returns:
            dict with complete analysis
        """
        # Get genre
        genre_result = self.predict_genre(poem)
        
        # Get sentiment
        sentiment_result = self.sentiment_analyzer.analyze(poem)
        
        # Combine and interpret
        interpretation = self._interpret_combined(
            genre_result['genre'],
            sentiment_result['compound']
        )
        
        return {
            'genre': genre_result,
            'sentiment': sentiment_result,
            'interpretation': interpretation,
            'text': poem[:100] + '...' if len(poem) > 100 else poem
        }
    
    def _interpret_combined(self, genre, compound):
        """Create human-readable interpretation"""
        tone = self.sentiment_analyzer.interpret_sentiment(compound)
        return f"A {tone} {genre} poem"


def main():
    """Test complete analysis"""
    print("="*70)
    print("COMPLETE POETRY ANALYSIS TEST")
    print("="*70)
    
    analyzer = CompletePoetryAnalyzer()
    
    # Test poems
    test_poems = [
        """
        Your eyes, like stars in velvet night,
        Your smile, my soul's delight,
        In every beat, my heart does say,
        I love you more with each new day.
        """,
        """
        The rain falls down on empty streets,
        My heart is heavy, cold, and gray,
        In solitude, the darkness meets,
        Another lonely, endless day.
        """,
        """
        I remember summer days of old,
        When laughter filled the air,
        Those childhood memories, pure gold,
        A time beyond compare.
        """
    ]
    
    for i, poem in enumerate(test_poems, 1):
        print(f"\n{'='*70}")
        print(f"TEST POEM #{i}")
        print(f"{'='*70}")
        print(poem.strip())
        print(f"\n{'-'*70}")
        
        result = analyzer.analyze_complete(poem)
        
        print(f"\n ANALYSIS RESULTS:")
        print(f"\n Genre: {result['genre']['genre']}")
        print(f"   Confidence: {result['genre']['confidence']:.1%}")
        print(f"\n   Top 3 predictions:")
        for pred in result['genre']['top_3']:
            bar = '█' * int(pred['confidence'] * 30)
            print(f"     {pred['genre']:30} {pred['confidence']:5.1%} {bar}")
        
        print(f"\n Sentiment: {result['sentiment']['label'].upper()}")
        print(f"   Compound: {result['sentiment']['compound']:.3f}")
        print(f"   Confidence: {result['sentiment']['confidence']:.1%}")
        
        print(f"\n Interpretation: {result['interpretation']}")
        print(f"{'='*70}")


if __name__ == "__main__":
    main()