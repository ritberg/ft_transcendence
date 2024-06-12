from django.urls import path
from .views import GameHistoryView, StatsView

urlpatterns = [
    path('game-history/', GameHistoryView.as_view(), name='game_history'),
	path('stats/', StatsView.as_view(), name='stats')
]