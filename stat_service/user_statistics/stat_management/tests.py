from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from django.urls import reverse
from .models import GameHistory
from .serializers import GameHistorySerializer
from rest_framework.test import APITestCase
from rest_framework import status

User = get_user_model()

# Create your tests here.
class GameHistoryModelTest(APITestCase):

	def setUp(self):
		self.user_1 = User.objects.create_user(username='user1', password='password')
		self.user_2 = User.objects.create_user(username='user2', password='password')
		self.user_1.save()

	def test_game_history_model(self):

		# loging user1
		self.client.login(username='user1', password='password')

		# create a game history
		gameHistory = {
			'player_1_id': self.user_1.id,
			'player_2_id': self.user_2.id,
			'player_1_score': 5,
			'player_2_score': 3,
			'winner_id': self.user_1.id,
			'duration': '60'
		}

		url = reverse('game_history')

		print("data send : ", gameHistory)
		# send a GameHistory
		response = self.client.post(url, gameHistory, format='json')
		print(response.data)
		self.assertEqual(response.status_code, status.HTTP_201_CREATED)

		# get stats
		url = reverse('stats')
		response = self.client.get(url)
		print(response.data)
		self.assertEqual(response.status_code, status.HTTP_200_OK)

		# create a game history
		gameHistory = {
			'player_1_id': self.user_1.id,
			'player_2_id': self.user_2.id,
			'player_1_score': 4,
			'player_2_score': 13,
			'winner_id': self.user_2.id,
			'duration': '10806'
		}

		url = reverse('game_history')

		print("data send : ", gameHistory)
		# send a GameHistory
		response = self.client.post(url, gameHistory, format='json')
		print(response.data)
		self.assertEqual(response.status_code, status.HTTP_201_CREATED)

		# get stats
		url = reverse('stats')
		response = self.client.get(url)
		print(response.data)
		self.assertEqual(response.status_code, status.HTTP_200_OK)
	