from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate, login, logout, get_user_model
from .serializers import UserSerializer, FriendRequestSerializer, MyTokenObtainPairSerializer
from django.middleware.csrf import get_token
from django.shortcuts import render, get_object_or_404
from .models import FriendRequest
from rest_framework.exceptions import NotFound
from rest_framework_simplejwt.tokens import RefreshToken
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from rest_framework_simplejwt.views import (
	TokenObtainPairView,
	TokenRefreshView,
)
from rest_framework.decorators import api_view, permission_classes
from django.conf import settings
import pyotp
import qrcode
import base64
import time
from io import BytesIO
import re

User = get_user_model()

class UserInfoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
def check_2fa_status(request):
    user = request.user
    if not user.is_authenticated:
        return Response({'detail': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

    return Response({
        'is_2fa_verified': user.is_2fa_verified
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
def disable_2fa(request):
	user = request.user
	if not user.is_authenticated:
		return Response({'detail': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

	if not user.is_2fa_verified:
		return Response({'detail': '2FA is not enabled for this user'}, status=status.HTTP_400_BAD_REQUEST)

	user.is_2fa_verified = False
	user.otp_secret = None
	user.save()

	return Response({'message': '2FA has been disabled successfully'}, status=status.HTTP_200_OK)

# authentication views
@api_view(['POST'])
def enable_2fa(request):
	user = request.user
	if not user.is_authenticated:
		return Response({'detail': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

	if user.is_2fa_verified:
		return Response({'detail': '2FA is already fully enabled for this user'}, status=status.HTTP_400_BAD_REQUEST)
	
	# Generate a new secret key
	secret_key = pyotp.random_base32()
	user.otp_secret = secret_key
	user.is_2fa_verified = False
	user.save()

	# Generate OTP URI
	totp = pyotp.TOTP(secret_key)
	uri = totp.provisioning_uri(name=user.email, issuer_name="2FA")

	# Generate QR code
	qr = qrcode.QRCode(version=1, box_size=10, border=5)
	qr.add_data(uri)
	qr.make(fit=True)
	img = qr.make_image(fill_color="black", back_color="white")
	
	# Convert image to base64
	buffered = BytesIO()
	img.save(buffered, format="PNG")
	img_str = base64.b64encode(buffered.getvalue()).decode()

	return Response({
		'detail': '2FA setup has been initiated',
		'otp_secret': secret_key,
		'qr_code': f"data:image/png;base64,{img_str}"
	}, status=status.HTTP_200_OK)

@api_view(['POST'])
def verify_otp(request):
	user = request.user
	otp = request.data.get('otp')

	if not user.is_authenticated:
		return Response({'detail': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

	if not otp:
		return Response({'detail': 'OTP is required'}, status=status.HTTP_400_BAD_REQUEST)

	if user.is_2fa_verified:
		return Response({'detail': '2FA is already verified for this user'}, status=status.HTTP_400_BAD_REQUEST)

	if not user.otp_secret:
		return Response({'detail': '2FA setup has not been initiated for this user'}, status=status.HTTP_400_BAD_REQUEST)

	totp = pyotp.TOTP(user.otp_secret)
	
	# Check current time and expected OTP
	current_time = int(time.time())
	expected_otp = totp.at(current_time)
	print(f"Current time: {current_time}")
	print(f"Expected OTP: {expected_otp}")
	print(f"Received OTP: {otp}")
	
	if totp.verify(otp, valid_window=1):
		user.is_2fa_verified = True
		user.save()
		return Response({'detail': 'OTP verified successfully. 2FA is now fully enabled.'}, status=status.HTTP_200_OK)
	else:
		return Response({'detail': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

class VerifyOTPLoginView(APIView):
	permission_classes = [AllowAny]

	def post(self, request, *args, **kwargs):
		user_id = request.data.get('user_id')
		otp = request.data.get('otp')

		try:
			user = User.objects.get(id=user_id)
		except User.DoesNotExist:
			return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

		# if not user.is_2fa_enabled:
		# 	return Response({'message': '2FA is not enabled for this user'}, status=status.HTTP_400_BAD_REQUEST)

		totp = pyotp.TOTP(user.otp_secret)
		if totp.verify(otp):
			login(request, user)
			refresh = RefreshToken.for_user(user)
			user.is_2fa_verified = True
			return Response(
				{
					'refresh': str(refresh),
					'access': str(refresh.access_token),
					'user': UserSerializer(user).data,
					'message': 'User logged in successfully',
				},
				status=status.HTTP_200_OK
			)
		else:
			return Response({'message': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
			
class IndexView(APIView):
	permission_classes = [AllowAny]

	def get(self, request):
		return render(request, 'index.html')


class RegisterUserView(APIView):
	permission_classes = [AllowAny]

	def post(self, request, *args, **kwargs):
		email = request.data.get('email')
		username= request.data.get('username')
		
		if User.objects.filter(email=email).exists():
			return Response(
				{'email': 'Email already exists'},
				status=status.HTTP_400_BAD_REQUEST
			)
		
		prohibited_usernames = ["guest", "system", "admin"]
		if username.lower() in prohibited_usernames:
			return Response(
				{'username': 'Username not allowed'},
				status=status.HTTP_400_BAD_REQUEST
			)
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
				if user.is_2fa_verified:
					# Si 2FA est activé, ne pas connecter l'utilisateur immédiatement
					return Response(
						{
							'message': '2FA is enabled. Please provide OTP.',
							'require_2fa': True,
							'user_id': user.id
						},
						status=status.HTTP_200_OK
					)
				else:
					# Si 2FA n'est pas activé, connecter l'utilisateur normalement
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
			username = request.data.get('username')

			prohibited_usernames = ["guest", "system", "admin"]
			if username:
				if username.lower() in prohibited_usernames:
					return Response(
						{'message': 'Username not allowed'},
						status=status.HTTP_400_BAD_REQUEST
					)

			serializer = UserSerializer(request.user, data=request.data, partial=True)
			if serializer.is_valid():
				user = serializer.save()
				send_status_update(user)
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
			match = re.search(r"ErrorDetail\(string='(.*?)'", error_message)
			if match:
				extracted_string = match.group(1)
			else:
				extracted_string = str(e)

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

class TokenObtainPairView(TokenObtainPairView):
	serializer_class = MyTokenObtainPairSerializer

class GetUserLanguage(APIView):
	permission_classes = [IsAuthenticated]

	def get(self, request):
		username = request.user.username
		try:
			if not username:
				raise NotFound('A username query parameter is required.')
			user = User.objects.get(username=username)
			return Response({'language': user.language}, status=status.HTTP_200_OK)
		except Exception as e:
			return Response({'message': f"{type(e).__name__}: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
	
class ChangeUserLanguage(APIView):
	permission_classes = [IsAuthenticated]

	def post(self, request, *args, **kwargs):
		print("request data:", request.data)
		language = request.data.get('language')
		username = request.user.username
		try:
			if not username:
				raise NotFound('A username query parameter is required.')
			if not language:
				raise NotFound('Please select a language')
			user = User.objects.get(username=username)
			user.language = language
			user.save()
			return Response({'message': "The language has been successfully changed."}, status=status.HTTP_200_OK)
		except Exception as e:
			return Response({'message': f"{type(e).__name__}: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

def send_status_update(user):
	channel_layer = get_channel_layer()
	async_to_sync(channel_layer.group_send)(
		"users",
		{
			"type": "status_update",
			"user_id": user.id,
			"username": user.username,
			"status": user.status,
		}
	)