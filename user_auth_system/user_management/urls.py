from django.urls import path
from user_management.views import LoginUserView, LogoutUserView, RegisterUserView, UpdateUserView, IndexView
from . import views

urlpatterns = [
    path('login/', LoginUserView.as_view(), name='login'),
    path('logout/', LogoutUserView.as_view(), name='logout'),
    path('register/', RegisterUserView.as_view(), name='register'),
	path('update/', UpdateUserView.as_view(), name='update'),
    path('index/', views.IndexView, name='index'),
]
