from rest_framework import serializers
from .models import GameHistory, Stats

class GameHistorySerializer(serializers.ModelSerializer):
	player_1 = serializers.SerializerMethodField()
	player_2 = serializers.SerializerMethodField()
	winner = serializers.SerializerMethodField()

	class Meta:
		model = GameHistory
		fields = [
			'id', 'player_1_id', 'player_1_score', 'player_2_score', 'player_2_id',
			'winner_id', 'player_1', 'player_2', 'winner', 'date_played', 'duration'
		]

	def get_player_1(self, obj):
		return obj.player_1

	def get_player_2(self, obj):
		return obj.player_2

	def get_winner(self, obj):
		return obj.winner


class StatsSerializer(serializers.ModelSerializer):
	class Meta:
		model = Stats
		fields = '__all__'
