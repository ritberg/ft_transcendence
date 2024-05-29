from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import GameHistory
from .serializers import GameHistorySerializer
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q

# Create your views here.
class GameHistoryView(APIView):
	permission_classes = [IsAuthenticated]

	def post(self, request):
		serializer = GameHistorySerializer(data=request.data)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data, status=status.HTTP_201_CREATED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
	
	def get(self, request):
		try:
			user = request.user
			games = GameHistory.objects.filter(Q(player_1_id=user) | Q(player_2_id=user)).order_by('-date_played')[:10]
			serializer = GameHistorySerializer(games, many=True)
			return Response(serializer.data, status=status.HTTP_200_OK)
		except Exception as e:
			return Response(
				{'message': f"{type(e).__name__}: {str(e)}"},
				status=status.HTTP_500_INTERNAL_SERVER_ERROR
			)

	