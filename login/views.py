from django.shortcuts import render
from django.shortcuts import redirect
from login.models import *
import json
import  simplejson
from django.http import HttpResponse
import  random
# Create your views here.

def loginPage(request):
    return render(request,'welcomePage.html')

def login(request):
    try:
        request = simplejson.loads(request.body)
        user= User.objects.filter(username=request['username'])[0]
    except IndexError:
        print('username is incorrect')
        message={'message':'username is incorrect'}
        request = HttpResponse(json.dumps(message))
    except simplejson.JSONDecodeError:
        print('json is empty')
        request = redirect('/homepage/logout/')
    else:
        if (user.check_password(request['password']) == False):
            print('password is incorrect')
            message = {'message': 'password is incorrect'}
            request = HttpResponse(json.dumps(message))
        elif (user.is_active == False):
            print('the account has been locked')
            message = {'message': 'the account has been locked'}
            request = HttpResponse(json.dumps(message))
        else:
            print('enter the user confirm')
            request = HttpResponse()
            request.set_cookie('is_superuser', user.is_superuser)
            request.set_cookie('username', user.username)
    finally:
        return request

def userConfirmPage(request):
    if(request.COOKIES.get('username')==None or request.COOKIES.get('is_superuser')==None):
        request=redirect('/homepage/logout/')
        return request
    else:
        user=User.objects.filter(username=request.COOKIES.get('username'))[0]
        if(user.is_active==False):
            print('the account has been locked')
            response = redirect('/homepage/logout/')
        else:
            try:
                sqList = securityQuestion.objects.filter(userID=user.id, status=True)
                question = sqList[random.randint(0, sqList.count()-1)]
            except ValueError:#error from arg in random.randit()
                print('no security question in db, first time to login')
                response=render(request, 'securityQSetting.html')
            else:
                print('have the question for user')
                print(question)
                response=render(request, 'securityQAnswer.html')
                response.set_cookie('question', question.question)
            finally:
                response.set_cookie('is_superuser', user.is_superuser)
                response.set_cookie('username', user.username)
        return response


def confirmCreatingSq(request):
    if(request.COOKIES.get('username') == None or request.COOKIES.get('is_superuser') == None):
        request = redirect('/homepage/logout/')
    else:
        user = User.objects.filter(username=request.COOKIES.get('username'))[0]
        sqList=[]
        sqList.append(request.POST.get('question1'))
        sqList.append(request.POST.get('question2'))
        sqList.append(request.POST.get('question3'))
        for index in range(0,2):#from 0 to 2
            for i in range(index+1,3):#from index+1 to 2
                if(str(sqList[index]).lower()==str(sqList[i]).lower()):
                    print('question are same')
                    request = redirect('/login/userConfirmPage/')
                    request.set_cookie('is_superuser', user.is_superuser)
                    request.set_cookie('username', user.username)
                    return request
        question=securityQuestion.objects.create(question=request.POST.get('question1'),
                                                 answer=request.POST.get('answer1'),userID_id=user.id)
        question.save()

        question = securityQuestion.objects.create(question=request.POST.get('question2'),
                                                   answer=request.POST.get('answer2'), userID_id=user.id)
        question.save()
        question = securityQuestion.objects.create(question=request.POST.get('question3'),
                                                   answer=request.POST.get('answer3'), userID_id=user.id)
        question.save()
        print('security question has been created successfully')
        request=redirect('/homepage/homepage/')
        user.activeUser()
        request.set_cookie('is_superuser', user.is_superuser)
        request.set_cookie('username', user.username)
    return request

def confirmAnswer(request):
    if (request.COOKIES.get('username') == None or request.COOKIES.get('is_superuser') == None):
        request = redirect('/homepage/logout/')
    else:
        user = User.objects.filter(username=request.COOKIES.get('username'))[0]
        try:
            question = securityQuestion.objects.filter(userID=user.id,question=request.COOKIES.get('question'))[0]
        except IndexError:
            print('no corresponding question in it')
            request = redirect('/login/userConfirmPage/')
        else:
            if (question.answer.lower() == str(request.POST.get('answer')).lower()):
                user.activeUser()
                print('confirm success')
                request=redirect('/homepage/homepage/')
            else:
                question.wrongAnswer()
                print('the confirm failed')
                request=redirect('/login/userConfirmPage/')
                print(request)
        finally:
            request.set_cookie('is_superuser', user.is_superuser)
            request.set_cookie('username', user.username)
    return request

