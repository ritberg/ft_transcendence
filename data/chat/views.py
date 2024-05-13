from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from .models import *
from .forms import *

def chatRoom(request, room_name):
    if not request.user.is_authenticated:
        return redirect("signup")
    context = {"room_name" : room_name}
    return render(request, "chat/chatRoom.html", context)


def chatPage(request, *args, **kwargs):
    # if not request.user.is_authenticated:
    #     return redirect("login-user")
    context = {}
    return render(request, "chat/chatPage.html", context)


def signup(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            print("hhhhhhh")
            user = form.save()
            login(request, user)
            return redirect('chat-page')
        else:
            print(form.errors)
    else:
        print("haha")
        form = SignUpForm()
    return render(request, "chat/LoginPage.html")



# def getUser(request, *args, **kwargs):
#     if request.method == 'POST':
#         userName = request.POST["username"]
#         userPass = request.POST["password"]
#         try:
#             print("1111111111")
#             userMail = request.POST["email"]
#             newUser = User(name=userName, password=userPass, email=userMail)
#             newUser.save()
#         except:
#             print("222222222")
#             try:
#                 user = authenticate(request, username=userName, password=userPass)
#                 print(user)
#                 if user and user.is_active:
#                     print("3333.666665555")
#                     login(request, user)
#                 print(request.user.is_authenticated)
#                 return redirect("chat-page")
#             except Exception as e: 
#                 error_message = str(e) 
#                 return render(request, "chat/LoginPage.html", {"error_message": error_message})
#     return render(request, "chat/LoginPage.html")