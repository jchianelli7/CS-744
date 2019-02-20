from django.db import models
from homepage import exception
from django.core.exceptions import *

# Create your models here.

class Node(models.Model):

    number=models.CharField(max_length=16)
    type=models.IntegerField(default=0)# 0 is the non-connector node,1 is the connector
    status=models.BooleanField(default=True)#true is the active, false is the non-active
    pattern=models.CharField(max_length=16,default='P01')

    def addNode(self,node=None):
        if(isinstance(self,Node)==False):
            raise exception.addNodeError('need a node type argu for added node instead of '+type(self)+'')
        if(isinstance(node,Node)==False):
            if(isinstance(node,type(None))==True):
                if(Path.objects.all().count()==0 and self.type==1):
                    self.save()
                    print('add node '+self.number+' success')
                elif(Path.objects.all().count()==0 and self.type==0):
                    raise exception.addNodeError('the first node of the system should be connector')
                elif(Path.objects.all().count()>0):
                    raise exception.addNodeError('the added node should be linked in network')
            else:
                raise exception.addNodeError('need a node type argu for linked node instead of '+str(type(node))+'')
        elif(Node.objects.filter(number=self.number).exists()):
            raise exception.addNodeError('the added node has already exist')
        elif (Node.objects.filter(number=node.number).exists()==False):
            raise exception.addNodeError('the node link to adding node is not exist')
        elif(Path.objects.filter(startNodeId=node.id,endNodeId=self.id).exists() or Path.objects.filter(startNode=self,endNodeId=node).exists()):
            raise exception.addNodeError('the path has already exist')
        else:
            if (self.type == 0):
                if(Path.objects.filter(type=self.type,pattern=self.pattern).count()==6):
                    raise exception.addNodeError('the pattern'+str(self.pattern)+' has been full')
                else:
                    self.pattern = node.pattern
            elif (self.type == 1):
                if (node.type == 0):
                    raise exception.addNodeError('connector should not link with the node of other patterns')
            try:
                path = Path
                path.addLink(node1=self, node2=node)
            except exception.addLinkError as e:
                raise exception.addLinkError(e)
            else:
                self.save()
                print('add node ' + self.number + ' success')
            finally:
                return
        return

    def deleteNode(self):
        try:
            self.delete()
        except ObjectDoesNotExist:
            raise exception.deleteNodeError('the node is not exist')
        finally:
            return


class Message(models.Model):

    message=models.CharField(max_length=64)
    nodeId=models.ForeignKey('homepage.Node', on_delete=models.CASCADE)

class Path(models.Model):
    #related_name:https://www.cnblogs.com/linxiyue/p/3667418.html
    startNodeId=models.ForeignKey('homepage.Node', related_name='startNodeId',on_delete=models.CASCADE)
    endNodeId=models.ForeignKey('homepage.Node', related_name='endNodeId', on_delete=models.CASCADE)
    distance=models.FloatField(default=1)

    def showLink(self):
        link=[]
        path=Path.objects.all()
        for index in range(path.count()):
            try:
                link.append(path[index])
            except IndexError:
                break
            else:
                for i in link:
                    if (i.startNodeId_id == path[index].endNodeId_id and i.endNodeId_id == path[index].startNodeId_id):
                        link.remove(path[index])
                        break
        return link

    def addLink(self,node1,node2):
        if((isinstance(node1,Node) and isinstance(node2,Node))==False):
            raise exception.addLinkError('need two Node type as input')
        elif(Path.objects.filter(startNodeId_id=node1.id,endNodeId_id=node2.id).exist()
                or Path.objects.filter(startNodeId_id=node2.id,endNodeId_id=node1.id).exist()):
            raise exception.addLinkError('the path has been already exist')
        else:
            path=Path
            path.startNodeId_id=node1.id
            path.endNodeId_id=node2.id
            path.save()
            path.startNodeId_id=node2.id
            path.startNodeId_id = node1.id
            path.save()
        return


    def deleteLink(self,node1,node2):
        path = self.objects.filter(startNodeId_id=node1.id or node2.id, endNodeId_id=node2.id or node1.id)
        try:
            path.delete()
        except ObjectDoesNotExist:
            raise exception.deleteNodeError('the path is not exist')
        finally:
            return



