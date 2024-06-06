from django.urls import path
from . import views

urlpatterns = [
    path('', views.index_view, name='index'),
    path('test/', views.test_view, name='test'),
]
