import pandas as pd
import numpy as np
import re
from sklearn.model_selection import train_test_split
import os

def combine_from_csvs(csv_directory='../../data/raw'):
    """
    Read all category CSV files and combine them into one dataset
    
    Args:
        csv_directory: Path to folder containing your CSV files
    """
    
    # Define your categories (match your CSV filenames exactly)
    categories = [
        'Romantic',
        'Everyday Life',
        'Nostalgia',
        'Hope&Joy',
        'Philosophical & Reflective',
        'Misery'
    ]
    
    all_poems = []
    
    for category in categories:
        # Construct full path to CSV
        csv_path = os.path.join(csv_directory, f'{category}.csv')
        
        try:
            # Read the CSV for this category
            df = pd.read_csv(csv_path)
            
            # Extract just the poem column (column B, index 1)
            poems = df.iloc[:, 1]
            
            # Create dataframe with poem and label
            category_df = pd.DataFrame({
                'text': poems,
                'label': category
            })
            
            all_poems.append(category_df)
            print(f"✓ Loaded {len(poems)} poems from {category}")
            
        except FileNotFoundError:
            print(f"✗ Could not find {csv_path}")
        except Exception as e:
            print(f"✗ Error reading {category}: {e}")
    
    if not all_poems:
        raise ValueError("No CSV files were loaded! Check your file paths.")
    
    # Combine all categories
    dataset = pd.concat(all_poems, ignore_index=True)
    
    # Remove any rows with empty/null poems
    dataset = dataset.dropna(subset=['text'])
    dataset = dataset[dataset['text'].str.strip() != '']
    
    print(f"\n✓ Total poems: {len(dataset)}")
    print("\nDistribution by category:")
    print(dataset['label'].value_counts())
    
    return dataset


def basic_clean(text):
    """Minimal cleaning for poetry (preserve structure)"""
    if pd.isna(text):
        return ""
    
    text = str(text)
    # Remove excessive whitespace but preserve line breaks
    text = re.sub(r' +', ' ', text)
    text = text.strip()
    
    return text


def preprocess_poems(dataset):
    """Add basic preprocessing to dataset"""
    
    print("\nPreprocessing poems...")
    
    # Clean text
    dataset['text'] = dataset['text'].apply(basic_clean)
    
    # Remove very short entries (likely errors)
    dataset['word_count'] = dataset['text'].apply(lambda x: len(x.split()))
    original_count = len(dataset)
    dataset = dataset[dataset['word_count'] >= 5]  # At least 5 words
    
    if len(dataset) < original_count:
        print(f"  Removed {original_count - len(dataset)} very short entries")
    
    # Remove duplicates
    dataset = dataset.drop_duplicates(subset='text')
    
    # Show statistics
    print(f"  Average poem length: {dataset['word_count'].mean():.1f} words")
    print(f"  Shortest: {dataset['word_count'].min()} words")
    print(f"  Longest: {dataset['word_count'].max()} words")
    
    dataset = dataset.drop('word_count', axis=1)
    
    return dataset


def prepare_train_test_split(dataset, test_size=0.2, random_state=42):
    """
    Randomize and split dataset into train/test sets
    
    Args:
        dataset: DataFrame with 'text' and 'label' columns
        test_size: Proportion for test set (default 0.2 = 20%)
        random_state: Random seed for reproducibility
    """
    
    # Shuffle the dataset
    dataset = dataset.sample(frac=1, random_state=random_state).reset_index(drop=True)
    
    # Split with stratification (ensures each category is proportionally represented)
    train_df, test_df = train_test_split(
        dataset,
        test_size=test_size,
        random_state=random_state,
        stratify=dataset['label']
    )
    
    print(f"\n✓ Train set: {len(train_df)} poems")
    print(f"✓ Test set: {len(test_df)} poems")
    
    print("\nTrain distribution:")
    print(train_df['label'].value_counts())
    
    print("\nTest distribution:")
    print(test_df['label'].value_counts())
    
    return train_df, test_df


def save_datasets(train_df, test_df, output_dir='../../data/processed'):
    """
    Save the prepared datasets to CSV files
    
    Args:
        train_df: Training dataset
        test_df: Test dataset
        output_dir: Directory to save files
    """
    
    os.makedirs(output_dir, exist_ok=True)
    
    train_df.to_csv(os.path.join(output_dir, 'train.csv'), index=False)
    test_df.to_csv(os.path.join(output_dir, 'test.csv'), index=False)
    
    # Also save the full dataset for reference
    full_df = pd.concat([train_df, test_df], ignore_index=True)
    full_df.to_csv(os.path.join(output_dir, 'full_dataset.csv'), index=False)
    
    print(f"\n✓ Saved datasets to {output_dir}/")
    print("  - train.csv")
    print("  - test.csv")
    print("  - full_dataset.csv")


def main():
    """Main execution function"""
    
    print("=" * 60)
    print("POETRY DATASET PREPARATION")
    print("=" * 60)
    
    # Step 1: Load and combine CSVs
    print("\n[1/4] Loading poems from CSV files...")
    dataset = combine_from_csvs()
    
    # Step 2: Preprocess
    print("\n[2/4] Preprocessing poems...")
    dataset = preprocess_poems(dataset)
    
    # Step 3: Split into train/test
    print("\n[3/4] Preparing train/test split...")
    train_df, test_df = prepare_train_test_split(dataset)
    
    # Step 4: Save datasets
    print("\n[4/4] Saving datasets...")
    save_datasets(train_df, test_df)
    
    print("\n" + "=" * 60)
    print("✅ DATASET PREPARATION COMPLETE!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Check data/processed/ folder for your datasets")
    print("2. Review the distribution to ensure balance")
    print("3. Start building your genre classifier!")


if __name__ == "__main__":
    main()