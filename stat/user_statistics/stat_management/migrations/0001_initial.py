# Generated by Django 4.2.13 on 2024-06-16 09:14

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='GameHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('player_1_score', models.IntegerField(default=0)),
                ('player_2_score', models.IntegerField(default=0)),
                ('date_played', models.DateTimeField(auto_now_add=True)),
                ('duration', models.FloatField(default=0.0)),
            ],
            options={
                'db_table': 'users_game_history',
            },
        ),
        migrations.CreateModel(
            name='Stats',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('wins', models.IntegerField(default=0)),
                ('losses', models.IntegerField(default=0)),
                ('win_rate', models.FloatField(default=0.0)),
                ('total_games_played', models.IntegerField(default=0)),
                ('total_hours_played', models.FloatField(default=0.0)),
                ('goal_scored', models.IntegerField(default=0)),
                ('goal_conceded', models.IntegerField(default=0)),
            ],
            options={
                'db_table': 'users_stats',
            },
        ),
    ]