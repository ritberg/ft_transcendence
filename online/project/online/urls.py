from . import views
from django.urls import path

urlpatterns = [
    path('room/invite', views.CreateInvite, name='create-invite'),
    path('room/', views.CreateRoom, name='create-room'),
    ]
