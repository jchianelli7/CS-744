from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.
class User(AbstractUser):

    first_name = models.deletion
    last_name = models.deletion


    def activeUser(self):
        for sq in securityQuestion.objects.filter(userID_id=self.id):
            sq.status=True
            sq.save(update_fields=['status'])
        self.is_active=True
        self.save(update_fields=['is_active'])

    def __str__(self):
        return 'username:'+self.username+' id:'+str(self.id)

class securityQuestion(models.Model):

    question=models.CharField(max_length=64)
    answer=models.CharField(max_length=64)
    status=models.BooleanField(default=True)
    userID=models.ForeignKey('login.User', on_delete=models.CASCADE)

    def __str__(self):
        return 'question:'+self.question+' answer:'+self.answer

    def wrongAnswer(self):
        self.status=False
        self.save(update_fields=['status'])
        print(securityQuestion.objects.filter(userID_id=self.userID,status=False).count())
        if(securityQuestion.objects.filter(userID_id=self.userID,status=False).count()==3):
            #if use self.userID the id would get a User class data
            user=User.objects.filter(id=self.userID_id)[0]
            user.is_active=False
            user.save(update_fields=['is_active'])