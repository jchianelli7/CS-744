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
        nodeList=[]
        for i in Node.objects.all():
            for target in Node.link.all():
                dict={'source':{'id':i.id,'number':i.number,'type':i.type,'status':i.status},'target':{'id':target.id,'number':target.number,'type':target.type,'status':target.status}}
                nodeList.append(dict)
        link={'link':nodeList}
        response = HttpResponse(json.dump(link))
        response.render(request, 'homePage.html')
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
            nodeList = request['link']
            for i in Node.objects.all():
                i.link.clear
            for i in nodeList:
                try:
                    source=Node.objects.filter(number=i['source']['number'])[0]
                    if (i['target'] != None):
                        target=Node.objects.filter(number=i['target']['number'])[0]
                except IndexError:
                    source=Node.objects.create(id=i['source']['id'],number=i['source']['number'],type=i['source']['type'])
                    target=Node.objects.create(id=i['target']['id'],number=i['target']['number'],type=i['target']['type'])
                finally:
                    source.link.add(target)
                    target.link.add(source)
                    print('sueecss for all')
            response = HttpResponse()
        except IndexError:
            print('user name is not exist')
            response = redirect('/homepage/logout/')
        except simplejson.JSONDecodeError:
            response = HttpResponse()
        finally:
            response.set_cookie('is_superuser', user.is_superuser)
            response.set_cookie('username', user.username)
    return response


def deleteLink(request):
    # if(request.COOKIES.get('username') == None or request.COOKIES.get('is_superuser') == None):
    #     response = redirect('/homepage/logout/')
    #else:
        try:
            request = simplejson.loads(request.body)
            #user = User.objects.filter(username=request.COOKIES.get('username'))[0]
            #if(user.is_superuser==False):
                #raise Path.deleteLinkError('the user have no permission to delete link')
            path = Path
            path.deleteLink(node1=request['node1'], node2=request['node2'])
            response=HttpResponse()
        except simplejson.JSONDecodeError:
            response = HttpResponse()
        except IndexError:
            print('user name is not exist')
            response = redirect('/homepage/logout/')
        except Path.deleteLinkError as e:
            response = HttpResponse(json.dumps(e))
        finally:
            #response.set_cookie('is_superuser', user.is_superuser)
            #response.set_cookie('username', user.username)

            return response

def logout(request):
    request = redirect('/login/loginPage/')
    request.cookies.clear()
    return request

