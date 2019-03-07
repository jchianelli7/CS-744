from django.shortcuts import render
from django.shortcuts import redirect
from login.models import *
from homepage.models import *
import json
import simplejson
from django.http import HttpResponse
import random
from django.template.loader import render_to_string


# Create your views here.

def homepage(request):
    if (request.COOKIES.get('username') == None or request.COOKIES.get('is_superuser') == None):
        response = redirect('/homepage/logout/')
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
        response = redirect('/homepage/logout/')
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
            nodeList = request['link']
            for i in Node.objects.all():
                i.link.clear()
                i.link.remove()
            for i in nodeList:
                try:
                    source = Node.objects.filter(number=i['source']['number'])[0]
                except IndexError:
                    source = Node.objects.create(id=i['source']['id'], number=i['source']['number'],
                                                 type=i['source']['type'], pattern=i['source']['pattern'])
                try:
                    target = Node.objects.filter(number=i['target']['number'])[0]
                except IndexError:
                    target = Node.objects.create(id=i['target']['id'], number=i['target']['number'],
                                                 type=i['target']['type'], pattern=i['source']['pattern'])
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


# delete should be test
def deleteNode(request):
    if (request.COOKIES.get('username') == None or request.COOKIES.get('is_superuser') == None):
        response = redirect('/homepage/logout/')
    else:
        try:
            userStatus = request.COOKIES.get('is_superuser')
            user = request.COOKIES.get('username')
            request = simplejson.loads(request.body)
            node = request['link']

            for i in node:
                try:
                    node = Node.objects.filter(id=i['source']['id'])[0]
                    node.delete()
                except IndexError:
                    # response = HttpResponse(json.dumps({'message': 'the node for deleting is not exists.'}))
                    return bad_request(message='Error: Node not found')
                except Node.nodeDeleteError as e:
                    # response = HttpResponse(json.dumps({'message': e}))
                    return bad_request(message='Error: Cant delete connector node with attached non-connectors')
        except simplejson.JSONDecodeError:
            pass
        else:
            pass
        finally:
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
            response.set_cookie('is_superuser', userStatus)
            response.set_cookie('username', user)
    return response


def inactiveNode(request):
    if (request.COOKIES.get('username') == None or request.COOKIES.get('is_superuser') == None):
        response = redirect('/homepage/logout/')
    else:
        try:
            # node = Node.objects.filter(id=random.randint(1, Node.objects.count()))[0] #ID might not be within count
            # if (random.randint(0, 2) == 1 and node.status == True):
            #     if (random.randint(0, 2) == 1 and node.status == True):
            #         node.status = False
            #         node.save()
            #     else:
            #         raise Node.nodeError
            for i in Node.objects.all():
                i.status = True
                i.save()

            nonconnectors = [x for x in Node.objects.all() if (x.type == 0 and x.status == True)]
            node = random.choice(nonconnectors)
            node.status = False
            node.save()

            nodeList = []
            for i in Node.objects.all():
                node = {'id': i.id, 'number': i.number, 'type': i.type, 'status': i.status, 'pattern': i.pattern}
                nodeList.append(node)
        except IndexError and Node.nodeError:
            response = HttpResponse()
        else:
            # list = [{'id': node.id, 'number': node.number, 'type': node.type, 'status': node.status,
            #          'pattern': node.pattern}]
            response = HttpResponse(json.dumps({'node': nodeList}))
        finally:
            pass
    return response


def activeNode(request):
    if (request.COOKIES.get('username') == None or request.COOKIES.get('is_superuser') == None):
        response = redirect('/homepage/logout/')
    else:
        try:
            request = simplejson.loads(request.body)
            # nodeList = request['link']
            # for i in nodeList:
            #     node = Node.objects.filter(number=i['source']['number'])[0]
            #     node.status = True
            #     node.save()
            node = request['node'][0]
            node = Node.objects.filter(id=node['id'])[0]
            if (node.status == False):
                node.status = True
                node.save()
            else:
                return bad_request(message='Error: Cannot activate inactive node')
            # Return list of all nodes
            nodeList = []
            for i in Node.objects.all():
                node = {'id': i.id, 'number': i.number, 'type': i.type, 'status': i.status, 'pattern': i.pattern}
                nodeList.append(node)

        except IndexError:
            return bad_request(message='Error: Node does not exist')
            # response = HttpResponse(json.dumps({'message': 'node did not exists'}))
        except simplejson.JSONDecodeError:
            response = HttpResponse()
        else:
            # list = [{'id': node.id, 'number': node.number, 'type': node.type, 'status': node.status,
            #          'pattern': node.pattern}]
            response = HttpResponse(json.dumps({'node': nodeList}))
    return response


def deleteLink(request):
    pass


def logout(request):
    request = redirect('/login/loginPage/')
    request.cookies.clear()
    return request


def bad_request(message):
    response = HttpResponse(json.dumps({'message': message}),
                            content_type='application/json')
    response.status_code = 400
    return response
