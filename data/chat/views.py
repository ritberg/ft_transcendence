from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib.auth.forms import AuthenticationForm
from .models import *
from .forms import *
from django.shortcuts import get_object_or_404
from django.contrib.auth.decorators import login_required


@login_required
def chatRoom(request, username):
    print(other_user)
    other_user = get_object_or_404(User, username=username)
    if other_user == request.user:
        # Prevent users from chatting with themselves
        return redirect('chat-page')
    
    chat_room, created = ChatRoom.objects.get_or_create(
        user1__in=[request.user, other_user],
        user2__in=[request.user, other_user]
    )
    room_name = chat_room.get_room_name()
    
    messages = ChatMessage.objects.filter(room_name=room_name).order_by('timestamp')
    context = {
        "room_name": room_name,
        "username": request.user.username,
        "messages": messages,
        "other_user": other_user.username
    }
    return render(request, "chat/chatRoom.html", context)

# def chatRoom(request, room_name):
#     print("room name!:", room_name)
#     if not request.user.is_authenticated:
#         return redirect("login")
#     messages = ChatMessage.objects.filter(room_name=room_name).order_by('timestamp')
#     context = {"room_name" : room_name, "username": request.user.username, "messages": messages}
#     return render(request, "chat/chatRoom.html", context)


def chatPage(request, *args, **kwargs):
    # if not request.user.is_authenticated:
    #     return redirect("login-user")
    context = {}
    return render(request, "chat/chatPage.html", context)

def loginUser(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(request, username=username, password=password)
            if user is not None:
                print(user)
                login(request, user)
                return redirect('chat-page')
        # else:
        #     print(form.errors)
    else:
        print("llllll")
        form = AuthenticationForm()
    return render(request, "chat/LoginPage.html", {'form': form})

def signup(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            print("hhhhhhh")
            user = form.save()
            login(request, user)
            return redirect('chat-page')
        # else:
            # print(form.errors)
    else:
        print("haha")
        form = SignUpForm()
    return render(request, "chat/SignupPage.html", {'form': form})



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