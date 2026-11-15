from django.urls import path
from . import views

urlpatterns = [
    path("property-types/", views.PropertyTypeListView.as_view()),
    path("properties/", views.PropertyListView.as_view()),
    path("properties/<int:pk>/", views.PropertyDetailView.as_view()),
    path("requests/", views.ViewingRequestListView.as_view()),
    path("requests/<int:pk>/", views.ViewingRequestDetailView.as_view()),
    path("agents/", views.AgentListView.as_view()),
    path("blog/", views.BlogPostListView.as_view()),

    path("login/", views.LoginView.as_view()),
    path("logout/", views.LogoutView.as_view()),
    path("register/", views.RegisterView.as_view()),
    path("current-user/", views.CurrentUserView.as_view()),
]