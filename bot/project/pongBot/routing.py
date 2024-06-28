from django.urls import path
from pongBot.consumers import Consumer

websocket_urlpatterns = [
    path("ws/bot/", Consumer.as_asgi()),
]