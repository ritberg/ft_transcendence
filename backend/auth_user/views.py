from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from .serializers import UserSerializer

from django.middleware.csrf import get_token

# Create your views here.

User = get_user_model()

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
		return Response( serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginUserView(APIView):
	permission_classes = [AllowAny]

	def post(self, request , *args, **kwargs):
		try:
			user = authenticate(
				username=request.data['username'],
				password=request.data['password'],
				)
			if user is not None:
				refresh = RefreshToken.for_user(user)
				return Response({
					'access': str(refresh.access_token),
					'refresh': str(refresh),
					'data': UserSerializer(user).data,
					'message': 'User logged in successfully',
				})
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
			token = RefreshToken(request.data['refresh'])
			token.blacklist()  # Ajoute le token à la liste noire
			return Response(
				{'message': 'User logged out successfully'},
				status=status.HTTP_205_RESET_CONTENT
				)
		except Exception as e:
			return Response(
				{'message': str(e)},
				status=status.HTTP_400_BAD_REQUEST
				)
	
class UpdateUserView(APIView):
	permission_classes = [IsAuthenticated]

	def put(self, request, *args, **kwargs):
		try:
			serializer = UserSerializer(request.user, data=request.data, partial=True)  # Allow partial update
			if serializer.is_valid():
				serializer.save()
				return Response({
					'data': serializer.data,
					'message': 'User updated successfully',
				}, status=status.HTTP_200_OK)
			raise ValueError(serializer.errors)
		except Exception as e:
			return Response({
				'message': f"{type(e).__name__}: {str(e)}",
				'errors': serializer.errors if 'serializer' in locals() else {},
			}, status=status.HTTP_400_BAD_REQUEST)