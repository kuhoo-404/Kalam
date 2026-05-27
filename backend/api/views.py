from rest_framework import viewsets, status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from django.contrib.auth.models import User
from .models import Poem, PoemAnalysis, UserPreference, Template
from .serializers import (
    PoemSerializer, PoemAnalysisSerializer,
    UserPreferenceSerializer, TemplateSerializer,
    RegisterSerializer, UserSerializer
)
from ml_integration.ml_service import ml_service


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class PoemViewSet(viewsets.ModelViewSet):
    serializer_class = PoemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Poem.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        content = serializer.validated_data.get('content', '')
        word_count = len(content.split())
        serializer.save(user=self.request.user, word_count=word_count)

    def perform_update(self, serializer):
        content = serializer.validated_data.get('content', '')
        word_count = len(content.split())
        serializer.save(word_count=word_count)

    @action(detail=True, methods=['get'])
    def analysis(self, request, pk=None):
        poem = self.get_object()
        if hasattr(poem, 'analysis'):
            return Response(PoemAnalysisSerializer(poem.analysis).data)
        return Response(
            {'message': 'No analysis saved yet'},
            status=status.HTTP_404_NOT_FOUND
        )


class UserPreferenceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        pref, _ = UserPreference.objects.get_or_create(user=request.user)
        return Response(UserPreferenceSerializer(pref).data)

    def put(self, request):
        pref, _ = UserPreference.objects.get_or_create(user=request.user)
        serializer = UserPreferenceSerializer(pref, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TemplateListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        templates = Template.objects.filter(is_active=True)
        return Response(TemplateSerializer(templates, many=True).data)


class TemplateDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, genre):
        try:
            template = Template.objects.get(genre=genre, is_active=True)
            return Response(TemplateSerializer(template).data)
        except Template.DoesNotExist:
            return Response(
                {'error': 'Template not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class AnalyzePoemView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        poem_text = request.data.get('text', '')
        if not poem_text.strip():
            return Response(
                {'error': 'No poem text provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            result = ml_service.analyze_poem(poem_text)
            return Response({
                'genre':            result['genre']['genre'],
                'confidence':       result['genre']['confidence'],
                'top_3':            result['genre']['top_3'],
                'sentiment':        result['sentiment']['label'],
                'sentiment_score':  result['sentiment']['compound'],
                'interpretation':   result['interpretation'],
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class WordSuggestionsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        word      = request.data.get('word', '').strip()
        poem_text = request.data.get('poem_text', '').strip()

        if not word or not poem_text:
            return Response(
                {'error': 'Missing word or poem_text'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            suggestions = ml_service.get_word_suggestions(word, poem_text)
            return Response({'suggestions': suggestions})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RhymeSuggestionsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        word      = request.data.get('word', '').strip()
        poem_text = request.data.get('poem_text', '').strip()

        if not word or not poem_text:
            return Response(
                {'error': 'Missing word or poem_text'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            rhymes = ml_service.get_rhyme_suggestions(word, poem_text)
            return Response({'rhymes': rhymes})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CompleteSuggestionsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        word      = request.data.get('word', '').strip()
        poem_text = request.data.get('poem_text', '').strip()

        if not word or not poem_text:
            return Response(
                {'error': 'Missing word or poem_text'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            result = ml_service.get_all_suggestions(word, poem_text)
            return Response(result)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )