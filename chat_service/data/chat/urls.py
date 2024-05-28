from django.urls import path, include
from chat import views as chat_views
from django.contrib.auth.views import LogoutView, LoginView


urlpatterns = [
    path("chat/<str:room_name>/", chat_views.chatRoom, name="room"),
]
