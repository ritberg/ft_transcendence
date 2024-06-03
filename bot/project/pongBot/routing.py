from django.urls import path
from pongBot.consumer import Consumer

websocket_urlpatterns = [
    path("ws/bot/", Consumer.as_asgi()),
]