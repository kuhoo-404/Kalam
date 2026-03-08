from transformers import DistilBertTokenizer, DistilBertForSequenceClassification
import torch
import json
import os
from pathlib import Path

# --- PATH FIX ---
# 1. Get the directory where THIS script is located
current_dir = Path(__file__).resolve().parent

# 2. Navigate: Up 2 levels (src/models -> Kalam), then into models/genre_classifier
model_path_obj = (current_dir / ".." / ".." / "models" / "genre_classifier").resolve()

# 3. Convert to Posix (forward slashes) which Hugging Face handles correctly
model_path = model_path_obj.as_posix()

print("Loading model...")
print(f"Absolute Model Path: {model_path}")

# Check if path actually exists to avoid obscure errors
if not model_path_obj.exists():
    raise FileNotFoundError(f"Could not find model folder at: {model_path}")

# Load model and tokenizer
# local_files_only=True tells it NOT to check the internet/Hub
model = DistilBertForSequenceClassification.from_pretrained(model_path, local_files_only=True)
tokenizer = DistilBertTokenizer.from_pretrained(model_path, local_files_only=True)

# Load label map
label_map_path = model_path_obj / 'label_map.json'
with open(label_map_path, 'r') as f:
    label_map = json.load(f)
reverse_map = {int(v): k for k, v in label_map.items()}

print("✓ Model loaded successfully!\n")

def predict_genre(poem):
    """Predict genre for a given poem"""
    inputs = tokenizer(poem, return_tensors='pt', truncation=True, max_length=512, padding=True)
    
    with torch.no_grad():
        outputs = model(**inputs)
        # Use softmax to get probabilities
        probabilities = torch.softmax(outputs.logits, dim=1)[0]
        prediction = torch.argmax(outputs.logits, dim=1).item()
    
    print(f"\n{'='*60}")
    print("POEM SNIPPET:")
    print(poem.strip()[:200] + "..." if len(poem) > 200 else poem.strip())
    print(f"\n{'='*60}")
    print(f"PREDICTED GENRE: {reverse_map[prediction].upper()}")
    print(f"{'='*60}")
    
    print("\nConfidence breakdown:")
    # Sort by highest probability
    for idx in sorted(range(len(probabilities)), key=lambda i: probabilities[i], reverse=True):
        prob = probabilities[idx].item()
        bar = '█' * int(prob * 40)
        print(f"  {reverse_map[idx]:20} {prob:5.1%} {bar}")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    # Test 1: Romantic
    romantic_poem = """
    Your eyes, like stars in velvet night,
    Your smile, my soul's delight,
    In every beat, my heart does say,
    I love you more with each new day.
    """
    predict_genre(romantic_poem)
    
    # Test 2: Nostalgic
    nostalgic_poem = """
    I remember summer days of old,
    When laughter filled the air,
    Those childhood memories, pure gold,
    A time beyond compare.
    """
    predict_genre(nostalgic_poem)
    
    # Test 3: Sad
    sad_poem = """
    The rain falls down on empty streets,
    My heart is heavy, cold, and gray,
    In solitude, the darkness meets,
    Another lonely, endless day.
    """
    predict_genre(sad_poem)
    
    # # Test 4: Test with YOUR OWN poem
    # print("\n" + "="*60)
    # print("TEST 4: Your Own Poem (uncomment to test)")
    # print("="*60)
    # # your_poem = """
    # # [Paste one of YOUR poems here]
    # # """
    # # predict_genre(your_poem)

