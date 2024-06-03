from .models import *
from .forms import *
from django.http import JsonResponse
from rest_framework import status
from django.middleware.csrf import get_token
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.shortcuts import render # to delete later
from user_management.models import CustomUser
from django.core import serializers

# def chatRoom(request, room_name):
#     if not request.user.is_authenticated:
#         return JsonResponse({"error": "User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
#     messages = ChatMessage.objects.filter(room_name=room_name).order_by('timestamp')
#     context = {
#         "room_name" : room_name,
#         "username": request.user.username,
#         "messages": [message.as_dict() for message in messages],
#         "status": status.HTTP_200_OK
#     }
#     return JsonResponse(context)

def chatRoom(request, username):
    print("chatRoom function in views.py - beginning")
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
    other_user = get_object_or_404(CustomUser, username=username)
    print("other user: ", other_user)
    if other_user == request.user:
        # Prevent users from chatting with themselves
        return JsonResponse({"error": "User cannot chat with herself/himself"}, status=status.HTTP_401_UNAUTHORIZED)
    
    # condition blocked user
    
    room_name = f"{min(request.user.username, other_user.username)}_{max(request.user.username, other_user.username)}"
    
    chat_room = ChatRoom.objects.filter(Q(user1=request.user, user2=other_user) | Q(user1=other_user, user2=request.user)).first()
    if not chat_room:
        chat_room = ChatRoom.objects.create(user1=request.user, user2=other_user, room_name=room_name)

    messages = ChatMessage.objects.filter(room_name=chat_room).order_by('timestamp')
    serialized_messages = serializers.serialize('json', messages)
    print( "room_name: ", room_name)
    print( "username: ", request.user.username)
    print("messages: ", serialized_messages)
    print("other_user: ", other_user.username)
    context = {
        "room_name": room_name,
        "username": request.user.username,
        "messages": serialized_messages,
        "other_user": other_user.username,
        "status": status.HTTP_200_OK
    }
    return JsonResponse(context)

def userList(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
    if request.method == 'POST':
        users = CustomUser.objects.exclude(username=request.user.username)
        user_data = [{'username': user.username} for user in users]
        return JsonResponse({'users': user_data})
    return JsonResponse({"error": "Invalid request method"}, status=400)