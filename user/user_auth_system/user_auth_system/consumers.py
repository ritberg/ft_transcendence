import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()

class UserStatusConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		self.user_id = self.scope['query_string'].decode().split('=')[1]
		self.user = await self.get_user(self.user_id)
		if self.user:
			await self.update_status(self.user, 'online')
			await self.channel_layer.group_add("users", self.channel_name)
			await self.accept()
		else:
			await self.close()

	async def disconnect(self, close_code):
		if self.user:
			await self.update_status(self.user, 'offline')
			await self.channel_layer.group_discard("users", self.channel_name)

	async def receive(self, text_data):
		data = json.loads(text_data)
		status = data.get("status", None)

		if status and self.user:
			await self.update_status(self.user, status)
			await self.channel_layer.group_send(
				"users",
				{
					"type": "status_update",
					"user_id": self.user.id,
					"username": self.user.username,
					"status": status,
				}
			)

	async def status_update(self, event):
		await self.send(text_data=json.dumps(event))

	@database_sync_to_async
	def get_user(self, user_id):
		try:
			return User.objects.get(id=int(user_id))
		except (ValueError, User.DoesNotExist):
			return None

	@database_sync_to_async
	def update_status(self, user, status):
		user.status = status
		user.save()
