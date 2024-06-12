from django.db import models
from django.conf import settings

class ChatRoom(models.Model):
    room_name = models.CharField(max_length=255, unique=True, default='default')
    user1 = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='user1', on_delete=models.CASCADE)
    user2 = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='user2', on_delete=models.CASCADE)

    def __str__(self):
        return self.room_name

class ChatMessage(models.Model):
    room_name = models.ForeignKey(ChatRoom, default='99999', related_name='messages', on_delete=models.CASCADE)
    message = models.TextField()
    username = models.CharField(max_length=100)
    timestamp = models.DateTimeField(auto_now_add=True)

    def as_dict(self):
        return {
            "room_name": self.room_name,
            "message": self.message,
            "username": self.username,
            "timestamp": self.timestamp.isoformat(),
        }
