from django.db import models
from django.core.exceptions import *
import json
import simplejson

# Create your models here.

class Node(models.Model):

    number=models.CharField(max_length=16)
    type=models.IntegerField(default=0)# 0 is the non-connector node,1 is the connector
    status=models.BooleanField(default=True)#true is the active, false is the non-active
    pattern=models.CharField(max_length=16,default='P01')
    link=models.ManyToManyField('Node')

    def link_list(self):
        return ','.join([i.number for i in self.node_set.all()])

    def save(self, *args, **kwargs):
        if (Node.objects.filter(id=self.id).exists() == False):
            if (Node.objects.filter(pattern=self.pattern).count() == 7):
                raise Node.nodeNumberError('7 node have been existed in pattern')

            elif (Node.objects.filter(pattern=self.pattern).count() == 0 and self.type == 0):
                raise Node.nodeInitialError('inital node of this pattern should be connector')

            elif (Node.objects.filter(pattern=self.pattern).exists() and self.type == 1):
                raise Node.nodeNumberError('1 connector have been existed in pattern')

        return super(Node, self).save(*args, **kwargs)


    def addLink(self,node):
        if(isinstance(node,Node)==False):
            raise Node.nodeError('the type of argu for addLink should be Node instead of '+str(type(node))+'.')

        elif(Node.objects.filter(id=node.id).exists()==False):
            raise Node.nodeNotExistError('the linked node did not exist')

        elif(Node.objects.filter(id=self.id).exists()==False):
            raise Node.nodeNotExistError('the source node did not exist')

        elif(self.link.filter(type=0).count()==3 or node.link.filter(type=0).count()==3):
            raise Node.nodeLinkError('the node has three links')

        elif(self.type==1 and self.link.count()==0 and node.type==0 and Node.objects.filter(id!=self.id,type=1).exists()):
            node=Node.objects.filter(id!=self.id,type=1)[0]
            print(node.number)
            raise Node.nodeInitialError('the inital connector of new pattren should linked with connector instead of normal node')
        else:
            self.link.add(node)
            node.link.add(self)
        return

    def deleteLink(self,node):
        if(isinstance(node,Node)==False):
            raise Node.nodeError('the type of argu for deletLink should be Node instead of '+type(node)+'.')
        if(Path.objects.filter(startNodeId=self,endNodeId=node).exists()==False):
            raise Node.nodeError('the link did not exists')
        elif(self.type==1 and node.type==1 and self.link.count()>0):
            raise Node.nodeError('this pattern has more than one node, cannot delete connector.')
        else:
            self.link.remove(node)
            node.link.remove(self)
        return

    def __unicode__(self):
        return 'No. '+self.number

    class nodeError(Exception):
        def __init__(self, ErrorInfo):
            super().__init__(self, ErrorInfo)  # 初始化父类
            self.errorinfo = ErrorInfo
        def __str__(self):
            return self.errorinfo

    class nodeNotExistError(nodeError):
        pass

    class nodeLinkError(nodeError):
        pass

    class nodeNumberError(nodeError):
        pass

    class nodeInitialError(nodeError):
        pass

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

    def deleteLink(self,node1,node2):
        path = self.objects.filter(startNodeId_id=node1.id or node2.id, endNodeId_id=node2.id or node1.id)
        try:
            path.delete()
        except ObjectDoesNotExist:
            raise Node.nodeError('the path is not exist')
        finally:
            return

    class linkError(Exception):
        def __init__(self, ErrorInfo):
            super().__init__(self, ErrorInfo)  # 初始化父类
            self.errorinfo = ErrorInfo

        def __str__(self):
            return self.errorinfo



