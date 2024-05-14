from django.urls import path
from user_management.views import LoginUserView, LogoutUserView, RegisterUserView, UpdateUserView, IndexView, SendFriendRequestView, AcceptFriendRequestView, RejectFriendRequestView

urlpatterns = [
	path('index/', IndexView.as_view(), name='index'),
    path('login/', LoginUserView.as_view(), name='login'),
    path('logout/', LogoutUserView.as_view(), name='logout'),
    path('register/', RegisterUserView.as_view(), name='register'),
	path('update/', UpdateUserView.as_view(), name='update'),
    path('friend-request/', SendFriendRequestView.as_view(), name='friend-request'),
    path('accept-friend-request/', AcceptFriendRequestView.as_view(), name='accept-friend-request'),
    path('reject-friend-request/', RejectFriendRequestView.as_view(), name='reject-friend-request'),
]
