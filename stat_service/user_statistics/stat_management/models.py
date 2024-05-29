from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class GameHistory(models.Model):
	player_1_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player_1')
	player_2_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player_2')
	player_1_score = models.IntegerField(default=0)
	player_2_score = models.IntegerField(default=0)
	winner_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name='winner')
	date_played = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return (f'{self.player_1_id} vs {self.player_2_id} '
				f'on {self.date_played} '
				f'winner is {self.winner_id} '
				f'score is {self.player_1_score} - {self.player_2_score}')
	
# class stats(models.Model):
# 	player_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player')
# 	wins = models.IntegerField(default=0)
# 	losses = models.IntegerField(default=0)
# 	total_games = models.IntegerField(default=0)
# 	win_rate = models.FloatField(default=0.0)
# 	goal_scored = models.IntegerField(default=0)
# 	goal_conceded = models.IntegerField(default=0)

# 	def __str__(self):
# 		return (f'{self.player_id} wins: {self.wins}, losses: {self.losses}, '
# 				f'total games: {self.total_games}, win rate: {self.win_rate:.2f}, '
# 				f'goal scored: {self.goal_scored}, goal conceded: {self.goal_conceded}')


