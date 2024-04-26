import json
import random
import sys
import uuid
import asyncio
import math
import time
from threading import Timer
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from chat.models import *
from asgiref.sync import async_to_sync

class ChatConsumer(AsyncWebsocketConsumer):
    # p_id = 0
    #board
    board_height = 800
    board_width = 1200

    #player
    player_width = 15
    player_height = 100
    playerVelocityUp = -20
    playerVelocityDown = 20

    #balling
    ball_width = 15
    ball_height = 15
    ball_velocity = 10

    # class Players:
    #     player_id = 0
    #     xPos = (board_width / 2) - (ball_width / 2)
    #     yPos = (board_height / 2) - (ball_height / 2)
    #     velocityX = 0
    #     velocityY = 0
    #     score = 0
    
    ball = {
        "width" : 0,
        "height" : 0,
        "xPos" : 0,
        "yPos" : 0,
        "velocityY" : 0,
        "velocityX" : 0
    }

    #ball = Ball()

    players = {}
    update_lock = asyncio.Lock()

    async def connect(self):
        #self.player_id = str(uuid.uuid4())
        self.player_id = await self.assign_player_id()
        print(self.player_id)
        # self.player_id = self.p_id
        # self.p_id += 1
        self.room_name = f"room_{self.scope['url_route']['kwargs']['room_name']}"
        await self.channel_layer.group_add(self.room_name, self.channel_name)
        await self.accept()

        await self.send(
            text_data=json.dumps({"type": "playerId", "playerId": self.player_id})
        )
        if (self.player_id % 2) == 0:
            async with self.update_lock:
                self.players[self.player_id] = {
                    "id": self.player_id,
                    "xPos": 10,
                    "yPos": self.board_height / 2 - self.player_height / 2,
                    "width": self.player_width,
                    "height": self.player_height,
                    "velocityY": 0,
                    "score": 0,
                    "moveUp": False,
                    "moveDown": False,
                    "ballX": 0,
                    "ballY": 0,
                }
        else:
            async with self.update_lock:
                self.players[self.player_id] = {
                    "id": self.player_id,
                    "xPos": self.board_width - self.player_width - 10,
                    "yPos": self.board_height / 2 - self.player_height / 2,
                    "width": self.player_width,
                    "height": self.player_height,
                    "velocityY": 0,
                    "score": 0,
                    "moveUp": False,
                    "moveDown": False,
                    "ballX": 0,
                    "ballY": 0,
                }
        
        while await self.check_room() == 0:
            pass
        test = asyncio.create_task(self.game_loop())

    @database_sync_to_async
    def assign_player_id(self):
        current_room = Room.objects.get(room_name='room')
        if current_room.left == False:
            Room.objects.filter(room_name='room').update(left=True)
            return 0
        else:
            Room.objects.filter(room_name='room').update(right=True)
            return 1
        return 2
        
    async def disconnect(self, close_code):
        async with self.update_lock:
            if self.player_id in self.players:
                del self.players[self.player_id]
            
        await self.remove_player_id()

        await self.channel_layer.group_discard(self.room_name, self.channel_name)

    @database_sync_to_async
    def remove_player_id(self):
        if self.player_id == 0:
            Room.objects.filter(room_name='room').update(left=False)
        else:
            Room.objects.filter(room_name='room').update(right=False)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get("type", "")

        player_id = text_data_json["playerId"]

        player = self.players.get(player_id, None)
        if not player:
            return

        if message_type == "keyW":
            player["moveUp"] = True
            player["moveDown"] = False
        elif message_type == "keyS":
            player["moveDown"] = True
            player["moveUp"] = False
        elif message_type == "keyStop":
            player["moveDown"] = False
            player["moveUp"] = False

    async def state_update(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "stateUpdate",
                    "objects": event["objects"],
                }
            )
        )

    async def game_loop(self):
        self.init_ball_values()
        self.ball_direction()
        while await self.check_room() == 1:
            async with self.update_lock:
                for player in self.players.values():
                    if player["moveUp"]:
                        if player["yPos"] + self.playerVelocityUp > 0:
                            player["yPos"] += self.playerVelocityUp
                        else:
                            player["yPos"] = 0
                        
                    if player["moveDown"]:
                        if player["yPos"] + self.playerVelocityDown + self.player_height < self.board_height:
                            player["yPos"] += self.playerVelocityDown
                        else:
                            player["yPos"] = self.board_height - self.player_height

            self.calculate_ball_changes()

            self.ball["xPos"] += self.ball["velocityX"]
            self.ball["yPos"] += self.ball["velocityY"]
            
            for player in self.players.values():
                player["ballX"] = self.ball["xPos"]
                player["ballY"] = self.ball["yPos"]

            await self.channel_layer.group_send(
                self.room_name,
                {"type": "state_update", "objects": list(self.players.values())},
            )

            # await self.channel_layer.group_send(
            #     self.room_name,
            #     {"type": "ball_update", "objects": list(self.ball.values())},
            # )

            await asyncio.sleep(0.03)
    
    @database_sync_to_async
    def check_room(self):
        current_room = Room.objects.get(room_name='room')
        if current_room.left == True and current_room.right == True:
            return 1
        else:
            return 0
        return 2

    def calculate_ball_changes(self):

        player1 = self.players.get(0, None)
        player2 = self.players.get(1, None)

        if (self.ball["yPos"] + self.ball["velocityY"] < 0 or self.ball["yPos"] + self.ball["velocityY"] + self.ball["height"] > self.board_height):
            self.ball["velocityY"] *= -1

        if (self.ball["xPos"] + self.ball["velocityX"] + self.ball["width"] >= self.board_width - 11):
            if (self.ball["yPos"] + self.ball["velocityY"] + self.ball["height"] + 2 >= player2["yPos"] and self.ball["yPos"] + self.ball["velocityY"] - 2 <= player2["yPos"] + player2["height"]):
                self.ball["velocityY"] = ((self.ball["yPos"] + self.ball["height"] / 2) - (player2["yPos"] + player2["height"] / 2)) / 7
                self.ball["velocityX"] *= -1
                if self.ball["velocityX"] < 0:
                    self.ball["velocityX"] -= 0.5
                else:
                    self.ball["velocityX"] += 0.5

        if (self.ball["xPos"] + self.ball["velocityX"] <= 11):
            if (self.ball["yPos"] + self.ball["velocityY"] + self.ball["height"] + 2 >= player1["yPos"] and self.ball["yPos"] + self.ball["velocityY"] - 2 <= player1["yPos"] + player1["height"]):
                self.ball["velocityY"] = ((self.ball["yPos"] + self.ball["height"] / 2) - (player1["yPos"] + player1["height"] / 2)) / 7
                self.ball["velocityX"] *= -1
                if (self.ball["velocityX"] < 0):
                    self.ball["velocityX"] -= 0.5
                else:
                    self.ball["velocityX"] += 0.5

        if (self.ball["xPos"] + self.ball["velocityX"] < 0 or self.ball["xPos"] + self.ball["velocityX"] + self.ball["width"] > self.board_width):
            if (self.ball["xPos"] + self.ball["velocityX"] < 0):
                player2["score"] += 1
            else:
                player1["score"] += 1
            
            self.init_ball_values()
            self.ball_direction()
            
    def ball_direction(self):
        r1 = random.randint(0, 1)
        if r1 == 0:
            r1 = self.ball_velocity
        else:
            r1 = self.ball_velocity * -1
        
        r2 = 0
        while r2 == 0:
            r2 = random.randint(-5, 5)

        self.ball["velocityY"] = 0
        self.ball["velocityX"] = 0

        r = Timer(1.0, self.assign_values, (1, r2))
        s = Timer(1.0, self.assign_values, (0, r1))

        r.start()
        s.start()

    def assign_values(self, id, value):
        if id == 0:
            self.ball["velocityX"] = value
        else:
            self.ball["velocityY"] = value

    def init_ball_values(self):
        self.ball["width"] = self.ball_width
        self.ball["height"] = self.ball_height
        self.ball["xPos"] = (self.board_width / 2) - (self.ball_width / 2)
        self.ball["yPos"] = (self.board_height / 2) - (self.ball_height / 2)
        self.ball["velocityY"] = 0
        self.ball["velocityX"] = 0
