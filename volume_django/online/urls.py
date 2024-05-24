from . import views
from django.urls import path

urlpatterns = [
    path('', views.CreateRoom, name='create-room'),
    # path('api/<str:room_name>/', views.message_list),
    # path('api/<str:room_name>/<str:username>/', views.user_message_list),
    path('<str:room_name>/', views.PongView, name='room'),
    ]
