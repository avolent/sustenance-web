from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("recipes", views.recipes, name="recipes"),
    path("ingredients", views.ingredients, name="ingredients"),
    # APIs
    path("login_user", views.login_user, name="login_user"),
    path("logout_user", views.logout_user, name="logout_user"),
    path("register_user", views.register_user, name="register_user"),
]