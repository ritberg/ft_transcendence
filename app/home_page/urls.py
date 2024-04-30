from django.urls import path
from . import views

urlpatterns = [
    path('index/', views.index_view, name='index'),
    path('pong/', views.pong_view, name='pong'),
    path('pong3D/', views.pong3D_view, name='pong3D'),
]
