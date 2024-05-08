from django.contrib import admin
from .models import CustomUser

class CustomUserAdmin(admin.ModelAdmin):
    search_fields = ['username', 'email', 'profile_picture']

admin.site.register(CustomUser, CustomUserAdmin)