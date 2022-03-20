from django.shortcuts import render
from django.db import IntegrityError
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.urls import reverse
from .models import User

# Returns the index page of the site.
def index(request):
    return render(request, "meals/index.html")

# Returns the meals page
def recipes(request):
    return render(request, "meals/recipes.html")

# Returns the ingredients page
def ingredients(request):
    return render(request, "meals/ingredients.html")

# Feed page

# Account page

# APIs

# Login api for user
def login_user(request):
    if request.method == "POST":
        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "meals/index.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return HttpResponseRedirect(reverse("index"))

# Logout api for user.
def logout_user(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

# Register api for user.
def register_user(request):
    if request.method == "POST":
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "meals/index.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(email, password)
            user.save()
        except IntegrityError:
            return render(request, "meals/index.html", {
                "message": "Email already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return HttpResponseRedirect(reverse("index"))

