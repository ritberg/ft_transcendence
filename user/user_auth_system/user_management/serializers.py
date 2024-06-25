from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password
from rest_framework import serializers
from .models import DEFAULT_PROFILE_PICTURE
from .models import FriendRequest
from django.core.exceptions import ValidationError as DjangoValidationError
from django.contrib.auth.password_validation import validate_password
from django.core.validators import validate_email
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = ['id', 'username', 'email', 'password', 'profile_picture', 'is_2fa_enabled', 'otp_secret', 'friends', 'status', 'is_2fa_verified']
		read_only_fields = ['otp_secret']
		extra_kwargs = {'password': {'write_only': True}}

	def create(self, validated_data):
		username = validated_data.get('username')
		email = validated_data.get('email')
		password = validated_data.get('password')
		profile_picture = validated_data.get('profile_picture', DEFAULT_PROFILE_PICTURE)

		if not username:
			raise serializers.ValidationError({'username': 'Username is required.'})

		if not email:
			raise serializers.ValidationError({'email': 'Email is required.'})
		try:
			validate_email(email)
		except DjangoValidationError:
			raise serializers.ValidationError({'email': 'Enter a valid email address.'})

		if not password:
			raise serializers.ValidationError({'password': 'Password is required.'})
		try:
			validate_password(password)
		except DjangoValidationError as e:
			raise serializers.ValidationError({'password': list(e.messages)})

		user = User.objects.create_user(
			username=username,
			email=email,
			profile_picture=profile_picture
		)
		user.set_password(password)
		user.save()
		return user

	def update(self, instance, validated_data):
		username = validated_data.get('username')
		if username:
			if User.objects.filter(username=username).exclude(id=instance.id).exists():
				raise serializers.ValidationError({'username': 'This username is already in use.'})
			elif username == instance.username:
				raise serializers.ValidationError({'username': 'This is already your username.'})
			instance.username = username

		email = validated_data.get('email')
		if email:
			if User.objects.filter(email=email).exclude(id=instance.id).exists():
				raise serializers.ValidationError({'email': 'This email is already in use.'})
			elif email == instance.email:
				raise serializers.ValidationError({'email': 'This is already your email.'})
			instance.email = email

		password = validated_data.get('password')
		if password:
			if check_password(password, instance.password):
				raise serializers.ValidationError({'password': 'This is already your password.'})
			try:
				validate_password(password)
			except DjangoValidationError as e:
				raise serializers.ValidationError({'password': list(e.messages)})
			instance.set_password(password)

		profile_picture = validated_data.get('profile_picture')
		if profile_picture and profile_picture != instance.profile_picture:
			if instance.profile_picture != DEFAULT_PROFILE_PICTURE:
				instance.profile_picture.delete(save=False)
			instance.profile_picture = profile_picture

		instance.save()
		return instance
	
class FriendRequestSerializer(serializers.ModelSerializer):
	from_user = serializers.SerializerMethodField()
	to_user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
	
	class Meta:
		model = FriendRequest
		fields = ['id', 'from_user', 'to_user']
		extra_kwargs = {'from_user': {'read_only': True}}
	
	def create(self, validated_data):
		from_user = self.context['request'].user
		to_user = validated_data.get('to_user')
		if not to_user:
			raise serializers.ValidationError('to_user field is required.')
		if User.objects.filter(id=to_user.id).exists() == False:
			raise serializers.ValidationError('User does not exist.')
		if from_user == to_user:
			raise serializers.ValidationError('You cannot send friend request to yourself.')
		if from_user.friends.filter(id=to_user.id).exists():
			raise serializers.ValidationError('You are already friends with this user.')
		if FriendRequest.objects.filter(from_user=from_user, to_user=to_user).exists():
			raise serializers.ValidationError('You have already sent a friend request to this user.')
		if FriendRequest.objects.filter(from_user=to_user, to_user=from_user).exists():
			raise serializers.ValidationError('You have already received friend request from this user.')
		friend_request = FriendRequest.objects.create(from_user=from_user, to_user=to_user)
		return friend_request
	
	def get_from_user(self, obj):
		return {
			'id': obj.from_user.id,
			'username': obj.from_user.username,
			'profile_picture': obj.from_user.profile_picture.url if obj.from_user.profile_picture else None,
		}

	def get_to_user(self, obj):
		return {
			'id': obj.to_user.id,
			'username': obj.to_user.username,
			'profile_picture': obj.to_user.profile_picture.url if obj.to_user.profile_picture else None,
		}

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

	@classmethod
	def get_token(cls, user):
		token = super().get_token(user)

		token['username'] = user.username
		token['email'] = user.email

		return token

	def validate(self, attrs):
		data = super().validate(attrs)

		data['user'] = {
			'id': self.user.id,
			'username': self.user.username,
			'email': self.user.email,
		}

		return data
