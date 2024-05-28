from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import User

class ChatRoom(models.Model):
    user1 = models.ForeignKey(User, related_name='chat_user1', on_delete=models.CASCADE)
    user2 = models.ForeignKey(User, related_name='chat_user2', on_delete=models.CASCADE)

    def get_room_name(self):
        return f"chat_{self.user1.id}_{self.user2.id}"

class ChatMessage(models.Model):
    room_name = models.CharField(max_length=100, default='room1')
    message = models.TextField()
    username = models.CharField(max_length=100)
    timestamp = models.DateTimeField(auto_now_add=True)

# class User(models.Model): #?? I don't need this user
#     username = models.CharField(default="", max_length=80)
#     password = models.CharField(default="", max_length=10)
#     email = models.CharField(default="", max_length=100)
