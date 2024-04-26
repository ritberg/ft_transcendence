from rest_framework import serializers
from chat.models import Room, Message

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['room', 'sender', 'message', 'message_id']