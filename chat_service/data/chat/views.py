import requests
from django.shortcuts import render, redirect
from django.conf import settings
from django.contrib.auth.forms import AuthenticationForm
from .models import ChatMessage
from .forms import SignUpForm

AUTH_SERVICE_URL = "http://auth:8000" 

def chatRoom(request, room_name):
    token = request.session.get('token')
    if not token:
        return redirect('login')
    
    response = requests.post(f'{AUTH_SERVICE_URL}/validate-token', json={'token': token})
    if response.status_code != 200:
        return redirect('login')
    
    messages = ChatMessage.objects.filter(room_name=room_name).order_by('timestamp')
    context = {"room_name": room_name, "username": request.user.username, "messages": messages}
    return render(request, "chat/chatRoom.html", context)


def chatPage(request, *args, **kwargs):
    token = request.session.get('token')
    if not token:
        return redirect('login')
    
    response = requests.post(f'{AUTH_SERVICE_URL}/validate-token', json={'token': token})
    if response.status_code != 200:
        return redirect('login')
    
    context = {}
    return render(request, "chat/chatPage.html", context)


# def loginUser(request):
#     if request.method == 'POST':
#         username = request.POST.get('username')
#         password = request.POST.get('password')
#         response = requests.post(f'{AUTH_SERVICE_URL}/login', json={'username': username, 'password': password})
        
#         if response.status_code == 200:
#             data = response.json()
#             token = data.get('token')
#             request.session['token'] = token
#             request.session['username'] = username
#             return redirect('chat-page')
#         else:
#             context = {'form': AuthenticationForm(), 'error': response.json().get('message', 'Login failed')}
#             return render(request, "chat/LoginPage.html", context)
#     else:
#         form = AuthenticationForm()
#     return render(request, "chat/LoginPage.html", {'form': form})


# def signup(request):
#     if request.method == 'POST':
#         form = SignUpForm(request.POST)
#         if form.is_valid():
#             username = form.cleaned_data.get('username')
#             password = form.cleaned_data.get('password')
#             response = requests.post(f'{AUTH_SERVICE_URL}/register', json={'username': username, 'password': password})
            
#             if response.status_code == 201:
#                 login_response = requests.post(f'{AUTH_SERVICE_URL}/login', json={'username': username, 'password': password})
#                 if login_response.status_code == 200:
#                     data = login_response.json()
#                     token = data.get('token')
#                     request.session['token'] = token
#                     request.session['username'] = username
#                     return redirect('chat-page')
#                 else:
#                     context = {'form': form, 'error': login_response.json().get('message', 'Login failed')}
#                     return render(request, "chat/SignupPage.html", context)
#             else:
#                 context = {'form': form, 'error': response.json().get('message', 'Registration failed')}
#                 return render(request, "chat/SignupPage.html", context)
#     else:
#         form = SignUpForm()
#     return render(request, "chat/SignupPage.html", {'form': form})


# from django.shortcuts import render, redirect
# from django.contrib.auth import authenticate, login
# from django.contrib.auth.forms import AuthenticationForm
# from .models import *
# from .forms import *

# def chatRoom(request, room_name):
#     if not request.user.is_authenticated:
#         return redirect("login")
#     messages = ChatMessage.objects.filter(room_name=room_name).order_by('timestamp')
#     context = {"room_name" : room_name, "username": request.user.username, "messages": messages}
#     return render(request, "chat/chatRoom.html", context)


# def chatPage(request, *args, **kwargs):
#     # if not request.user.is_authenticated:
#     #     return redirect("login-user")
#     context = {}
#     return render(request, "chat/chatPage.html", context)

# def loginUser(request):
#     if request.method == 'POST':
#         form = AuthenticationForm(request, data=request.POST)
#         if form.is_valid():
#             username = form.cleaned_data.get('username')
#             password = form.cleaned_data.get('password')
#             user = authenticate(request, username=username, password=password)
#             if user is not None:
#                 print(user)
#                 login(request, user)
#                 return redirect('chat-page')
#         # else:
#         #     print(form.errors)
#     else:
#         print("llllll")
#         form = AuthenticationForm()
#     return render(request, "chat/LoginPage.html", {'form': form})

# def signup(request):
#     if request.method == 'POST':
#         form = SignUpForm(request.POST)
#         if form.is_valid():
#             print("hhhhhhh")
#             user = form.save()
#             login(request, user)
#             return redirect('chat-page')
#         # else:
#             # print(form.errors)
#     else:
#         print("haha")
#         form = SignUpForm()
#     return render(request, "chat/SignupPage.html", {'form': form})

