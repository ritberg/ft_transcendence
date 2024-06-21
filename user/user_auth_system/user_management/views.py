from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate, login, logout, get_user_model
from .serializers import UserSerializer, FriendRequestSerializer
from django.middleware.csrf import get_token
from django.shortcuts import render, get_object_or_404
from .models import FriendRequest
from rest_framework.exceptions import NotFound

# Create your views here.

User = get_user_model()

# authentication views

class IndexView(APIView):
	permission_classes = [AllowAny]

	def get(self, request):
		return render(request, 'index.html')


class RegisterUserView(APIView):
	permission_classes = [AllowAny]

	def post(self, request, *args, **kwargs):
		serializer = UserSerializer(data=request.data)
		if serializer.is_valid():
			serializer.save()
			return Response(
				{
					'data': serializer.data,
					'message': 'User registered successfully'
				},
				status=status.HTTP_201_CREATED
			)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginUserView(APIView):
	permission_classes = [AllowAny]

	def post(self, request , *args, **kwargs):
		try:
			user = authenticate(
				request,
				username=request.data['username'],
				password=request.data['password'],
			)
			if user is not None:
				login(request, user)
				csrf_token = get_token(request)
				print("csrf_token : ", csrf_token)
				return Response(
					{
						'data': UserSerializer(user).data,
						'crsfToken': csrf_token,
						'message': 'User logged in successfully',
					},
					status=status.HTTP_200_OK
				)
			raise ValueError('Invalid credentials')
		except Exception as e:
			return Response(
				{'message': f"{type(e).__name__}: {str(e)}"},
				status=status.HTTP_400_BAD_REQUEST
			)

class LogoutUserView(APIView):
	permission_classes = [IsAuthenticated]

	def post(self, request, *args, **kwargs):
		try:
			logout(request)
			return Response(
				{'message': 'User logged out successfully'},
				status=status.HTTP_200_OK
			)
		except Exception as e:
			return Response(
				{'message': f"{type(e).__name__}: {str(e)}"},
				status=status.HTTP_400_BAD_REQUEST
			)

class UpdateUserView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, *args, **kwargs):
        try:
            serializer = UserSerializer(request.user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()

                csrf_token = get_token(request)
                print("csrf_token : ", csrf_token)
                return Response(
                    {
                        'data': serializer.data,
                        'csrfToken': csrf_token,
                        'message': 'User updated successfully'
                    },
                    status=status.HTTP_200_OK
                )
            raise ValueError(serializer.errors)
        except Exception as e:
            error_message = f"{type(e).__name__}: {str(e)}"
            start_index = error_message.find("ErrorDetail(string='") + len("ErrorDetail(string='")
            end_index = error_message.find("', code='invalid")
            extracted_string = error_message[start_index:end_index]

            return Response(
                {'message': extracted_string},
                status=status.HTTP_400_BAD_REQUEST
            )


# friend request views


class SendFriendRequestView(APIView):
	permission_classes = [IsAuthenticated]

	def post(self, request, *args, **kwargs):
		try:
			print("request.data : ", request.data)
			serializer = FriendRequestSerializer(data=request.data, context={'request': request})
			if serializer.is_valid():
				friend_request = serializer.save()
				return Response(
					{
						'data': serializer.data,
						'message': f'Friend request sent successfully at {friend_request.to_user}'
					},
					status=status.HTTP_201_CREATED
				)
			raise ValueError(serializer.errors)
		except Exception as e:
				print(e)
				error_message = str(e.detail['non_field_errors'][0]) if 'non_field_errors' in e.detail else str(e.detail[0])
				return Response(
					{'message': error_message},
					status=status.HTTP_400_BAD_REQUEST
				)

class AcceptFriendRequestView(APIView):
	permission_classes = [IsAuthenticated]

	def post(self, request, *args, **kwargs):
		friend_request = get_object_or_404(FriendRequest ,id=request.data.get('friend_request_id'))
		if (friend_request.to_user == request.user):
			friend_request.from_user.friends.add(friend_request.to_user)
			friend_request.to_user.friends.add(friend_request.from_user)
			friend_request.delete()
			return Response(
				{'message': f'{friend_request.from_user} accepted friend request from {friend_request.to_user} successfully'},
				status=status.HTTP_202_ACCEPTED
			)
		return Response(
			{'message': 'Friend request cannot be accepted by this user'},
			status=status.HTTP_400_BAD_REQUEST
		)

class RejectFriendRequestView(APIView):
	permission_classes = [IsAuthenticated]

	def post(self, request, *args, **kwargs):
		friend_request = get_object_or_404(FriendRequest, id=request.data.get('friend_request_id'))
		if (friend_request.to_user == request.user):
			friend_request.delete()
			return Response(
				{'message': f'{friend_request.from_user} rejected friend request from {friend_request.to_user} successfully'},
				status=status.HTTP_200_OK
			)
		return Response(
			{'message': 'Friend request cannot be rejected by this user'},
			status=status.HTTP_400_BAD_REQUEST
		)

class ListFriendsRequestsView(APIView):
	permission_classes = [IsAuthenticated]

	def get(self, request, *args, **kwargs):
		friend_requests = FriendRequest.objects.filter(to_user=request.user)
		serializer = FriendRequestSerializer(friend_requests, many=True)
		return Response(
			{'data': serializer.data},
			status=status.HTTP_200_OK
		)

class ListFriendsView(APIView):
	permission_classes = [IsAuthenticated]

	def get(self, request, *args, **kwargs):
		friends = request.user.friends.all()
		serializer = UserSerializer(friends, many=True)
		return Response(
			{'data': serializer.data},
			status=status.HTTP_200_OK
		)

class DeleteFriendView(APIView):
	permission_classes = [IsAuthenticated]

	def delete(self, request, *args, **kwargs):
		friend = get_object_or_404(User, id=request.data.get('to_user'))
		if request.user.friends.filter(id=friend.id).exists():
			request.user.friends.remove(friend)
			friend.friends.remove(request.user)
			return Response(
				{'message': f'{friend} removed from friends successfully'},
				status=status.HTTP_200_OK
			)
		return Response(
			{'message': 'User is not in your friends list'},
			status=status.HTTP_400_BAD_REQUEST
		)
  
  
class BlockUserView(APIView):
	permission_classes = [IsAuthenticated]
	
	def post(self, request, *args, **kwargs):
		user_to_block = get_object_or_404(User, id=request.data.get('to_user'))
		
		if user_to_block == request.user:
			return Response(
				{'message': 'You cannot block yourself'},
				status=status.HTTP_400_BAD_REQUEST
			)
		
		if request.user.blocked_users.filter(id=user_to_block.id).exists():
			return Response(
				{'message': 'User is already blocked'},
				status=status.HTTP_400_BAD_REQUEST
			)
		
		request.user.blocked_users.add(user_to_block)
		return Response(
			{'message': f'{user_to_block.username} has been blocked successfully'},
			status=status.HTTP_200_OK
		)
		
	
class UnblockUserView(APIView):
	permission_classes = [IsAuthenticated]
	
	def post(self, request, *args, **kwargs):
		user_to_unblock_id = request.data.get('user_to_unblock_id')
		
		user_to_unblock = get_object_or_404(User, id=user_to_unblock_id)
		
		if user_to_unblock in request.user.blocked_users.all():
			request.user.blocked_users.remove(user_to_unblock)
			return Response(
				{'message': f'User {user_to_unblock.username} has been unblocked successfully'},
				status=status.HTTP_200_OK
			)
		else:
			return Response(
				{'message': f'User {user_to_unblock.username} is not currently blocked'},
				status=status.HTTP_400_BAD_REQUEST
			)
			
class ListBlockedUsers(APIView):
	permission_classes = [IsAuthenticated]

	def get(self, request, *args, **kwargs):
		blocked_users = request.user.blocked_users.all()
		blocked_usernames = [user.username for user in blocked_users]
		return Response({'blocked_users': blocked_usernames}, status=status.HTTP_200_OK)


class GetUserID(APIView):
	permission_classes = [IsAuthenticated]

	def get(self, request):
		username = request.query_params.get('username')
		try:
			if not username:
				raise NotFound('A username query parameter is required.')
			user = User.objects.get(username=username)
			return Response({'id': user.id}, status=status.HTTP_200_OK)
		except Exception as e:
			return Response({'message': f"{type(e).__name__}: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

class GetUserPicture(APIView):
	permission_classes = [IsAuthenticated]

	def get(self, request, username):
		try:
			if not username:
				raise NotFound('A username query parameter is required.')
			user = User.objects.get(username=username)
			profile_picture_url = user.profile_picture.url if user.profile_picture else None
			return Response({'pfp': profile_picture_url}, status=status.HTTP_200_OK)
		except Exception as e:
			return Response({'message': f"{type(e).__name__}: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
