# Generated by Django 4.2.13 on 2024-06-16 09:14

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('stat_management', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='stats',
            name='player_id',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='player', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='gamehistory',
            name='player_1_id',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='player_1', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='gamehistory',
            name='player_2_id',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='player_2', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='gamehistory',
            name='winner_id',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='winner', to=settings.AUTH_USER_MODEL),
        ),
    ]
