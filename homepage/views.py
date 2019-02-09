from django.shortcuts import render
from django.shortcuts import redirect
from login.models import *
import json
import  simplejson

# Create your views here.

def homepage(request):
    if (request.COOKIES.get('username') == None or request.COOKIES.get('is_superuser') == None):
        response = redirect('/homepage/logout/')
    else:
        user=User
        user.username=request.COOKIES.get('username')
        user.is_superuser=request.COOKIES.get('is_superuser')
        response = render(request,'homePage.html')
        response.set_cookie('is_superuser', user.is_superuser)
        response.set_cookie('username', user.username)
    return response

def logout(request):
    request = redirect('/login/loginPage/')
    request.cookies.clear()
    print('loginpage')
    return request