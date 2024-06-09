from django.db import models
from django.contrib.auth.models import AbstractUser
import bcrypt

class CustomUser(AbstractUser):
    def set_password(self, raw_password):
        self.password = bcrypt.hashpw(raw_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, raw_password):
        return bcrypt.checkpw(raw_password.encode('utf-8'), self.password.encode('utf-8'))


class Room(models.Model):
    room_name = models.CharField(max_length=255)
    full = models.BooleanField(default=False)
    quickmatch = models.BooleanField(default=False)

    def __str__(self):
        return self.room_name
