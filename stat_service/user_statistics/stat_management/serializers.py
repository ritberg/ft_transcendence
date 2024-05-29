from rest_framework import serializers
from .models import GameHistory, stats

class GameHistorySerializer(serializers.ModelSerializer):
	class Meta:
		model = GameHistory
		fields = '__all__'


# class statsSerializer(serializers.ModelSerializer):
# 	class Meta:
# 		model = stats
# 		fields = '__all__'
