from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from .serializers import UserSerializer

# Create your views here.
class LoginUserView(APIView):
	def post(self, request , *args, **kwargs):
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
		return Response(
			{'message': 'Invalid credentials'},
			status=status.HTTP_400_BAD_REQUEST
			)
	
class LogoutUserView(APIView):
	def post(self, request, *args, **kwargs):
		logout(request)
		return Response(
			{'message': 'User logged out successfully'},
			status=status.HTTP_200_OK
			)
	
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
		return Response(
			serializer.errors,
			status=status.HTTP_400_BAD_REQUEST
			)