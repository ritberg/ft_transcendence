from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib.auth.forms import AuthenticationForm
from .models import *
from .forms import *
from django.shortcuts import get_object_or_404
from django.contrib.auth.decorators import login_required
from django.db.models import Q


# @csrf_exempt
# def start_chat(request):
#     if request.method == 'POST':
#         try:
#             data = json.loads(request.body)
#             username = data.get('username')
            
#             if username:
#                 other_user = get_object_or_404(User, username=username)
                
#                 # Ensure the chat room is unique for these two users
#                 room_name = f"{min(request.user.username, other_user.username)}_{max(request.user.username, other_user.username)}"
#                 chat_room, created = ChatRoom.objects.get_or_create(room_name=room_name, defaults={'user1': request.user, 'user2': other_user})
                
#                 return JsonResponse({'success': True, 'room_name': room_name})
#             else:
#                 return JsonResponse({'success': False, 'error': 'Invalid username'})
#         except (KeyError, json.JSONDecodeError) as e:
#             return JsonResponse({'success': False, 'error': str(e)})
#     else:
#         return JsonResponse({'success': False, 'error': 'Invalid request method'})


@login_required
def chatRoom(request, username):
    other_user = get_object_or_404(User, username=username)
    print(other_user)
    if other_user == request.user:
        # Prevent users from chatting with themselves
        return redirect('chat-page')
    
    room_name = f"{min(request.user.username, other_user.username)}_{max(request.user.username, other_user.username)}"
    
    chat_room = ChatRoom.objects.filter(Q(user1=request.user, user2=other_user) | Q(user1=other_user, user2=request.user)).first()
    if not chat_room:
        chat_room = ChatRoom.objects.create(user1=request.user, user2=other_user, room_name=room_name)

    messages = ChatMessage.objects.filter(room_name=chat_room).order_by('timestamp')
    context = {
        "room_name": room_name,
        "username": request.user.username,
        "messages": messages,
        "other_user": other_user.username
    }
    return render(request, "chat/chatRoom.html", context)

# @login_required
# def chatRoom(request, room_name):
#     print("room name!:", room_name)
#     messages = ChatMessage.objects.filter(room_name=room_name).order_by('timestamp')
#     context = {"room_name" : room_name, "username": request.user.username, "messages": messages}
#     return render(request, "chat/chatRoom.html", context)

@login_required
def userList(request):
    users = User.objects.exclude(username=request.user.username)
    return render(request, 'chat/user_list.html', {'users': users})

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