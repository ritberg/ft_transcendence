from django.urls import path
from user_management.views import (LoginUserView, LogoutUserView, RegisterUserView,
								   UpdateUserView, IndexView, SendFriendRequestView,
								   AcceptFriendRequestView, RejectFriendRequestView,
								   ListFriendsRequestsView, ListFriendsView, DeleteFriendView,
                                   BlockUserView, UnblockUserView, ListBlockedUsers, GetUserID, GetUserPicture)

urlpatterns = [
	path('index/', IndexView.as_view(), name='index'),
    path('signin/', LoginUserView.as_view(), name='login'),
    path('logout/', LogoutUserView.as_view(), name='logout'),
    path('register/', RegisterUserView.as_view(), name='register'),
	path('update/', UpdateUserView.as_view(), name='update'),
    path('send-friend-request/', SendFriendRequestView.as_view(), name='send_friend_request'),
    path('accept-friend-request/', AcceptFriendRequestView.as_view(), name='accept_friend_request'),
    path('reject-friend-request/', RejectFriendRequestView.as_view(), name='reject_friend_request'),
    path('list-friend-requests/', ListFriendsRequestsView.as_view(), name='list_friend_requests'),
    path('list-friends/', ListFriendsView.as_view(), name='list_friends'),
    path('delete-friend/', DeleteFriendView.as_view(), name='delete_friend'),
    path('block-user/', BlockUserView.as_view(), name='block_user'),
    path('unblock-user/', UnblockUserView.as_view(), name='unblock_user'),
    path('list-blocked-users/', ListBlockedUsers.as_view(), name='list_blocked_users'),
	path('get-user-id/', GetUserID.as_view(), name='get_user_id'),
    path('get-user-picture/<str:username>/', GetUserPicture.as_view(), name='get_user_picture')
]
