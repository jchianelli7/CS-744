from django.shortcuts import render
from django.shortcuts import redirect
from login.models import *
from homepage.models import *
import json
import simplejson
from django.http import HttpResponse
from django.template.loader import render_to_string


# Create your views here.

def homepage(request):
    if (request.COOKIES.get('username') == None or request.COOKIES.get('is_superuser') == None):
        respongitse = redirect('/homepage/logout/')
    else:
        user = User
        user.username = request.COOKIES.get('username')
        user.is_superuser = request.COOKIES.get('is_superuser')
        nodeList = []
        for i in Node.objects.all():
            for target in i.link.all():
                dict = {'source': {'id': i.id, 'number': i.number, 'type': i.type, 'status': i.status},
                        'target': {'id': target.id, 'number': target.number, 'type': target.type,
                                   'status': target.status}}
                nodeList.append(dict)
        response = render(request, 'homePage.html', {'link': json.dumps(nodeList)})
        response.set_cookie('is_superuser', user.is_superuser)
        response.set_cookie('username', user.username)
    return response


def get(request):
    if (request.COOKIES.get('username') == None or request.COOKIES.get('is_superuser') == None):
        respongitse = redirect('/homepage/logout/')
    else:
        user = User
        user.username = request.COOKIES.get('username')
        user.is_superuser = request.COOKIES.get('is_superuser')
        linkList = []
        nodeList = []
        if (Node.objects.count() > 0):
            for i in Node.objects.all():
                node = {'id': i.id, 'number': i.number, 'type': i.type, 'status': i.status, 'pattern': i.pattern}
                nodeList.append(node)
                for target in i.link.all():
                    dict = {'source': {'id': i.id, 'number': i.number, 'type': i.type, 'status': i.status,
                                       'pattern': i.pattern},
                            'target': {'id': target.id, 'number': target.number, 'type': target.type,
                                       'status': target.status, 'pattern': target.pattern}}
                    linkList.append(dict)

                resp = {'node': nodeList, 'link': linkList}
                response = HttpResponse(json.dumps(resp))
                response.set_cookie('is_superuser', user.is_superuser)
                response.set_cookie('username', user.username)
        else:
            response = HttpResponse('')

    return response


def addNode(request):
    if (request.COOKIES.get('username') == None or request.COOKIES.get('is_superuser') == None):
        response = redirect('/homepage/logout/')
    else:
        try:
            userStatus = request.COOKIES.get('is_superuser')
            user = request.COOKIES.get('username')
            request = simplejson.loads(request.body)
            # user = User.objects.filter(username=request.COOKIES.get('username'))[0]
            nodeList = request['link']
            for i in Node.objects.all():
                i.link.clear()
                i.link.remove()
            for i in nodeList:
                try:
                    source = Node.objects.filter(number=i['source']['number'])[0]
                except IndexError:
                    source = Node.objects.create(id=i['source']['id'], number=i['source']['number'],
                                                 type=i['source']['type'])
                try:
                    target = Node.objects.filter(number=i['target']['number'])[0]
                except IndexError:
                    target = Node.objects.create(id=i['target']['id'], number=i['target']['number'],
                                                 type=i['target']['type'])
                finally:
                    # if (i['target']):
                    target.link.add(source)
                    source.link.add(target)

                    print('sueecss for all')
            response = HttpResponse()
        except IndexError:
            print('user name is not exist')
            response = redirect('/homepage/logout/')
        except simplejson.JSONDecodeError:
            response = HttpResponse()
        finally:
            response.set_cookie('is_superuser', userStatus)
            response.set_cookie('username', user)
    return response


def deleteLink(request):
    # if(request.COOKIES.get('username') == None or request.COOKIES.get('is_superuser') == None):
    #     response = redirect('/homepage/logout/')
    # else:
    try:
        request = simplejson.loads(request.body)
        # user = User.objects.filter(username=request.COOKIES.get('username'))[0]
        # if(user.is_superuser==False):
        # raise Path.deleteLinkError('the user have no permission to delete link')
        path = Path
        path.deleteLink(path, node1=request['node1'], node2=request['node2'])
        response = HttpResponse()
    except simplejson.JSONDecodeError:
        response = HttpResponse()
    except IndexError:
        print('user name is not exist')
        response = redirect('/homepage/logout/')
    except Path.deleteLinkError as e:
        response = HttpResponse(json.dumps(e))
    finally:
        # response.set_cookie('is_superuser', user.is_superuser)
        # response.set_cookie('username', user.username)

        return response


def logout(request):
    request = redirect('/login/loginPage/')
    request.cookies.clear()
    return request
