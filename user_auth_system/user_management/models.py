from django.contrib.auth.models import AbstractUser
from django.db import models

DEFAULT_PROFILE_PICTURE = 'profile_pics/default.jpg'

class CustomUser(AbstractUser):
	profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True, default=DEFAULT_PROFILE_PICTURE)

	class Meta:
		db_table = 'users'
