from django.shortcuts import render

# Create your views here.
# views.py
def index_view(request):
    return render(request, 'index.html')
def pong_view(request):
    return render(request, 'pong.html')
def pong3D_view(request):
    return render(request, 'pong3D.html')
