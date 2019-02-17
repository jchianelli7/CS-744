from django.db import models
from homepage import exception
from django.core.exceptions import *

# Create your models here.

class Node(models.Model):

    number=models.CharField(max_length=16)
    type=models.IntegerField(default=0)# 0 is the non-connector node,1 is the connector
    status=models.BooleanField(default=True)#true is the active, false is the non-active
    connector=models.ForeignKey('homepage.Node',on_delete=models.CASCADE)

    def addNode(self,node):
        if(isinstance(self,Node)==False):
            raise exception.addNodeError('need a node type parameter')
        elif(isinstance(node,Node)==False):
            raise exception.addNodeError('the path did not link the node just added')
        elif(Node.objects.filter(self).exist()):
            raise exception.addNodeError('the adding node has already exist')
        elif (Node.objects.filter(node).exist()==False):
            raise exception.addNodeError('the node link to adding node is not exist')
        elif(Path.objects.filter(startNodeId=node.id,endNodeId=self.id).exist() or Path.objects.filter(startNode=self,endNodeId=node).exist()):
            raise exception.addNodeError('the path has already exist')
        if (self.type == 0):
            self.connector = node.connector
        elif (self.type == 1):
            if (node.type == 0):
                raise exception.addNodeError('connector should not link with the node of other patterns')
            else:
                self.connector = self
        try:
            path = Path
            path.addLink(node1=self, node2=node)
        except exception.addLinkError as e:
            raise exception.addLinkError(e)
        else:
            self.save()
        finally:
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



