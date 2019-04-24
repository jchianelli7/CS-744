from django.contrib import admin
from homepage.models import *
# Register your models here.

class MyNode(admin.ModelAdmin):
    list_display = ("id","number","type","status","pattern","link_list")
    filter_horizontal = ("link",)

class MyMessage(admin.ModelAdmin):
    list_display = ("id","message","nodeId_id")

admin.site.register(Node,MyNode)
admin.site.register(Message,MyMessage)