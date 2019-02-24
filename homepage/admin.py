from django.contrib import admin
from homepage.models import *
# Register your models here.

class MyNode(admin.ModelAdmin):
    list_display = ("id","number","type","status","pattern","link_list")
    filter_horizontal = ("link",)

admin.site.register(Node,MyNode)