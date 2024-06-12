from django.shortcuts import render

# Create your views here.
# views.py
def index_view(request):
    return render(request, 'index.html')

def test_view(request):
    return render(request, 'indexx.html')
