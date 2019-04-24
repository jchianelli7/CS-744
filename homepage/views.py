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
                if (i.type == 2):
                    node = {'id': i.id, 'number': i.number, 'type': i.type, 'status': i.status}
                else:
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


def deletePattern(request):
    if (request.COOKIES.get('username') == None or request.COOKIES.get('is_superuser') == None):
        response = redirect('/homepage/logout/')
    else:
        try:
            userStatus = request.COOKIES.get('is_superuser')
            user = request.COOKIES.get('username')
            request = simplejson.loads(request.body)
            ids = request['link']  # array of ids

            for i in ids:
                try:
                    node = Node.objects.filter(id=i)[0]
                except IndexError:
                    # response = HttpResponse(json.dumps({'message': 'the node for deleting is not exists.'}))
                    return bad_request(message='Error: Node not found')
                except Node.nodeDeleteError as e:
                    # response = HttpResponse(json.dumps({'message': e}))
                    return bad_request(message='Error: Cant delete connector node with attached non-connectors')

            # if all nodes are found, then delete

            for i in ids:
                node = Node.objects.filter(id=i)[0]
                if(node.type == 0):
                    node.delete()
                elif (node.type == 1):
                    connector = node

            # delete the connector last
            connector.delete()

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

def deleteDomain(request):
    if (request.COOKIES.get('username') == None or request.COOKIES.get('is_superuser') == None):
        response = redirect('/homepage/logout/')
    else:
        try:
            userStatus = request.COOKIES.get('is_superuser')
            user = request.COOKIES.get('username')
            request = simplejson.loads(request.body)
            ids = request['link']  # array of ids

            for i in ids:
                try:
                    node = Node.objects.filter(id=i)[0]
                except IndexError:
                    # response = HttpResponse(json.dumps({'message': 'the node for deleting is not exists.'}))
                    return bad_request(message='Error: Node not found')
                # dont care about links here
                #except Node.nodeDeleteError as e:
                    # response = HttpResponse(json.dumps({'message': e}))
                    #return bad_request(message='Error: Cant delete connector node with attached non-connectors')

            # if all nodes are found, then delete

            connectors = []
            for i in ids:
                node = Node.objects.filter(id=i)[0]
                if(node.type == 0):
                    node.delete()
                elif (node.type == 1):
                    connectors.append(node)
                elif(node.type == 2):
                    domainNode = node

            # delete the connector last
            for i in connectors:
                node = Node.objects.filter(id=i.id)[0]
                node.delete()

            # finally delete domain
            domainNode.delete()

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
            inactiveNodes = [x for x in Node.objects.all() if (x.status == True)]
            if (len(inactiveNodes) >= 1):
                node = random.choice(inactiveNodes)
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


def addMessage(request):
    if (request.COOKIES.get('username') == None or request.COOKIES.get('is_superuser') == None):
        response = redirect('/homepage/logout/')
    else:
        request = simplejson.loads(request.body)
        Message.objects.create(message=request['message'], nodeId_id=request['id']).save()
        response = HttpResponse()
    return response


def getMessage(request):
    if (request.COOKIES.get('username') == None or request.COOKIES.get('is_superuser') == None):
        response = redirect('/homepage/logout/')
    else:
        try:
            request = simplejson.loads(request.body)
            messages = []
            for i in Message.objects.filter(nodeId_id=request['id']):
                mesg = {'id': str(i.nodeId), 'message': str(i.message)}
                messages.append(mesg)

            type(messages)

        except IndexError:
            return bad_request(message='Error: Count not retrieve messages')

        response = HttpResponse(json.dumps({'message': messages}))
        return response

def deleteMessage(request):
    if (request.COOKIES.get('username') == None or request.COOKIES.get('is_superuser') == None):
        return redirect('/homepage/logout/')
    else:
        try:
            request = simplejson.loads(request.body)
            if(Message.objects.filter(id=request['id']).exists()):
                Message.objects.filter(id=request['id']).delete()
                response=HttpResponse
            else:
                response=HttpResponse(json.dumps({'message': 'the message is not exist'}))
        except simplejson.JSONDecodeError:
            response=HttpResponse(json.dumps({'message': 'the message is not exist'}))
        finally:
            response.set_cookie('is_superuser', request.COOKIES.get('is_superuser'))
            response.set_cookie('username', request.COOKIES.get('username'))
            return response

def generateTestData(request):
    if(request.COOKIES.get('username')==None or request.COOKIES.get('is_superuser')==None):
        response = redirect('/homepage/logout/')
    else:
        userStatus = request.COOKIES.get('is_superuser')
        user = request.COOKIES.get('username')
        #clear the database
        for node in Node.objects.filter(type=2):
            node.delete()
        for node in Node.objects.filter(type=0):
            node.delete()
        for node in Node.objects.filter(type=1):
            node.delete()
        nodeInP = []
        #create D00
        domain=Node.objects.create(number='D00',type=2,pattern='P00')
        #create P00
        for num in range(0,7):
            if(num==0):
                nodeInP.append(Node.objects.create(number='N' + str(num).zfill(2), type=1, pattern='P00'))
            else:
                nodeInP.append(Node.objects.create(number='N'+str(num).zfill(2),type=0,pattern='P00'))
        nodeInP[0].addLink(domain)
        nodeInP[0].addLink(nodeInP[5])
        nodeInP[1].addLink(nodeInP[2])
        nodeInP[2].addLink(nodeInP[3])
        nodeInP[3].addLink(nodeInP[4])
        nodeInP[4].addLink(nodeInP[5])
        nodeInP[5].addLink(nodeInP[6])
        nodeInP[6].addLink(nodeInP[1])
        #createP01
        for num in range(7,13):
            if(num==7):
                nodeInP.append(Node.objects.create(number='N' + str(num).zfill(2), type=1, pattern='P01'))
            else:
                nodeInP.append(Node.objects.create(number='N'+str(num).zfill(2),type=0,pattern='P01'))
        nodeInP[7].addLink(domain)
        nodeInP[7].addLink(nodeInP[11])
        nodeInP[7].addLink(nodeInP[8])
        nodeInP[8].addLink(nodeInP[9])
        nodeInP[9].addLink(nodeInP[10])
        nodeInP[10].addLink(nodeInP[11])
        nodeInP[11].addLink(nodeInP[12])
        nodeInP[12].addLink(nodeInP[8])
        #createP02
        for num in range(13,18):
            if(num==13):
                nodeInP.append(Node.objects.create(number='N' + str(num).zfill(2), type=1, pattern='P02'))
            else:
                nodeInP.append(Node.objects.create(number='N'+str(num).zfill(2),type=0,pattern='P02'))
        nodeInP[13].addLink(domain)
        nodeInP[13].addLink(nodeInP[16])
        nodeInP[13].addLink(nodeInP[17])
        nodeInP[13].addLink(nodeInP[14])
        nodeInP[14].addLink(nodeInP[15])
        nodeInP[15].addLink(nodeInP[16])
        nodeInP[16].addLink(nodeInP[17])
        nodeInP[17].addLink(nodeInP[14])
        #createP03
        for num in range(18,22):
            if(num==18):
                nodeInP.append(Node.objects.create(number='N' + str(num).zfill(2), type=1, pattern='P03'))
            else:
                nodeInP.append(Node.objects.create(number='N'+str(num).zfill(2),type=0,pattern='P03'))
        nodeInP[18].addLink(domain)
        nodeInP[18].addLink(nodeInP[21])
        nodeInP[19].addLink(nodeInP[20])
        nodeInP[20].addLink(nodeInP[21])
        nodeInP[21].addLink(nodeInP[19])
        #correct the path between patterns in D00
        nodeInP[0].link.filter(number=nodeInP[18].number).delete()
        nodeInP[18].link.filter(number=nodeInP[0].number).delete()
        nodeInP[0].addLink(nodeInP[13])
        nodeInP[7].addLink(nodeInP[18])
        #createD01 and link two domain
        domain = Node.objects.create(number='D01', type=2, pattern='P04')
        domain.addLink(Node.objects.filter(number='D00')[0])
        #createP04
        for num in range(22,29):
            if(num==22):
                nodeInP.append(Node.objects.create(number='N' + str(num).zfill(2), type=1, pattern='P04'))
            else:
                nodeInP.append(Node.objects.create(number='N'+str(num).zfill(2),type=0,pattern='P04'))
        nodeInP[22].addLink(domain)
        nodeInP[22].addLink(nodeInP[25])
        nodeInP[22].addLink(nodeInP[26])
        nodeInP[22].addLink(nodeInP[28])
        nodeInP[23].addLink(nodeInP[24])
        nodeInP[24].addLink(nodeInP[25])
        nodeInP[25].addLink(nodeInP[26])
        nodeInP[26].addLink(nodeInP[27])
        nodeInP[27].addLink(nodeInP[28])
        nodeInP[28].addLink(nodeInP[23])
        #createP05
        nodeInP.append(Node.objects.create(number='N' + str(29).zfill(2), type=1, pattern='P05'))
        nodeInP[29].addLink(domain)
        #createP06
        for num in range(30, 33):
            if (num == 30):
                nodeInP.append(Node.objects.create(number='N' + str(num).zfill(2), type=1, pattern='P06'))
            else:
                nodeInP.append(Node.objects.create(number='N' + str(num).zfill(2), type=0, pattern='P06'))
        nodeInP[30].addLink(domain)
        nodeInP[30].addLink(nodeInP[31])
        nodeInP[31].addLink(nodeInP[32])
        nodeInP[32].addLink(nodeInP[30])

        for num in range(33, 38):
            if (num == 33):
                nodeInP.append(Node.objects.create(number='N' + str(num).zfill(2), type=1, pattern='P06'))
            else:
                nodeInP.append(Node.objects.create(number='N' + str(num).zfill(2), type=0, pattern='P06'))
        nodeInP[33].addLink(domain)
        nodeInP[33].addLink(nodeInP[34])
        nodeInP[33].addLink(nodeInP[36])
        nodeInP[34].addLink(nodeInP[35])
        nodeInP[35].addLink(nodeInP[36])
        nodeInP[36].addLink(nodeInP[37])
        nodeInP[37].addLink(nodeInP[34])
        #correct the path between the pattern
        nodeInP[30].addLink(nodeInP[22])
        nodeInP[22].addLink(nodeInP[29])
        nodeInP[29].addLink(nodeInP[33])

        # add D02
        Node.objects.create(number='D02', type='2', pattern='')
        connectivenode = [[38, 6], [45, 5], [51, 6], [58, 5]]
        i = 8
        for cNode in connectivenode:
            if i < 10:
                Node.objects.create(number='N' + str(cNode[0]), type='1', pattern='P0' + str(i))
            else:
                Node.objects.create(number='N' + str(cNode[0]), type='1', pattern='P' + str(i))
            for j in range(1, cNode[1] + 1):
                if i < 10:
                    Node.objects.create(number='N' + str(j + cNode[0]), type='0', pattern='P0' + str(i))
                else:
                    Node.objects.create(number='N' + str(j + cNode[0]), type='0', pattern='P' + str(i))
            i = i + 1
        # add D03
        Node.objects.create(number='D03', type='2', pattern='')
        connectivenode = [[64, 3], [68, 0], [69, 4], [74, 4]]
        i = 12
        for cNode in connectivenode:
            Node.objects.create(number='N' + str(cNode[0]), type='1', pattern='P' + str(i))
            for j in range(1, cNode[1] + 1):
                Node.objects.create(number='N' + str(j + cNode[0]), type='0', pattern='P' + str(i))
            i = i + 1

        # add links
        dnode2 = Node.objects.filter(number='D02')
        dnode3 = Node.objects.filter(number='D03')
        # add links between domain and connector
        for connectivenode in Node.objects.filter(type='1'):
            if connectivenode.id > dnode2[0].id and connectivenode.id < dnode3[0].id:
                dnode2[0].addLink(connectivenode)
            if connectivenode.id > dnode3[0].id:
                dnode3[0].addLink(connectivenode)

        # add nodes between connector and nonconnector
        connectednodes = [['N38', ['N40', 'N41', 'N42']], ['N45', ['N47', 'N48', 'N49']],
                          ['N51', ['N54', 'N55', 'N57']], ['N58', ['N62']],
                          ['N64', ['N65']], ['N69', ['N72']], ['N74', ['N78']]]
        for thisconnectednodes in connectednodes:
            thisconnector = Node.objects.filter(number=thisconnectednodes[0], type='1')
            for nonconnector in thisconnectednodes[1]:
                thisnonconnector = Node.objects.filter(number=nonconnector, type='0')
                thisconnector[0].addLink(thisnonconnector[0])

        # create loop
        allconnector = Node.objects.filter(type='1').exclude(pattern='P00').exclude(pattern='P01').exclude(pattern='P02').exclude(pattern='P03').exclude(pattern='P04').exclude(pattern='P05').exclude(pattern='P06').exclude(pattern='P07')
        for connectivenode in allconnector:
            loopnodes = Node.objects.filter(pattern=connectivenode.pattern, type='0')

            for i in range(0, len(loopnodes)):
                if i < len(loopnodes) - 1:
                    print(loopnodes[i].number)
                    loopnodes[i].addLink(loopnodes[i + 1])
                else:
                    loopnodes[i].addLink(loopnodes[0])

        # create links between connectors
        connectornumberset = [['N38', 'N45'], ['N51', 'N58'], ['N64', 'N68'],
                              ['N64', 'N69'], ['N68', 'N74'], ['N69', 'N74']]
        for thisconnectornumberset in connectornumberset:
            firstconnector = Node.objects.filter(number=thisconnectornumberset[0], type=1)
            secondconnector = Node.objects.filter(number=thisconnectornumberset[1], type=1)
            firstconnector[0].addLink(secondconnector[0])

        # connect donamin nodes
        nodeD00 = Node.objects.filter(number='D00', type=2)[0]
        nodeD01 = Node.objects.filter(number='D01', type=2)[0]
        nodeD02 = Node.objects.filter(number='D02', type=2)[0]
        nodeD03 = Node.objects.filter(number='D03', type=2)[0]
        nodeD00.addLink(nodeD01)
        nodeD00.addLink(nodeD03)
        nodeD01.addLink(nodeD02)
        nodeD02.addLink(nodeD03)
        #-------------------------------------------------------------------------------------------------------
        # -------------------------------------------------------------------------------------------------------
        #create the all message for testing
        #clear the 'Message' table
        for msg in Message.objects.all():
            msg.delete()
        Message.objects.create(nodeId_id=Node.objects.filter(number='N32')[0].id,message="this is a test message.")
        Message.objects.create(nodeId_id=Node.objects.filter(number='N12')[0].id, message="Can we connect our patterns?")
        Message.objects.create(nodeId_id=Node.objects.filter(number='N70')[0].id, message="Routing through the domains.")
        Message.objects.create(nodeId_id=Node.objects.filter(number='N53')[0].id, message="Hi Neighbor!")
        Message.objects.create(nodeId_id=Node.objects.filter(number='N33')[0].id, message="Complicated routing!")
        Message.objects.create(nodeId_id=Node.objects.filter(number='N76')[0].id, message="Informal descriptions are sent to you!")
        Message.objects.create(nodeId_id=Node.objects.filter(number='N57')[0].id, message="Any message from the other domains?")
        Message.objects.create(nodeId_id=Node.objects.filter(number='N68')[0].id, message="What is the syllabus for the final exam?")
        Message.objects.create(nodeId_id=Node.objects.filter(number='N70')[0].id, message="Incorrect attachment in the mail.")
        Message.objects.create(nodeId_id=Node.objects.filter(number='N49')[0].id, message="Please distribute this to our pattern members.")
        Message.objects.create(nodeId_id=Node.objects.filter(number='N75')[0].id, message="Is this the longest path? Please confirm.")
        Message.objects.create(nodeId_id=Node.objects.filter(number='N33')[0].id, message="Do we belong to the same domain? If not, can we move?")
        Message.objects.create(nodeId_id=Node.objects.filter(number='N29')[0].id, message="How do we make our communication quicker?")
        Message.objects.create(nodeId_id=Node.objects.filter(number='N31')[0].id, message="A list of items are on the way to you!")
        Message.objects.create(nodeId_id=Node.objects.filter(number='N70')[0].id, message="I am leaving, good bye!")

        response=redirect('/homepage/homepage/')
        response.set_cookie('is_superuser', userStatus)
        response.set_cookie('username', user)

    return response

