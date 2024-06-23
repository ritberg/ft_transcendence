from django.db import models
from django.contrib.postgres.fields import ArrayField

class Room(models.Model):
    room_name = models.CharField(max_length=255)
    full = models.BooleanField(default=False)
    quickmatch = models.BooleanField(default=False)
    invite_name = models.CharField(max_length=255, blank="true")
    players = ArrayField(models.IntegerField(blank=True), default=list)

    def __str__(self):
        return self.room_name
