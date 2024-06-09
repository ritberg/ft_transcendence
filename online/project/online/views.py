from django.shortcuts import render, redirect
from .models import *
from django.http import JsonResponse, HttpResponse
from channels.db import database_sync_to_async, IntegrityError
import uuid
import json

def create_user(request):
    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')
        try:
            user = CustomUser.objects.create(username=username)
            user.set_password(password)
            user.save()
            return HttpResponse("User created successfully!")
        except IntegrityError:
            return HttpResponse("Error: Username already exists.")
    return render(request, 'create_user.html')

def CreateRoom(request):

    if request.method == 'POST':
        text_data_json = json.loads(request.body)
        room = text_data_json["room"]
        if (room != ""):

            if (room.strip() == ""):
                context = {
                    "status": 500,
                    "room_name": "",
                    "error": "whitspaces not allowed in room_name",
                }
                return JsonResponse(context)
            try:
                get_room = Room.objects.get(room_name=room)
                if get_room.full == True:
                    context = {
                        "status": 500,
                        "room_name": "",
                        "error": "room is full",
                    }
                    return JsonResponse(context)
                context = {
                    "status": 200,
                    "room_name": room,
                    "error": "",
                }
                return JsonResponse(context)
            except Room.DoesNotExist:
                new_room = Room(room_name = room)
                new_room.save()
                context = {
                    "status": 200,
                    "room_name": room,
                    "error": "",
                }
                return JsonResponse(context)
        else:
            try:
                get_room = Room.objects.get(full=False, quickmatch=True)
                context = {
                    "status": 200,
                    "room_name": get_room.room_name,
                    "error": "",
                }
                return JsonResponse(context)
            except:
                room = str(uuid.uuid4())
                new_room = Room(room_name = room, quickmatch=True)
                new_room.save()
                context = {
                    "status": 200,
                    "room_name": room,
                    "error": "",
                }
                return JsonResponse(context)
    else:
        context = {
            "status": 500,
            "room_name": "",
            "error": "only post allowed",
        }
        return JsonResponse(context)