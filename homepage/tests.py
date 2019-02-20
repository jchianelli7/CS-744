from django.test import TestCase
import unittest
from homepage.models import *
# Create your tests here.

class TestModelFunc(TestCase):
    def test_addLink(self):
        # Node()相当于给其加了个self
        node=Node()
        node.type=1
        node.number='S01'
        try:
            node.addNode()
            node.save()
        except exception.addLinkError as e:
            print(e)
        except exception.addNodeError as e:
            print(e)

        node.type = 0
        node.number = 'S02'
        try:
            node.addNode()
        except exception.addLinkError as e:
            print(e)
        except exception.addNodeError as e:
            print(e)

if __name__ == '__main__':
    TestCase.main()
