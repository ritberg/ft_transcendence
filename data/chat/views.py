from django.shortcuts import render, redirect


def chatRoom(request, room_name):
    if not request.user.is_authenticated:
        return redirect("login-user")
    context = {"room_name" : room_name}
    return render(request, "chat/chatRoom.html", context)


def chatPage(request, *args, **kwargs):
    if not request.user.is_authenticated:
        return redirect("login-user")
    context = {}
    return render(request, "chat/chatPage.html", context)
