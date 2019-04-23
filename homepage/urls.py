from login import views
from homepage import views
from django.urls import include, path

urlpatterns = [
    path('homepage/', views.homepage, name="homepage"),
    path('get/', views.get, name="get"),
    path('logout/', views.logout, name="logout"),
    path('addNode/', views.addNode, name="addNode"),
    path('deleteNode/', views.deleteNode, name="deleteNode"),
    path('inactiveNode/', views.inactiveNode, name="inactiveNode"),
    path('activeNode/', views.activeNode, name="activeNode"),
    path('addMessage/', views.addMessage, name="addMessage"),
    path('getMessage/', views.getMessage, name="getMessage"),
    path('deletePattern/', views.deletePattern, name="deletePattern"),
    path('deleteDomain/', views.deleteDomain, name="deleteDomain"),
    path('generateTestData/', views.generateTestData, name="generateTestData"),
    path('deleteMessage/', views.deleteMessage, name="deleteMessage"),
]