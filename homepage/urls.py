from login import views
from homepage import views
from django.urls import include, path


urlpatterns = [
    path('homepage/',views.homepage,name="homepage"),
    path('logout/',views.logout,name="logout"),
]