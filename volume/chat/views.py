from django.shortcuts import render, redirect
from .models import *
from django.http import JsonResponse
from .serializers import MessageSerializer

def CreateRoom(request):

    if request.method == 'POST':
        username = request.POST['username']
        room = request.POST['room']

        try:
            get_room = Room.objects.get(room_name=room)
            return redirect('room', room_name=room, username=username)

        except Room.DoesNotExist:
            new_room = Room(room_name = room)
            new_room.save()
            return redirect('room', room_name=room, username=username)

    return render(request, 'chat/index.html')

def MessageView(request, room_name, username):

    get_room = Room.objects.get(room_name=room_name)

    if request.method == 'POST':
        message = request.POST['message']

        print(message)

        new_message = Message(room=get_room, sender=username, message=message)
        new_message.save()

    get_messages= Message.objects.filter(room=get_room)
    
    context = {
        "messages": get_messages,
        "user": username,
        "room_name": room_name,
    }
    return render(request, 'chat/chatPage.html', context)

def message_list(request, room_name):
    get_room = Room.objects.get(room_name=room_name)
    get_messages = Message.objects.filter(room=get_room)
    serializer = MessageSerializer(get_messages, many=True)
    preMessage = "Messages from room " + room_name + ": "
    return JsonResponse({preMessage: serializer.data})

def user_message_list(request, room_name, username):
    get_room = Room.objects.get(room_name=room_name)
    get_messages = Message.objects.filter(room=get_room, sender=username)
    serializer = MessageSerializer(get_messages, many=True)
    preMessage = "Messages from room " + room_name + " by user " + username + ": "
    return JsonResponse({preMessage: serializer.data})

def PongView(request, room_name, username):
    return render(request, 'chat/pong.html')