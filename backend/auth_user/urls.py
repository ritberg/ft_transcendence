from django.urls import path
from auth_user.views import LoginUserView, LogoutUserView, RegisterUserView

urlpatterns = [
    path('login/', LoginUserView.as_view(), name='login'),
    path('logout/', LogoutUserView.as_view(), name='logout'),
    path('register/', RegisterUserView.as_view(), name='register'),
]
