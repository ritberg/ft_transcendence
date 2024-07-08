from django.shortcuts import render, redirect
from .models import *
from django.http import JsonResponse
from channels.db import database_sync_to_async
from rest_framework import status
import uuid
import json
import re

def CreateRoom(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)

    if request.method == 'POST':
        text_data_json = json.loads(request.body)
        room = text_data_json["room"]
        player_id = text_data_json["player_id"]

        #checks if invalid characters
        pattern = "^[A-Za-z0-9_-]*$" 
        state = bool(re.match(pattern, room))
        if (state == False):
            return JsonResponse({"error": "invalid characters in your room name"}, status=status.HTTP_400_BAD_REQUEST)
        #if room string is empty create a random one
        if (room != ""):
            try:
                get_room = Room.objects.get(room_name=room)
                #if room is full, don't allow access
                if get_room.full == True:
                    return JsonResponse({"error": "this room is full"}, status=status.HTTP_403_FORBIDDEN)
                #if player already in the room don't allow access
                if player_id in get_room.players:
                    return JsonResponse({"error": "you are already in this room"}, status=status.HTTP_403_FORBIDDEN)
                return JsonResponse({"room_name": room}, status=status.HTTP_200_OK)
            except Room.DoesNotExist:
                new_room = Room(room_name = room)
                new_room.save()
                return JsonResponse({"room_name": room}, status=status.HTTP_200_OK)
        else:
            try:
                #search for random room
                get_room = Room.objects.get(full=False, quickmatch=True)
                #if player already in the room don't allow access
                if player_id in get_room.players:
                    return JsonResponse({"error": "you are already in this room"}, status=status.HTTP_403_FORBIDDEN)
                return JsonResponse({"room_name": get_room.room_name}, status=status.HTTP_200_OK)
            except:
                #creates new random room
                room = str(uuid.uuid4())
                new_room = Room(room_name = room, quickmatch=True)
                new_room.save()
                return JsonResponse({"room_name": room}, status=status.HTTP_200_OK)
    else:
        return JsonResponse({"error": "only post is allowed"}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

#for chat invites
def CreateInvite(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
    
    if request.method == 'POST':
        text_data_json = json.loads(request.body)
        #find the room name with the chat_name provided
        chat_name = text_data_json["chat_name"]
        player_id = text_data_json["player_id"]
        try:
            get_room = Room.objects.get(invite_name=chat_name)
            #if room is full, don't allow access
            if get_room.full == True:
                return JsonResponse({"error": "this room is full"}, status=status.HTTP_403_FORBIDDEN)
            #if player already in the room don't allow access
            if player_id in get_room.players:
                return JsonResponse({"error": "you are already in this room"}, status=status.HTTP_403_FORBIDDEN)
            return JsonResponse({"room_name": get_room.room_name}, status=status.HTTP_200_OK)
        except Room.DoesNotExist:
            #create new invite room if it doens't exist
            new_room_name = str(uuid.uuid4())
            new_room = Room(room_name = new_room_name, invite_name = chat_name)
            new_room.save()
            return JsonResponse({"room_name": new_room_name}, status=status.HTTP_200_OK)
    else:
        return JsonResponse({"error": "only post is allowed"}, status=status.HTTP_405_METHOD_NOT_ALLOWED)