from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Property, PropertyType, ViewingRequest, Agent, BlogPost


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "is_staff"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "password", "first_name"]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', '')
        )
        return user


class PropertyTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyType
        fields = ["id", "name"]


class PropertySerializer(serializers.ModelSerializer):
    property_type = PropertyTypeSerializer(read_only=True)
    property_type_id = serializers.PrimaryKeyRelatedField(
        queryset=PropertyType.objects.all(),
        source="property_type", write_only=True
    )
    deal_display = serializers.CharField(source="get_deal_display", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    author_name = serializers.CharField(source="author.first_name", read_only=True)

    class Meta:
        model = Property
        fields = [
            "id", "title", "address", "district",
            "property_type", "property_type_id",
            "deal", "deal_display", "status", "status_display",
            "price", "rooms", "area", "floor", "total_floors",
            "description", "image_url", "created_at", "author_name",
        ]
        read_only_fields = ["created_at", "author_name"]


class ViewingRequestSerializer(serializers.ModelSerializer):
    property_title = serializers.CharField(source="property.title", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = ViewingRequest
        fields = [
            "id", "property", "property_title",
            "name", "phone", "comment", "preferred_date",
            "status", "status_display", "created_at",
        ]
        read_only_fields = ["status", "created_at"]


class AgentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agent
        fields = ["id", "name", "role", "photo_url", "phone"]


class BlogPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost
        fields = ["id", "title", "category", "text", "created_at"]