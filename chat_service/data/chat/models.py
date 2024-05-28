from django.db import models

class ChatMessage(models.Model):
    room_name = models.CharField(max_length=100, default='room1')
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
