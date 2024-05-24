from django.shortcuts import render, redirect
from .models import *
from django.http import JsonResponse
from channels.db import database_sync_to_async
import uuid

def CreateRoom(request):

    if request.method == 'POST':
        try:
            room = request.POST['room']

            if (room.strip() == ""):
                context = {
                    "error": "Please enter a valid room name",
                }
                return render(request, 'online/index.html', context)

            try:
                get_room = Room.objects.get(room_name=room)
                if get_room.full == True:
                    context = {
                        "error": "This room is full, please try another one",
                    }
                    return render(request, 'online/index.html', context)
                return redirect('room', room_name=room)

            except Room.DoesNotExist:
                new_room = Room(room_name = room)
                new_room.save()
                return redirect('room', room_name=room)
        except:
            try:
                get_room = Room.objects.get(full=False, quickmatch=True)
                return redirect('room', room_name=get_room.room_name)
            except:
                room = str(uuid.uuid4())
                new_room = Room(room_name = room, quickmatch=True)
                new_room.save()
                return redirect('room', room_name=room)

    
    context = {
        "error": "",
    }

    return render(request, 'online/index.html', context)

def PongView(request, room_name):
    try:
        get_room = Room.objects.get(room_name=room_name)
        if get_room.full == True:
            context = {
                "error": "full",
            }
            return render(request, 'online/noRoom.html', context)
        context = {
            "room_name": room_name,
        }
        return render(request, 'online/pong.html', context)

    except Room.DoesNotExist:
        context = {
                "error": "noRoom",
            }
        return render(request, 'online/noRoom.html', context)
    return render(request, 'online/pong.html')
