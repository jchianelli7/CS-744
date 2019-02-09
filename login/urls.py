from login import views
from django.urls import include, path


urlpatterns = [
    path('loginPage/',views.loginPage,name="loginPage"),
    path('login/',views.login,name="login"),
    path('userConfirmPage/',views.userConfirmPage,name="userConfirmPage"),
    path('confirmAnswer/',views.confirmAnswer,name="confirmAnswer"),
    path('confirmCreatingSq/',views.confirmCreatingSq,name='confirmCreatingSq'),
]