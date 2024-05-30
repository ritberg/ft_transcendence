from django.urls import path, include
from online.consumer import OnlineConsumer

websocket_urlpatterns = [
    path('ws/online/<str:room_name>/', OnlineConsumer.as_asgi()),
]
