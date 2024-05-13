from django.db import models
from django.contrib.auth.models import AbstractUser

class ChatMessage(models.Model):
    room_name = models.CharField(max_length=100)
    message = models.TextField()
    username = models.CharField(max_length=100)
    timestamp = models.DateTimeField(auto_now_add=True)

# class User(models.Model): #?? I don't need this user
#     username = models.CharField(default="", max_length=80)
#     password = models.CharField(default="", max_length=10)
#     email = models.CharField(default="", max_length=100)
