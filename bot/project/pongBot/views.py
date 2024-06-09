from django.shortcuts import render
from django.http import HttpResponse
from .models import CustomUser
from django.db import IntegrityError

def create_user(request):
    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')
        try:
            user = CustomUser.objects.create(username=username)
            user.set_password(password)
            user.save()
            return HttpResponse("User created successfully!")
        except IntegrityError:
            return HttpResponse("Error: Username already exists.")
    return render(request, 'create_user.html')

# Create your views here.
def display(request):
    return render(request, "pongBot/index.html")
