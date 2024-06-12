from rest_framework import serializers
from .models import GameHistory, Stats

class GameHistorySerializer(serializers.ModelSerializer):
	class Meta:
		model = GameHistory
		fields = '__all__'


class StatsSerializer(serializers.ModelSerializer):
	class Meta:
		model = Stats
		fields = '__all__'
