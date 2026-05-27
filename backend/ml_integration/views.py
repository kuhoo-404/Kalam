from django.shortcuts import render

# Create your views here.
from ml_integration.ml_service import ml_service

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
                'genre':          result['genre']['genre'],
                'confidence':     result['genre']['confidence'],
                'top_3':          result['genre']['top_3'],
                'sentiment':      result['sentiment']['label'],
                'sentiment_score': result['sentiment']['compound'],
                'interpretation': result['interpretation'],
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