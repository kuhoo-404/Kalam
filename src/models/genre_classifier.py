"""
Genre Classifier for Poetry
Uses DistilBERT (a smaller, faster version of BERT) fine-tuned on poetry genres
"""

import pandas as pd
import numpy as np
import torch
from torch.utils.data import Dataset, DataLoader
from transformers import (
    DistilBertTokenizer, 
    DistilBertForSequenceClassification,
    
    get_linear_schedule_with_warmup
)
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from tqdm import tqdm
import matplotlib.pyplot as plt
import seaborn as sns
import os
import json
from torch.optim import AdamW 

# Set random seeds for reproducibility
torch.manual_seed(42)
np.random.seed(42)

class PoemDataset(Dataset):
    """
    Custom Dataset class for poems
    
    This tells PyTorch how to load and prepare our data.
    Think of it as a "data loader" that feeds poems to the model one batch at a time.
    """
    
    def __init__(self, texts, labels, tokenizer, max_length=512):
        """
        Initialize the dataset
        
        Args:
            texts: List of poem strings
            labels: List of genre labels (as integers)
            tokenizer: DistilBERT tokenizer
            max_length: Maximum token length (BERT's limit is 512)
        """
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_length = max_length
    
    def __len__(self):
        """Return the number of poems in dataset"""
        return len(self.texts)
    
    def __getitem__(self, idx):
        """
        Get a single poem and prepare it for the model
        """
        text = str(self.texts[idx])
        label = self.labels[idx]
        
        # Tokenize the text
        encoding = self.tokenizer(  # ← Changed: just use __call__ method directly
            text,
            add_special_tokens=True,
            max_length=self.max_length,
            padding='max_length',
            truncation=True,
            return_attention_mask=True,
            return_tensors='pt'
        )
            
        return {
            'input_ids': encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten(),
            'label': torch.tensor(label, dtype=torch.long)
        }


def load_data(train_path='../../data/processed/train.csv', 
              test_path='../../data/processed/test.csv'):
    """
    Load the training and test datasets
    
    Returns:
        train_df, test_df, label_map
    """
    print("Loading datasets...")
    train_df = pd.read_csv(train_path)
    test_df = pd.read_csv(test_path)
    
    # Create label mapping: genre name → number
    # E.g., {"Romantic": 0, "Nostalgia": 1, "Misery": 2, ...}
    unique_labels = sorted(train_df['label'].unique())
    label_map = {label: idx for idx, label in enumerate(unique_labels)}
    reverse_label_map = {idx: label for label, idx in label_map.items()}
    
    print(f"\n✓ Loaded {len(train_df)} training poems")
    print(f"✓ Loaded {len(test_df)} test poems")
    print(f"\nGenre mapping:")
    for label, idx in label_map.items():
        print(f"  {idx}: {label}")
    
    return train_df, test_df, label_map, reverse_label_map


def prepare_data_loaders(train_df, test_df, label_map, tokenizer, batch_size=8):
    """
    Create PyTorch DataLoaders
    
    DataLoaders handle:
    - Batching (grouping poems together)
    - Shuffling (randomizing order each epoch)
    - Loading data efficiently
    
    Args:
        batch_size: Number of poems to process at once
                   (smaller = less memory, slower training)
    """
    print(f"\nPreparing data loaders (batch_size={batch_size})...")
    
    # Convert genre names to numbers
    train_labels = [label_map[label] for label in train_df['label']]
    test_labels = [label_map[label] for label in test_df['label']]
    
    # Create datasets
    train_dataset = PoemDataset(
        train_df['text'].values,
        train_labels,
        tokenizer
    )
    
    test_dataset = PoemDataset(
        test_df['text'].values,
        test_labels,
        tokenizer
    )
    
    # Create data loaders
    train_loader = DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True  # Shuffle training data each epoch
    )
    
    test_loader = DataLoader(
        test_dataset,
        batch_size=batch_size,
        shuffle=False  # Don't shuffle test data
    )
    
    print(f"✓ Created {len(train_loader)} training batches")
    print(f"✓ Created {len(test_loader)} test batches")
    
    return train_loader, test_loader


def initialize_model(num_labels):
    """
    Initialize the DistilBERT model
    
    This loads a pre-trained DistilBERT and adds a classification head
    for our specific task (6 genre categories).
    
    Think of it as:
    - DistilBERT: The "brain" that understands language (pre-trained)
    - Classification head: New layer we're training to predict genres
    """
    print("\nInitializing model...")
    print("Loading pre-trained DistilBERT...")
    
    model = DistilBertForSequenceClassification.from_pretrained(
        'distilbert-base-uncased',
        num_labels=num_labels
    )
    
    tokenizer = DistilBertTokenizer.from_pretrained('distilbert-base-uncased')
    
    # Check if GPU is available
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"✓ Using device: {device}")
    
    model.to(device)
    
    return model, tokenizer, device


def train_epoch(model, data_loader, optimizer, scheduler, device):
    """
    Train the model for one epoch (one pass through all training data)
    
    This is where the actual learning happens:
    1. Show the model a batch of poems
    2. Model predicts genres
    3. Calculate how wrong the predictions are (loss)
    4. Adjust model weights to reduce loss (backpropagation)
    5. Repeat for all batches
    """
    model.train()  # Put model in training mode
    total_loss = 0
    predictions = []
    true_labels = []
    
    # Progress bar
    progress_bar = tqdm(data_loader, desc='Training')
    
    for batch in progress_bar:
        # Move batch to GPU/CPU
        input_ids = batch['input_ids'].to(device)
        attention_mask = batch['attention_mask'].to(device)
        labels = batch['label'].to(device)
        
        # Reset gradients
        optimizer.zero_grad()
        
        # Forward pass: get model predictions
        outputs = model(
            input_ids=input_ids,
            attention_mask=attention_mask,
            labels=labels
        )
        
        loss = outputs.loss
        logits = outputs.logits
        
        # Backward pass: calculate gradients
        loss.backward()
        
        # Update model weights
        optimizer.step()
        scheduler.step()
        
        # Track metrics
        total_loss += loss.item()
        preds = torch.argmax(logits, dim=1).cpu().numpy()
        predictions.extend(preds)
        true_labels.extend(labels.cpu().numpy())
        
        # Update progress bar
        progress_bar.set_postfix({'loss': loss.item()})
    
    avg_loss = total_loss / len(data_loader)
    accuracy = accuracy_score(true_labels, predictions)
    
    return avg_loss, accuracy


def evaluate_model(model, data_loader, device):
    """
    Evaluate the model on test data
    
    Similar to training, but:
    - No gradient calculation (faster)
    - No weight updates
    - Just measure performance
    """
    model.eval()  # Put model in evaluation mode
    total_loss = 0
    predictions = []
    true_labels = []
    
    # Progress bar
    progress_bar = tqdm(data_loader, desc='Evaluating')
    
    # Don't calculate gradients (saves memory and time)
    with torch.no_grad():
        for batch in progress_bar:
            input_ids = batch['input_ids'].to(device)
            attention_mask = batch['attention_mask'].to(device)
            labels = batch['label'].to(device)
            
            # Forward pass only
            outputs = model(
                input_ids=input_ids,
                attention_mask=attention_mask,
                labels=labels
            )
            
            loss = outputs.loss
            logits = outputs.logits
            
            total_loss += loss.item()
            preds = torch.argmax(logits, dim=1).cpu().numpy()
            predictions.extend(preds)
            true_labels.extend(labels.cpu().numpy())
    
    avg_loss = total_loss / len(data_loader)
    accuracy = accuracy_score(true_labels, predictions)
    
    return avg_loss, accuracy, predictions, true_labels


def plot_confusion_matrix(y_true, y_pred, labels, save_path='../../models/confusion_matrix.png'):
    """
    Create and save confusion matrix visualization
    
    Confusion matrix shows:
    - Rows: True labels
    - Columns: Predicted labels
    - Diagonal: Correct predictions
    - Off-diagonal: Mistakes
    """
    cm = confusion_matrix(y_true, y_pred)
    
    plt.figure(figsize=(10, 8))
    sns.heatmap(
        cm,
        annot=True,       # Show numbers in cells
        fmt='d',          # Integer format
        cmap='Blues',     # Color scheme
        xticklabels=labels,
        yticklabels=labels
    )
    plt.title('Confusion Matrix - Genre Classification')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    print(f"\n✓ Confusion matrix saved to {save_path}")
    plt.close()


def save_model(model, tokenizer, label_map, save_dir='../../models/genre_classifier'):
    """
    Save the trained model, tokenizer, and label mapping
    """
    os.makedirs(save_dir, exist_ok=True)
    
    # Save model and tokenizer
    model.save_pretrained(save_dir)
    tokenizer.save_pretrained(save_dir)
    
    # Save label mapping
    with open(os.path.join(save_dir, 'label_map.json'), 'w') as f:
        json.dump(label_map, f, indent=2)
    
    print(f"\n✓ Model saved to {save_dir}/")


def main():
    """
    Main training pipeline
    """
    print("=" * 70)
    print("POETRY GENRE CLASSIFIER TRAINING")
    print("=" * 70)
    
    # Hyperparameters
    BATCH_SIZE = 8        # Number of poems per batch (increase if you have GPU)
    EPOCHS = 4            # Number of times to go through entire dataset
    LEARNING_RATE = 2e-5  # How fast the model learns (smaller = more careful)
    
    # 1. Load data
    train_df, test_df, label_map, reverse_label_map = load_data()
    
    # 2. Initialize model
    model, tokenizer, device = initialize_model(num_labels=len(label_map))
    
    # 3. Prepare data loaders
    train_loader, test_loader = prepare_data_loaders(
        train_df, test_df, label_map, tokenizer, BATCH_SIZE
    )
    
    # 4. Setup optimizer and scheduler
    optimizer = AdamW(model.parameters(), lr=LEARNING_RATE)
    total_steps = len(train_loader) * EPOCHS
    scheduler = get_linear_schedule_with_warmup(
        optimizer,
        num_warmup_steps=0,
        num_training_steps=total_steps
    )
    
    print(f"\n{'='*70}")
    print(f"Training Configuration:")
    print(f"  Epochs: {EPOCHS}")
    print(f"  Batch size: {BATCH_SIZE}")
    print(f"  Learning rate: {LEARNING_RATE}")
    print(f"  Total training steps: {total_steps}")
    print(f"{'='*70}\n")
    
    # 5. Training loop
    best_accuracy = 0
    history = {
        'train_loss': [],
        'train_acc': [],
        'test_loss': [],
        'test_acc': []
    }
    
    for epoch in range(EPOCHS):
        print(f"\nEpoch {epoch + 1}/{EPOCHS}")
        print("-" * 70)
        
        # Train
        train_loss, train_acc = train_epoch(
            model, train_loader, optimizer, scheduler, device
        )
        
        # Evaluate
        test_loss, test_acc, test_preds, test_labels = evaluate_model(
            model, test_loader, device
        )
        
        # Track history
        history['train_loss'].append(train_loss)
        history['train_acc'].append(train_acc)
        history['test_loss'].append(test_loss)
        history['test_acc'].append(test_acc)
        
        # Print results
        print(f"\nResults:")
        print(f"  Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.4f}")
        print(f"  Test Loss:  {test_loss:.4f} | Test Acc:  {test_acc:.4f}")
        
        # Save best model
        if test_acc > best_accuracy:
            best_accuracy = test_acc
            save_model(model, tokenizer, label_map)
            print(f"  ✓ New best accuracy! Model saved.")
    
    # 6. Final evaluation
    print(f"\n{'='*70}")
    print("FINAL EVALUATION")
    print(f"{'='*70}")
    
    _, _, final_preds, final_labels = evaluate_model(model, test_loader, device)
    
    # Classification report
    label_names = [reverse_label_map[i] for i in range(len(label_map))]
    print("\nPer-Genre Performance:")
    print(classification_report(
        final_labels,
        final_preds,
        target_names=label_names,
        digits=4
    ))
    
    # Confusion matrix
    plot_confusion_matrix(final_labels, final_preds, label_names)
    
    print(f"\n{'='*70}")
    print(f"✅ TRAINING COMPLETE!")
    print(f"Best Test Accuracy: {best_accuracy:.4f}")
    print(f"{'='*70}\n")


if __name__ == "__main__":
    main()