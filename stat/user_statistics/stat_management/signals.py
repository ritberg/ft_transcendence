from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import GameHistory, Stats

@receiver(post_save, sender=GameHistory)
def update_player_stats(sender, instance, created, **kwargs):
	if created:
		# get players
		player_1_stats, _ = Stats.objects.get_or_create(player_id=instance.player_1_id)
		player_2_stats, _ = Stats.objects.get_or_create(player_id=instance.player_2_id)

		# update wins and losses
		if instance.winner_id == instance.player_1_id:
			player_1_stats.wins += 1
			player_2_stats.losses += 1
		else:
			player_1_stats.losses += 1
			player_2_stats.wins += 1

		# update games played
		player_1_stats.total_games_played += 1
		player_2_stats.total_games_played += 1

		# update win rate
		player_1_stats.win_rate = player_1_stats.wins / player_1_stats.total_games_played % 100
		player_2_stats.win_rate = player_2_stats.wins / player_2_stats.total_games_played % 100

		# update hours played
		player_1_stats.total_hours_played += instance.duration / 3600
		player_2_stats.total_hours_played += instance.duration / 3600

		# update goal scored
		player_1_stats.goal_scored += instance.player_1_score
		player_2_stats.goal_scored += instance.player_2_score

		# update goal conceded
		player_1_stats.goal_conceded += instance.player_2_score
		player_2_stats.goal_conceded += instance.player_1_score

		# save stats
		player_1_stats.save()
		player_2_stats.save()