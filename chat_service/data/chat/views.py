from .models import *
from .forms import *
from django.http import JsonResponse
from rest_framework import status
from django.middleware.csrf import get_token

def chatRoom(request, room_name):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
    messages = ChatMessage.objects.filter(room_name=room_name).order_by('timestamp')
    context = {
        "room_name" : room_name,
        "username": request.user.username,
        "messages": [message.as_dict() for message in messages],
        "status": status.HTTP_200_OK
    }
    return JsonResponse(context)