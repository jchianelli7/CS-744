from django.shortcuts import render
from django.shortcuts import redirect
from login.models import *
from homepage.models import *
import json
import simplejson
from django.http import HttpResponse

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

def addNode(request):
    if (request.COOKIES.get('username') == None or request.COOKIES.get('is_superuser') == None):
        response = redirect('/homepage/logout/')
    else:
        try:
            request = simplejson.loads(request.body)
            user = User.objects.filter(username=request.COOKIES.get('username'))[0]
            addingNode = request['node1']
            addingNode.addNode(request['node2'])
            response = HttpResponse()
        except exception.addLinkError as e:
            response = HttpResponse(json.dumps(e))
        except exception.addNodeError as e:
            response = HttpResponse(json.dumps(e))
        except simplejson.JSONDecodeError:
            response = redirect('/homepage/logout/')
        except IndexError:
            print('user name is not exist')
            response = redirect('/homepage/logout/')
        finally:
            response.set_cookie('is_superuser', user.is_superuser)
            response.set_cookie('username', user.username)
            return response
    return response


def deleteLink(request):
    if(request.COOKIES.get('username') == None or request.COOKIES.get('is_superuser') == None):
        response = redirect('/homepage/logout/')
    else:
        try:
            request = simplejson.loads(request.body)
            user = User.objects.filter(username=request.COOKIES.get('username'))[0]
            if(user.is_superuser==False):
                raise exception.deleteLinkError('the user have no permission to delete link')
            path = Path
            path.deleteLink(node1=request['node1'], node2=request['node2'])
            response=HttpResponse()
        except simplejson.JSONDecodeError:
            response = HttpResponse()
        except IndexError:
            print('user name is not exist')
            response = redirect('/homepage/logout/')
        except exception.deleteLinkError as e:
            response = HttpResponse(json.dumps(e))
        finally:
            response.set_cookie('is_superuser', user.is_superuser)
            response.set_cookie('username', user.username)
            return response
    return response

def logout(request):
    request = redirect('/login/loginPage/')
    request.cookies.clear()
    return request

