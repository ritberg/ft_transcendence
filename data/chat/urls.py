from django.urls import path, include
from chat import views as chat_views
from django.contrib.auth.views import LogoutView, LoginView


urlpatterns = [
    path("chat/<str:username>/", chat_views.chatRoom, name="room"),
    path("", chat_views.chatPage, name="chat-page"),

    # login-section
    # path("auth/login/",  chat_views.getUser, name="login-user"),
    path('signup/', chat_views.signup, name ="signup"),
    path("login/", chat_views.loginUser, name="login"),
    path("logout/", LogoutView.as_view(), name="logout-user"),
    
]
