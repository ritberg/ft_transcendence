from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = ['id', 'username', 'email', 'password', 'profile_picture']
		extra_kwargs = {'password': {'write_only': True}}

	def create(self, validated_data):
		user = User.objects.create_user(
			username=validated_data['username'],
			email=validated_data['email'],
			profile_picture=validated_data.get('profile_picture')
		)
		user.set_password(validated_data['password'])
		user.save()
		return user

	def update(self, instance, validated_data):
		print("instance : ", instance)
		print("validated_data : ", validated_data)
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
			if password == instance.password:
				raise serializers.ValidationError({'password': 'This is already your password.'})
			instance.set_password(password)
		profile_picture = validated_data.get('profile_picture', None)
		if profile_picture:
			instance.profile_picture.delete(save=False)
			instance.profile_picture = profile_picture
		instance.save()
		return instance