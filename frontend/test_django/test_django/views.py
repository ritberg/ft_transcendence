# views.py
from django.shortcuts import render

def example_view(request):
    return render(request, 'index.html')
