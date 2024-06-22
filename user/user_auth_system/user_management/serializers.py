from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password
from rest_framework import serializers
from .models import DEFAULT_PROFILE_PICTURE, CustomUser, FriendRequest
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

# class UserSerializer(serializers.ModelSerializer):
# 	password = serializers.CharField(write_only=True, required=True)
# 	class Meta:
# 		model = CustomUser
# 		fields = ['id', 'username', 'email', 'is_2fa_enabled', 'otp_secret']
# 		read_only_fields = ['otp_secret']
# 		extra_kwargs = {'password': {'write_only': True}}
# 		# model = User
# 		# fields = ['id', 'username', 'email', 'password', 'profile_picture', 'friends', 'status']
# 		# extra_kwargs = {'password': {'write_only': True}}

# 	def create(self, validated_data):
# 		user = User.objects.create_user(
# 			username=validated_data['username'],
# 			email=validated_data['email'],
# 			profile_picture=validated_data.get('profile_picture')
# 		)
# 		user.set_password(validated_data['password'])
# 		user.save()
# 		return user

# 	def update(self, instance, validated_data):
# 		username = validated_data.get('username', None)
# 		if username:
# 			if User.objects.filter(username=username).exclude(id=instance.id).exists():
# 				raise serializers.ValidationError({'username': 'This username is already in use.'})
# 			elif username == instance.username:
# 				raise serializers.ValidationError({'username': 'This is already your username.'})
# 			instance.username = username
# 		email = validated_data.get('email', None)
# 		if email:
# 			if User.objects.filter(email=email).exclude(id=instance.id).exists():
# 				raise serializers.ValidationError({'email': 'This email is already in use.'})
# 			elif email == instance.email:
# 				raise serializers.ValidationError({'email': 'This is already your email.'})
# 			instance.email = email
# 		password = validated_data.get('password', None)
# 		if password:
# 			if check_password(password, instance.password):
# 				raise serializers.ValidationError({'password': 'This is already your password.'})
# 			instance.set_password(password)
# 		profile_picture = validated_data.get('profile_picture', None)
# 		if profile_picture and profile_picture != instance.profile_picture:
# 			if instance.profile_picture != DEFAULT_PROFILE_PICTURE:
# 				instance.profile_picture.delete(save=False)
# 			instance.profile_picture = profile_picture
# 		instance.save()
# 		return instance

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password
from rest_framework import serializers
from .models import DEFAULT_PROFILE_PICTURE, CustomUser, FriendRequest
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
	password = serializers.CharField(write_only=True, required=True)

	class Meta:
		model = CustomUser
		fields = ['id', 'username', 'email', 'password', 'is_2fa_enabled', 'otp_secret']
		read_only_fields = ['otp_secret']
		extra_kwargs = {'password': {'write_only': True}}

	def create(self, validated_data):
		user = User.objects.create_user(
			username=validated_data['username'],
			email=validated_data['email'],
			profile_picture=validated_data.get('profile_picture', DEFAULT_PROFILE_PICTURE)
		)
		user.set_password(validated_data['password'])
		user.save()
		return user

	def update(self, instance, validated_data):
		username = validated_data.get('username', None)
		if username:
			if User.objects.filter(username=username).exclude(id=instance.id).exists():
				raise serializers.ValidationError({'username': 'This username is already in use.'})
			elif username == instance.username:
				raise serializers.ValidationError({'username': 'This is already your username.'})
			instance.username = username
		email = validated_data.get('email', None)
		if email:
			if User.objects.filter(email=email).exclude(id=instance.id).exists():
				raise serializers.ValidationError({'email': 'This email is already in use.'})
			elif email == instance.email:
				raise serializers.ValidationError({'email': 'This is already your email.'})
			instance.email = email
		password = validated_data.get('password', None)
		if password:
			if check_password(password, instance.password):
				raise serializers.ValidationError({'password': 'This is already your password.'})
			instance.set_password(password)
		profile_picture = validated_data.get('profile_picture', None)
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

# class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
# 	def validate(self, attrs):
# 		data = super().validate(attrs)
# 		data.update({'email': self.user.email})
# 		return data

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

	@classmethod
	def get_token(cls, user):
		token = super().get_token(user)

		# Ajouter des informations supplémentaires au token
		token['username'] = user.username
		token['email'] = user.email

		return token

	def validate(self, attrs):
		data = super().validate(attrs)

		# Vous pouvez ajouter des informations supplémentaires à la réponse ici
		data['user'] = {
			'id': self.user.id,
			'username': self.user.username,
			'email': self.user.email,
		}

		return data