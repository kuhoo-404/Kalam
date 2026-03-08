"""
Collect poetry corpus from PoetryDB API
We need 2000-5000 poems to train good embeddings
"""

import requests
import json
import time
import pandas as pd
from tqdm import tqdm
import os

def fetch_all_poems():
    """
    Fetch poems from PoetryDB API
    Free, public API: https://poetrydb.org/
    """
    print("Fetching poetry corpus from PoetryDB...")
    
    all_poems = []
    
    # PoetryDB endpoints
    base_url = "https://poetrydb.org"
    
    # Get all authors
    print("\n[1/3] Fetching author list...")
    authors_response = requests.get(f"{base_url}/author")
    
    if authors_response.status_code != 200:
        print("Error fetching authors. Using fallback method...")
        return fetch_poems_fallback()
    
    authors = authors_response.json()['authors']
    print(f"✓ Found {len(authors)} authors")
    
    # Fetch poems by author
    print("\n[2/3] Fetching poems by author...")
    
    for author in tqdm(authors[:100]):  # Limit to first 100 authors for speed
        try:
            # Get poems by this author
            url = f"{base_url}/author/{author}"
            response = requests.get(url)
            
            if response.status_code == 200:
                poems = response.json()
                
                # Handle different response formats
                if isinstance(poems, list):
                    for poem in poems:
                        if 'lines' in poem and 'title' in poem:
                            # Combine lines into single text
                            text = '\n'.join(poem['lines'])
                            all_poems.append({
                                'title': poem['title'],
                                'author': author,
                                'text': text,
                                'line_count': len(poem['lines'])
                            })
            
            # Rate limiting - be nice to the API
            time.sleep(0.1)
            
        except Exception as e:
            print(f"\nError fetching poems by {author}: {e}")
            continue
    
    print(f"\n✓ Collected {len(all_poems)} poems")
    return all_poems


def fetch_poems_fallback():
    """
    Fallback: Fetch poems by title search
    """
    print("Using fallback method...")
    
    base_url = "https://poetrydb.org"
    all_poems = []
    
    # Common poetry titles/themes to search
    search_terms = [
        "love", "death", "life", "nature", "time", "heart", "soul",
        "night", "day", "sun", "moon", "star", "wind", "sea",
        "dream", "hope", "joy", "sorrow", "pain", "beauty"
    ]
    
    print("Searching by common themes...")
    for term in tqdm(search_terms):
        try:
            url = f"{base_url}/title/{term}"
            response = requests.get(url)
            
            if response.status_code == 200:
                poems = response.json()
                
                if isinstance(poems, list):
                    for poem in poems:
                        if 'lines' in poem and 'title' in poem:
                            text = '\n'.join(poem['lines'])
                            all_poems.append({
                                'title': poem.get('title', 'Unknown'),
                                'author': poem.get('author', 'Unknown'),
                                'text': text,
                                'line_count': len(poem['lines'])
                            })
            
            time.sleep(0.2)
            
        except Exception as e:
            print(f"\nError searching '{term}': {e}")
            continue
    
    # Remove duplicates
    seen_titles = set()
    unique_poems = []
    for poem in all_poems:
        key = (poem['title'], poem['author'])
        if key not in seen_titles:
            seen_titles.add(key)
            unique_poems.append(poem)
    
    print(f"\n✓ Collected {len(unique_poems)} unique poems")
    return unique_poems


def clean_corpus(poems):
    """
    Clean the collected poems
    """
    print("\n[3/3] Cleaning corpus...")
    
    cleaned = []
    
    for poem in poems:
        text = poem['text']
        
        # Basic cleaning
        text = text.strip()
        
        # Skip very short poems (likely incomplete)
        if len(text.split()) < 10:
            continue
        
        # Skip very long poems (likely narrative, not lyric)
        if len(text.split()) > 500:
            continue
        
        poem['text'] = text
        cleaned.append(poem)
    
    print(f"✓ Kept {len(cleaned)} poems after cleaning")
    return cleaned


def save_corpus(poems, output_dir='../../data/corpus'):
    """
    Save the corpus to disk
    """
    os.makedirs(output_dir, exist_ok=True)
    
    # Save as JSON
    json_path = os.path.join(output_dir, 'poetry_corpus.json')
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(poems, f, indent=2, ensure_ascii=False)
    
    print(f"\n✓ Saved to {json_path}")
    
    # Also save as CSV for easy viewing
    df = pd.DataFrame(poems)
    csv_path = os.path.join(output_dir, 'poetry_corpus.csv')
    df.to_csv(csv_path, index=False, encoding='utf-8')
    
    print(f"✓ Saved to {csv_path}")
    
    # Print statistics
    print(f"\n{'='*60}")
    print("CORPUS STATISTICS")
    print(f"{'='*60}")
    print(f"Total poems: {len(poems)}")
    print(f"Total authors: {df['author'].nunique()}")
    print(f"Average poem length: {df['line_count'].mean():.1f} lines")
    print(f"Shortest poem: {df['line_count'].min()} lines")
    print(f"Longest poem: {df['line_count'].max()} lines")
    print(f"{'='*60}\n")
    
    return json_path, csv_path


def main():
    """
    Main execution
    """
    print("="*60)
    print("POETRY CORPUS COLLECTION")
    print("="*60)
    
    # Fetch poems
    poems = fetch_all_poems()
    
    if len(poems) < 100:
        print("\n⚠️  Warning: Less than 100 poems collected.")
        print("Trying alternative method...")
        poems = fetch_poems_fallback()
    
    # Clean corpus
    poems = clean_corpus(poems)
    
    # Save corpus
    if poems:
        save_corpus(poems)
        print("✅ Corpus collection complete!")
    else:
        print("❌ Failed to collect poems. Check your internet connection.")


if __name__ == "__main__":
    main()