from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
	profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)

	class Meta:
		db_table = 'users'
