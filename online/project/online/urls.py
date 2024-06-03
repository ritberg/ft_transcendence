from . import views
from django.urls import path

urlpatterns = [
    path('room/', views.CreateRoom, name='create-room'),
    ]
