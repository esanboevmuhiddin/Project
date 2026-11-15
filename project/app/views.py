from django.contrib.auth import authenticate, login, logout
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Property, PropertyType, ViewingRequest, Agent, BlogPost
from .serializers import (
    PropertySerializer, PropertyTypeSerializer,
    UserSerializer, ViewingRequestSerializer,
    RegisterSerializer, AgentSerializer, BlogPostSerializer,
)


class PropertyTypeListView(APIView):
    def get(self, request):
        types = PropertyType.objects.all()
        return Response({"data": PropertyTypeSerializer(types, many=True).data})


class PropertyListView(APIView):
    def get(self, request):
        properties = Property.objects.select_related("property_type", "author").all()

        type_id = request.query_params.get("type")
        deal = request.query_params.get("deal")
        location = request.query_params.get("location")
        author_id = request.query_params.get("author")

        if type_id:
            properties = properties.filter(property_type_id=type_id)
        if deal:
            properties = properties.filter(deal=deal)
        if location:
            properties = properties.filter(
                Q(district__icontains=location) | Q(address__icontains=location)
            )
        if author_id:
            properties = properties.filter(author_id=author_id)

        serializer = PropertySerializer(properties, many=True)
        return Response({"data": serializer.data, "count": properties.count()})

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({"status": "error", "message": "Войдите, чтобы добавить объект"}, status=401)

        serializer = PropertySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user)
            return Response({"data": serializer.data}, status=201)
        return Response({"status": "error", "errors": serializer.errors}, status=400)


class PropertyDetailView(APIView):
    def get(self, request, pk):
        prop = get_object_or_404(Property, pk=pk)
        return Response({"data": PropertySerializer(prop).data})

    def patch(self, request, pk):
        prop = get_object_or_404(Property, pk=pk)
        serializer = PropertySerializer(prop, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"data": serializer.data})
        return Response({"status": "error", "errors": serializer.errors}, status=400)

    def delete(self, request, pk):
        get_object_or_404(Property, pk=pk).delete()
        return Response({"status": "deleted"})


class ViewingRequestListView(APIView):
    def get(self, request):
        if not request.user.is_staff:
            return Response({"status": "error", "message": "Доступ только для сотрудников"}, status=403)
        requests_qs = ViewingRequest.objects.select_related("property").all()
        return Response({"data": ViewingRequestSerializer(requests_qs, many=True).data})

    def post(self, request):
        serializer = ViewingRequestSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"data": serializer.data}, status=201)
        return Response({"status": "error", "errors": serializer.errors}, status=400)


class ViewingRequestDetailView(APIView):
    def patch(self, request, pk):
        req = get_object_or_404(ViewingRequest, pk=pk)
        serializer = ViewingRequestSerializer(req, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"data": serializer.data})
        return Response({"status": "error", "errors": serializer.errors}, status=400)


class AgentListView(APIView):
    def get(self, request):
        agents = Agent.objects.all()
        return Response({"data": AgentSerializer(agents, many=True).data})


class BlogPostListView(APIView):
    def get(self, request):
        posts = BlogPost.objects.all()
        return Response({"data": BlogPostSerializer(posts, many=True).data})


@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            login(request, user)
            return Response({"status": "ok", "user": UserSerializer(user).data}, status=201)
        return Response({"status": "error", "errors": serializer.errors}, status=400)


@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)
        if user is not None:
            login(request, user)
            return Response({"status": "ok", "user": UserSerializer(user).data})
        return Response({"status": "error", "message": "Неверный логин или пароль"}, status=400)


@method_decorator(csrf_exempt, name='dispatch')
class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({"status": "ok"})


class CurrentUserView(APIView):
    def get(self, request):
        if request.user.is_authenticated:
            return Response({"authenticated": True, "user": UserSerializer(request.user).data})
        return Response({"authenticated": False, "user": None})