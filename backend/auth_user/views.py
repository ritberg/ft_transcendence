from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model
from .serializers import UserSerializer

from django.middleware.csrf import get_token
from django.shortcuts import render

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
	print("entry in LoginUserView")
	permission_classes = [AllowAny]

	def post(self, request , *args, **kwargs):
		try:
			print("request.data : ", request.data)
			user = authenticate(
				request,
				username=request.data['username'],
				password=request.data['password'],
				)
			if user is not None:
				login(request, user)
				print("session_key : " ,request.session.session_key)
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
			print(request.user.id)
			print(request.session.session_key)
			if request.user.is_authenticated:
				print('User is authenticated')
			else:
				print('User is not authenticated')
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
				print(f"resquest.data : {request.data}")
				serializer = UserSerializer(request.user, data=request.data, partial=True)
				if serializer.is_valid():
					serializer.save()
					return Response(
						{
							'data': serializer.data,
							'message': 'User updated successfully'
						},
						status=status.HTTP_200_OK
						)
				raise ValueError(serializer.errors)
			except Exception as e:
				print(e)
				return Response(
					{'message': f"{type(e).__name__}: {str(e)}"},
					status=status.HTTP_400_BAD_REQUEST
					)

def IndexView(request):
	permission_classes = [AllowAny]

	return render(request, 'index.html')
