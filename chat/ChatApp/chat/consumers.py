import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import ChatMessage, ChatRoom

class ChatConsumer(AsyncWebsocketConsumer):
    @database_sync_to_async
    def create_chat(self, room_name, message, username):
        return ChatMessage.objects.create(room_name=room_name, message=message, username=username)
    
    async def connect(self):
        self.user = self.scope['user'] 
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f"chat_{self.room_name}"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self , close_code):
        await self.channel_layer.group_discard(
            self.room_group_name, 
            self.channel_name
        )
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]
        username = text_data_json["username"]
        
        room = await self.get_room_instance(self.room_name)
        await self.create_chat(room, message, username)
        await self.channel_layer.group_send(
            self.room_group_name,{
                "type" : "sendMessage",
                "message" : message, 
                "username" : username,
            })
        
    async def sendMessage(self, event) :
        message = event["message"]
        username = event["username"]

        await self.send(text_data = json.dumps({"message" : message ,"username" : username}))
      
    @database_sync_to_async
    def get_room_instance(self, room_name):
        return ChatRoom.objects.get(room_name=room_name)    