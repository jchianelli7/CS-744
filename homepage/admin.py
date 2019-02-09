from django.contrib import admin

# Register your models here.

class MyUser(admin.ModelAdmin):
    list_display = ("id","username","email","password","is_superuser","is_active")
    ordering = ("id")

class MySecurityQuestion(admin.ModelAdmin):
    list_display = ("id","userID_id","question","answer","status")
    ordering = ("id")

