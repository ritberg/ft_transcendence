from .models import *
from .forms import *
from django.http import JsonResponse
from rest_framework import status
from django.middleware.csrf import get_token
from django.shortcuts import get_object_or_404
from django.db.models import Q
from user_management.models import CustomUser
from django.core import serializers
import json

def chatRoom(request, username):
    print("-+--+--+-- chatRoom function in views.py - beginning ---+--+-")
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
    other_user = get_object_or_404(CustomUser, username=username)
    if other_user == request.user:
        # Prevent users from chatting with themselves
        return JsonResponse({"error": "User cannot chat with herself/himself"}, status=status.HTTP_403_FORBIDDEN)
    
    # Check if the other user is blocked by the authenticated user
    if request.user.blocked_users.filter(id=other_user.id).exists():
        return JsonResponse({"error": "User is blocked"}, status=status.HTTP_403_FORBIDDEN)
    
    room_name = f"{min(request.user.id, other_user.id)}_{max(request.user.id, other_user.id)}"
    
    chat_room = ChatRoom.objects.filter(Q(user1=request.user, user2=other_user) | Q(user1=other_user, user2=request.user)).first()
    if not chat_room:
        chat_room = ChatRoom.objects.create(user1=request.user, user2=other_user, room_name=room_name)

    messages = ChatMessage.objects.filter(room_name=chat_room).order_by('timestamp')
    serialized_messages = serializers.serialize('json', messages)
    messages_list = json.loads(serialized_messages)

    print( "-- room_name: ", room_name)
    print( "-- username: ", request.user.username)
    print("-- messages: ", serialized_messages)
    print("-- other_user: ", other_user.username)
    
    context = {
        "room_name": room_name,
        "username": request.user.username,
        "messages": messages_list,
        "other_user": other_user.username,
        "status": status.HTTP_200_OK
    }
    return JsonResponse(context, status=status.HTTP_200_OK)

def userList(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
    if request.method == 'POST':
        users = CustomUser.objects.exclude(username=request.user.username)
        user_data = [{'username': user.username} for user in users]
        return JsonResponse({'users': user_data}, status=status.HTTP_200_OK)
    return JsonResponse({"error": "Invalid request method"}, status=status.HTTP_405_METHOD_NOT_ALLOWED)