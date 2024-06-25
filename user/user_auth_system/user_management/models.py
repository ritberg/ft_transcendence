from django.contrib.auth.models import AbstractUser
from django.db import models
from rest_framework import serializers
import pyotp


DEFAULT_PROFILE_PICTURE = 'profile_pics/default.jpg'

class CustomUser(AbstractUser):
	STATUS_CHOICES = [
		('online', 'Online'),
		('offline', 'Offline'),
		('in_game', 'In Game'),
	]
	
	profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True, default=DEFAULT_PROFILE_PICTURE)
	friends = models.ManyToManyField('self', blank=True, symmetrical=False, related_name='user_friends')
	blocked_users = models.ManyToManyField('self', blank=True, symmetrical=False, related_name='blocked_by')
	status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='offline')
	language = models.CharField(max_length=2, default='en')
	is_2fa_enabled = models.BooleanField(default=False)
	is_2fa_verified = models.BooleanField(default=False)
	otp_secret = models.CharField(max_length=32, default=pyotp.random_base32)

	class Meta:
		db_table = 'users'

	def __str__(self):
		return self.username
	
	def get_otp(self):
		return pyotp.TOTP(self.otp_secret).now()
	
class FriendRequest(models.Model):
	from_user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='sent_requests')
	to_user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='received_requests')

	class Meta:
		db_table = 'friend_requests'

	def __str__(self):
		return f'{self.from_user} sent friend request to {self.to_user}'
	