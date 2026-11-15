from django.contrib import admin
from .models import Property, PropertyType, ViewingRequest, Agent, BlogPost


@admin.register(PropertyType)
class PropertyTypeAdmin(admin.ModelAdmin):
    list_display = ("id", "name")


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "district", "property_type", "deal", "price", "status", "author")
    list_filter = ("deal", "status", "property_type", "district")
    search_fields = ("title", "address")


@admin.register(ViewingRequest)
class ViewingRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "phone", "property", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("name", "phone")


@admin.register(Agent)
class AgentAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "role", "phone")


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "category", "created_at")