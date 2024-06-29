#currently not used
import json
#replaces json to hopefully make it faster
import rapidjson
#to set the random ball trajectories at the start of a game
import random
#to make ids
import uuid
#to make the program asyncio
import asyncio
#used in a few calculus
import math
#used to set fps and other
import time
#to make the class async
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.generic.websocket import AsyncJsonWebsocketConsumer
#to make functions that access the database
from channels.db import database_sync_to_async
#models aka Room
from online.models import *
#other vars
# import game_struct
from .game_struct import room_vars, state_update
from .game import GameLoop

class OnlineConsumer(AsyncJsonWebsocketConsumer):

    #board
    board_height = 800
    board_width = 1000

    #player
    player_height = 200
    playerVelocity = 15

    #balling
    ball_width = 30
    ball_height = 30
    ball_velocity = 5

    update_lock = asyncio.Lock()
    async def connect(self):
        self.room = f"{self.scope['url_route']['kwargs']['room_name']}"
        self.player_id = int(f"{self.scope['url_route']['kwargs']['player_id']}")
        self.room_name = f"room_{self.scope['url_route']['kwargs']['room_name']}"
        self.user_name = f"{self.scope['url_route']['kwargs']['user_name']}"
        self.game = GameLoop()

        #adds player to the room layer
        await self.channel_layer.group_add(self.room_name, self.channel_name)
        await self.accept()

        #create and add new room if it doesn't already exist
        if self.room not in room_vars:
            async with self.update_lock:
                room_vars[self.room] = {
                    "players" : {},
                    "running" : False,
                    "ball_xPos" : (self.board_width / 2) - (self.ball_width / 2),
                    "ball_yPos" : (self.board_height / 2) - (self.ball_height / 2),
                    "ball_velocityY" : 0,
                    "ball_velocityX" : 0,
                }
        
        if self.room not in state_update:
            async with self.update_lock:
                state_update[self.room] = {
                    "player1Pos": self.board_height / 2 - self.player_height / 2,
                    "player2Pos": self.board_height / 2 - self.player_height / 2,
                    "ball_yPos": (self.board_height / 2) - (self.ball_height / 2),
                    "ball_xPos": (self.board_width / 2) - (self.ball_width / 2),
                    "player1Score": 0,
                    "player2Score": 0,
                }

        #adds players to the room
        async with self.update_lock:
            player_side = self.assign_player_side()
        if player_side == 0:
            async with self.update_lock:
                room_vars[self.room]["players"][self.player_id] = {
                    "player_id": self.player_id,
                    "username": self.user_name,
                    "side": "left",
                    "yPos": self.board_height / 2 - self.player_height / 2,
                    "score": 0,
                    "moveUp": False,
                    "moveDown": False,
                }
        elif player_side == 1:
            async with self.update_lock:
                room_vars[self.room]["players"][self.player_id] = {
                    "player_id": self.player_id,
                    "username": self.user_name,
                    "side": "right",
                    "yPos": self.board_height / 2 - self.player_height / 2,
                    "score": 0,
                    "moveUp": False,
                    "moveDown": False,
                }
        else:
            print("both sides taken")
            return
        
        await self.add_user()

        #sends the player his ID
        await self.send_json({"type": "playerId", "objects": {"id": self.player_id, "side": room_vars[self.room]["players"][self.player_id]["side"]}})

        #updates the database to determine whether another player can enter or not
        async with self.update_lock:
            await self.check_full()

        #starts the initialization of the game loop
        if not room_vars[self.room]["running"]:
            init = asyncio.create_task(self.game.game_loop(self.room))
        if len(room_vars[self.room]["players"]) == 2:
            name1 = name2 = name1Id = name2Id = ""
            player1 = self.game.find_player("left", self.room)
            if player1:
                name1 = player1["username"]
                name1Id = player1["player_id"]
            player2 = self.game.find_player("right", self.room)
            if player2:
                name2 = player2["username"]
                name2Id = player2["player_id"]
            await self.channel_layer.group_send(
                self.room_name,
                {"type": "player_num", "objects": {"num": 2, "p1Name": name1, "p2Name": name2, "p1Id": name1Id, "p2Id": name2Id}},
            )
            messages = asyncio.create_task(self.send_messages())

    #checks if room is full then updates database
    @database_sync_to_async
    def check_full(self):
        if self.assign_player_side() == 2:
            Room.objects.filter(room_name=self.room).update(full=True)
        else:
            Room.objects.filter(room_name=self.room).update(full=False)

    @database_sync_to_async
    def add_user(self):
        get_room = Room.objects.get(room_name=self.room)
        get_room.players.append(self.player_id)
        get_room.save()
        

    @database_sync_to_async
    def remove_user(self):
        get_room = Room.objects.get(room_name=self.room)
        if self.player_id in get_room.players:
            get_room.players.remove(self.player_id)
            get_room.save()

    #checks which sides are occupied and if any are free
    def assign_player_side(self):
        left = 0
        right = 0
        for player in room_vars[self.room]["players"].values():
            if player["side"] == "left":
                left = 1
            if player["side"] == "right":
                right = 1
        if left == 0 and right == 0:
            return 0
        if left == 0 and right == 1:
            return 0
        if left == 1 and right == 0:
            return 1
        if left == 1 and right == 1:
            return 2
        
    async def disconnect(self, close_code):
        if room_vars[self.room]["running"]:
            room_vars[self.room]["running"] = False

        #removes the player from the dict
        async with self.update_lock:
            if self.player_id in room_vars[self.room]["players"]:
                del room_vars[self.room]["players"][self.player_id]
        async with self.update_lock:
            await self.check_full()
            await self.remove_user()

        #tells the other client that the opponent left
        if self.assign_player_side() != 2:
            name1 = ""
            name2 = ""
            player1 = self.game.find_player("left", self.room)
            if player1:
                name1 = player1["username"]
            player2 = self.game.find_player("right", self.room)
            if player2:
                name2 = player2["username"]
            await self.channel_layer.group_send(
                self.room_name,
                {"type": "player_num", "objects": {"num": 1, "p1Name": name1, "p2Name": name2}},
            )

        #deletes room if empty
        if len(room_vars[self.room]["players"]) == 0:
            async with self.update_lock:
                await self.delete_room()
                if self.room in room_vars:
                    del room_vars[self.room]
            async with self.update_lock:
                if self.room in state_update:
                    del state_update[self.room]

        await self.channel_layer.group_discard(self.room_name, self.channel_name)

    #take a guess
    @database_sync_to_async
    def delete_room(self):
        Room.objects.filter(room_name=self.room).delete()

    async def receive_json(self, content):
        message_type = content["type"]

        username = content["username"]

        player = room_vars[self.room]["players"][username]
        if not player:
            print("no player")
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
        # async with self.update_lock:
        await self.send_json(
            {
                "type": "stateUpdate",
                "objects": event["objects"],
            }
        )

    async def player_num(self, event):
        await self.send_json(
            {
                "type": "playerNum",
                "objects": event["objects"],
            }
        )

    async def new_score(self, event):
        await self.send_json(
            {
                "type": "score",
                "objects": event["objects"],
            }
        )

    async def send_messages(self):
        while len(room_vars[self.room]["players"]) == 2:
            await self.channel_layer.group_send(
                self.room_name,
                {"type": "state_update", "objects": state_update[self.room]},
            )

            await asyncio.sleep(1 / 60)