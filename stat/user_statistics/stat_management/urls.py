from django.urls import path
from .views import GameHistoryView, AddGameHistoryView, StatsView

urlpatterns = [
    path('game-history/<str:username>/', GameHistoryView.as_view(), name='game_history'),
    path('game-history/', AddGameHistoryView.as_view(), name='add_game_history'),
	path('stats/<str:username>/', StatsView.as_view(), name='stats'),
]