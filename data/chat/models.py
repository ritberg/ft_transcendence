from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import User

class ChatRoom(models.Model):
    room_name = models.CharField(max_length=255, unique=True, default='default')
    user1 = models.ForeignKey(User, related_name='user1', on_delete=models.CASCADE)
    user2 = models.ForeignKey(User, related_name='user2', on_delete=models.CASCADE)

    def __str__(self):
        return self.room_name

class ChatMessage(models.Model):
    room_name = models.ForeignKey(ChatRoom, default='99999', related_name='messages', on_delete=models.CASCADE)
    username = models.CharField(max_length=255)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

# class User(models.Model): #?? I don't need this user
#     username = models.CharField(default="", max_length=80)
#     password = models.CharField(default="", max_length=10)
#     email = models.CharField(default="", max_length=100)
