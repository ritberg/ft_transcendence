from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model
from .serializers import UserSerializer

# Create your views here.

User = get_user_model()

class RegisterUserView(APIView):
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
	def post(self, request , *args, **kwargs):
		try:
			user = authenticate(
				username=request.data['username'],
				password=request.data['password'],
				)
			if user is not None:
				login(request, user)
				return Response(
					{
						'data': UserSerializer(user).data,
						'message': 'User logged in successfully'
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
	def put(self, request, *args, **kwargs):
		try:
			user = User.objects.get(id=request.user.id)
			serializer = UserSerializer(user, data=request.data)
			if serializer.is_valid():
				serializer.save()
				return Response(
					{
						'data': serializer.data,
						'message': 'User updated successfully'
					},
					status=status.HTTP_200_OK
					)
			raise Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
		except Exception as e:
			print(f"error: {e}")
			return Response(
				{'message': f"{type(e).__name__}: {str(e)}"},
				status=status.HTTP_400_BAD_REQUEST
				)
