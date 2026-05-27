from django.db import models
from django.contrib.auth.models import User


class Poem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='poems')
    title = models.CharField(max_length=200, blank=True)
    content = models.TextField()
    
    # ML Analysis (cached)
    detected_genre = models.CharField(max_length=50, blank=True)
    genre_confidence = models.FloatField(null=True)
    sentiment_label = models.CharField(max_length=20, blank=True)
    sentiment_score = models.FloatField(null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=False)
    word_count = models.IntegerField(default=0)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.title or 'Untitled'} by {self.user.username}"


class PoemAnalysis(models.Model):
    poem = models.OneToOneField(Poem, on_delete=models.CASCADE, related_name='analysis')
    genre_probabilities = models.JSONField()
    sentiment_breakdown = models.JSONField()
    detected_themes = models.JSONField()
    analyzed_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Analysis for {self.poem.title}"


class SuggestionHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    poem = models.ForeignKey(Poem, on_delete=models.CASCADE, null=True)
    original_word = models.CharField(max_length=100)
    suggested_word = models.CharField(max_length=100)
    suggestion_type = models.CharField(max_length=20)
    was_accepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class UserPreference(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')
    default_genre = models.CharField(max_length=50, blank=True)
    preferred_style = models.CharField(max_length=50, default='vintage')
    auto_analyze = models.BooleanField(default=True)
    show_confidence = models.BooleanField(default=True)
    enable_rhymes = models.BooleanField(default=True)
    allow_public_poems = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Template(models.Model):
    genre = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField()
    color_scheme = models.JSONField()
    background_style = models.CharField(max_length=50)
    sample_poem = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.genre} Template"