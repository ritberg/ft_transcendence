# Generated by Django 4.2.13 on 2024-05-23 10:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0008_remove_chatmessage_room_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='chatmessage',
            name='room_name',
            field=models.CharField(default='room1', max_length=100),
        ),
    ]
