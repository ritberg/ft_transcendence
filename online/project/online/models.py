from django.db import models

class Room(models.Model):
    room_name = models.CharField(max_length=255)
    full = models.BooleanField(default=False)
    quickmatch = models.BooleanField(default=False)

    def __str__(self):
        return self.room_name
