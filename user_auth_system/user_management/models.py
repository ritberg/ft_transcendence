from django.contrib.auth.models import AbstractUser
from django.db import models

DEFAULT_PROFILE_PICTURE = 'profile_pics/default.jpg'

class CustomUser(AbstractUser):
	profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True, default=DEFAULT_PROFILE_PICTURE)
	friends = models.ManyToManyField('self', blank=True)

	class Meta:
		db_table = 'users'

	def __str__(self):
		return self.username
	
class FriendRequest(models.Model):
	from_user = models.ForeignKey(CustomUser, related_name='from_user', on_delete=models.CASCADE)
	to_user = models.ForeignKey(CustomUser, related_name='to_user', on_delete=models.CASCADE)

	class Meta:
		db_table = 'friend_requests'

	def __str__(self):
		return f'{self.from_user} sent friend request to {self.to_user}'
