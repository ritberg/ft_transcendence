from django.urls import path
from .views import GameHistoryView, StatsView

urlpatterns = [
    path('game-history/<str:username>/', GameHistoryView.as_view(), name='game_history'),
	path('stats/<str:username>/', StatsView.as_view(), name='stats'),
]