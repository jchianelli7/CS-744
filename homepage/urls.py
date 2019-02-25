from login import views
from homepage import views
from django.urls import include, path


urlpatterns = [
    path('homepage/',views.homepage,name="homepage"),
    path('get/', views.get, name="get"),
    path('logout/',views.logout,name="logout"),
    path('addNode/',views.addNode,name="addNode"),
    path('deleteLink/',views.deleteLink,name="deleteLink"),
]