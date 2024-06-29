from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import GameHistory, Stats
from .serializers import GameHistorySerializer, StatsSerializer
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from django.shortcuts import get_object_or_404

class AddGameHistoryView(APIView):
	permission_classes = [IsAuthenticated]

	def post(self, request):
		serializer = GameHistorySerializer(data=request.data)
		if serializer.is_valid():
			serializer.save()
			print("serilizer post: ",serializer.data)
			return Response(serializer.data, status=status.HTTP_201_CREATED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GameHistoryView(APIView):
	permission_classes = [IsAuthenticated]

	def get(self, request, username):
		try:
			user = username
			games = GameHistory.objects.filter(Q(player_1_id=user) | Q(player_2_id=user)).order_by('-date_played')[:10]
			serializer = GameHistorySerializer(games, many=True)
			print("serilizer get: ",serializer.data)
			return Response(serializer.data, status=status.HTTP_200_OK)
		except Exception as e:
			return Response(
				{'message': f"{type(e).__name__}: {str(e)}"},
				status=status.HTTP_404_NOT_FOUND
			)

class StatsView(APIView):
	permission_classes = [IsAuthenticated]

	def get(self, request, username):
		try:
			user = username
			stats = Stats.objects.filter(player_id=user).first()
			if stats is None:
				return Response([], status=status.HTTP_200_OK)
			serializer = StatsSerializer(stats)
			return Response(serializer.data, status=status.HTTP_200_OK)
		except Exception as e:
			return Response(
				{'message': f"{type(e).__name__}: {str(e)}"},
				status=status.HTTP_404_NOT_FOUND
			)