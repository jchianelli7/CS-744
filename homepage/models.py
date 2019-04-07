from django.db import models
from django.core.exceptions import *
import json
import simplejson


# Create your models here.

class Node(models.Model):
    number = models.CharField(max_length=16)
    type = models.IntegerField(default=0)  # 0 is the non-connector node,1 is the connector
    status = models.BooleanField(default=True)  # true is the active, false is the non-active
    pattern = models.CharField(max_length=16, default='P01')
    link = models.ManyToManyField('Node')

    def link_list(self):
        return ','.join([i.number for i in self.node_set.all()])

    def save(self, *args, **kwargs):
        if (Node.objects.filter(id=self.id).exists() == False):
            if (Node.objects.filter(pattern=self.pattern and self.type != 2).count() == 7):
                raise Node.nodeNumberError('7 node have been existed in pattern')

            elif (Node.objects.filter(pattern=self.pattern).count() == 0 and self.type == 0):
                raise Node.nodeInitialError('inital node of this pattern should be connector')

            elif (Node.objects.filter(pattern=self.pattern).exists() and self.type == 1):
                raise Node.nodeNumberError('1 connector have been existed in pattern')

        return super(Node, self).save(*args, **kwargs)

    def addLink(self, node):
        if (isinstance(node, Node) == False):
            raise Node.nodeError('the type of argu for addLink should be Node instead of ' + str(type(node)) + '.')

        elif (Node.objects.filter(id=node.id).exists() == False):
            raise Node.nodeNotExistError('the linked node did not exist')

        elif (Node.objects.filter(id=self.id).exists() == False):
            raise Node.nodeNotExistError('the source node did not exist')

        elif (self.link.filter(type=0).count() == 2 or node.link.filter(type=0).count() == 2):
            raise Node.nodeLinkError('the node has two links')

        elif (self.type == 1 and self.link.count() == 0 and node.type == 0 and Node.objects.filter(id != self.id,
                                                                                                   type=1).exists()):
            node = Node.objects.filter(id != self.id, type=1)[0]
            raise Node.nodeInitialError(
                'the inital connector of new pattren should linked with connector instead of normal node')
        else:
            self.link.add(node)
            node.link.add(self)
        return

    def delete(self, using=None, keep_parents=False):
        if (self.type == 1 and self.link.count() > 0):  # What if the connector is linked to another connector?
            for x in self.link.all():
                # update to check if connected to domain node
                if (x.type == 0):
                    raise Node.nodeDeleteError('you can not delete the connector when pattern have other normal node')

        for x in self.link.all():
            for y in self.link.all():
                if (x.id != y.id):
                    x.link.add(y)
                    y.link.add(x)
        return super(Node, self).delete()

    # def deleteLink(self,node):
    #     viewedNode=[]
    #     if(isinstance(node,Node)==False):
    #         raise TypeError('need Node type as input instead of '+str(type(node)))
    #     else:
    #         for i in Node.objects.all():
    #             list=i.link.exclude(number__in=viewedNode)
    #             for x in list:

    def __unicode__(self):
        return 'No. ' + self.number

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

    class nodeDeleteError(nodeError):
        pass


class Message(models.Model):
    message = models.CharField(max_length=64)
    nodeId = models.ForeignKey('homepage.Node', on_delete=models.CASCADE)
