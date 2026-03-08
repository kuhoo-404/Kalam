"""
Sentiment Analyzer for Poetry
Uses pre-trained RoBERTa model fine-tuned on sentiment analysis
"""
import os
# CRITICAL: Set cache to E: drive BEFORE importing transformers
os.environ['HF_HOME'] = 'E:/Phase0/Kalam/.cache/huggingface'
os.environ['TRANSFORMERS_CACHE'] = 'E:/Phase0/Kalam/.cache/huggingface'
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch


class PoetrySentimentAnalyzer:
    def __init__(self):
        """Initialize the pre-trained sentiment model"""
        print("Loading sentiment analysis model...")
        
        # Use RoBERTa trained on sentiment (good for nuanced text)
        model_name = "cardiffnlp/twitter-roberta-base-sentiment-latest"
        
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(model_name)
        
        # Move to GPU if available
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model.to(self.device)
        self.model.eval()  # Set to evaluation mode
        
        print(f"✓ Sentiment model loaded on {self.device}")
    
    def analyze(self, text):
        """
        Analyze sentiment of given text
        
        Args:
            text: String containing the poem or text to analyze
            
        Returns:
            dict with sentiment analysis results
        """
        # Tokenize and prepare input
        inputs = self.tokenizer(
            text,
            return_tensors='pt',
            truncation=True,
            max_length=512,
            padding=True
        )
        
        # Move inputs to device
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        
        # Get predictions
        with torch.no_grad():
            outputs = self.model(**inputs)
            scores = torch.softmax(outputs.logits, dim=1)[0]
        
        # Map to sentiment labels
        # This model outputs: [negative, neutral, positive]
        sentiment_scores = {
            'negative': scores[0].item(),
            'neutral': scores[1].item(),
            'positive': scores[2].item()
        }
        
        # Calculate compound score (-1 to 1)
        compound = sentiment_scores['positive'] - sentiment_scores['negative']
        
        # Determine dominant sentiment
        max_sentiment = max(sentiment_scores.items(), key=lambda x: x[1])
        
        return {
            'label': max_sentiment[0],           # 'positive', 'negative', or 'neutral'
            'confidence': max_sentiment[1],      # 0 to 1
            'scores': sentiment_scores,          # all three scores
            'compound': compound                 # -1 (very negative) to 1 (very positive)
        }
    
    def analyze_batch(self, texts):
        """Analyze multiple texts at once (more efficient)"""
        results = []
        for text in texts:
            results.append(self.analyze(text))
        return results
    
    def interpret_sentiment(self, compound_score):
        """
        Convert compound score to human-readable interpretation
        
        Args:
            compound_score: Float from -1 to 1
            
        Returns:
            String describing the sentiment intensity
        """
        if compound_score >= 0.6:
            return "very positive"
        elif compound_score >= 0.2:
            return "positive"
        elif compound_score >= -0.2:
            return "neutral"
        elif compound_score >= -0.6:
            return "negative"
        else:
            return "very negative"


def main():
    """Test the sentiment analyzer"""
    print("="*60)
    print("TESTING SENTIMENT ANALYZER")
    print("="*60)
    
    # Initialize analyzer
    analyzer = PoetrySentimentAnalyzer()
    
    # Test poems
    test_poems = [
        {
            'title': 'Happy Love Poem',
            'text': """
                Your smile lights up my world so bright,
                Every moment with you feels just right,
                In your arms I've found my home,
                Together forever, we'll never be alone.
            """
        },
        {
            'title': 'Sad Heartbreak Poem',
            'text': """
                Empty rooms echo with your name,
                My heart is shattered, filled with pain,
                The tears won't stop, the hurt won't fade,
                In darkness now, alone I've stayed.
            """
        },
        {
            'title': 'Neutral Observational Poem',
            'text': """
                The coffee shop on Fifth and Main,
                People passing in the rain,
                Morning routines, the same each day,
                Life moves on in its own way.
            """
        },
        {
            'title': 'Nostalgic Poem',
            'text': """
                I remember summer days of old,
                Stories that our parents told,
                Laughter echoing through the years,
                Sweet memories mixed with tears.
            """
        }
    ]
    
    # Analyze each poem
    for poem in test_poems:
        print(f"\n{'='*60}")
        print(f"Poem: {poem['title']}")
        print(f"{'='*60}")
        print(poem['text'].strip())
        print(f"\n{'-'*60}")
        
        result = analyzer.analyze(poem['text'])
        
        print(f"Sentiment: {result['label'].upper()}")
        print(f"Confidence: {result['confidence']:.2%}")
        print(f"Compound Score: {result['compound']:.3f}")
        print(f"Interpretation: {analyzer.interpret_sentiment(result['compound'])}")
        print(f"\nDetailed Scores:")
        for sentiment, score in result['scores'].items():
            bar = '█' * int(score * 40)
            print(f"  {sentiment:10} {score:5.1%} {bar}")
        print(f"{'='*60}")


if __name__ == "__main__":
    main()