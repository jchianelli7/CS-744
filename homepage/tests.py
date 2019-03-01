from django.test import TestCase
import unittest
from homepage.models import *
# Create your tests here.

class TestModelFunc(TestCase):
    # def test_addNode(self):
    #     link = {'link': [{'source': {'id': 1, 'number': 'N01', 'pattern': 'P1', 'type': 1},
    #                       'target': {'id': 2, 'number': 'N02', 'pattern': 'P1', 'type': 0}
    #                       },
    #
    #                      {'source': {'id': 3, 'number': 'N03', 'pattern': 'P1', 'type': 0},
    #                       'target': {'id': 4, 'number': 'N04', 'pattern': 'P1', 'type': 0}
    #                       }
    #                      ]
    #             }
    #
    #     response=self.client.post('/homepage/addNode/',json.dumps(link),Ccontent_type="application/json")
    #     print(response)

    def test_deleteNode(self):
        link = {'link': [{'source': {'id': 1, 'number': 'N01', 'pattern': 'P1', 'type': 1}}]}
        response = self.client.post('/homepage/deleteNode/', json.dumps(link), Ccontent_type="application/json")
        print(response)



if __name__ == '__main__':
    TestCase.main()
