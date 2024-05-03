from django.urls import path
from pongBot.consumer import Consumer

websocket_urlpatterns = [
    path("ws/", Consumer.as_asgi()),
]