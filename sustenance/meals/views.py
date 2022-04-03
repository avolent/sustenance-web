from email import message
import json
from attr import fields
from django.shortcuts import render
from django.db import IntegrityError
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.urls import reverse
from .models import User, Ingredient, Recipe, RecipeIngredient

# Returns the index page of the site.
def index(request):
    return render(request, "meals/index.html")

# Returns the meals page
def recipes_view(request):
    return render(request, "meals/recipes.html")

# Returns the ingredients page
def ingredients_view(request):
    ingredients = Ingredient.objects.order_by("name").all()
    if request.method == "POST":
        data = json.loads(request.body)
        print(data)
        if data.get("action") == "pull":
            if data.get("ingredient") == "all":
                print(ingredients)
                return JsonResponse([ingredient.serialize() for ingredient in ingredients], safe=False)
            else:
                name = data.get("ingredient")
                try:
                    ingredient = Ingredient.objects.get(name=name)
                    return JsonResponse(ingredient.serialize())
                except:
                    return JsonResponse({"message": f"Ingredient {name} does not exists!"}, status=400)
        else:
            id = data.get("id")
            name = data.get("name").lower()
            unit = data.get("unit").lower()
            if data.get("action") == "add":
                try:
                    ingredient = Ingredient(name=name, unit=unit)
                    ingredient.save()
                    return JsonResponse({"message": f"Ingredient {name} successfully added."}, status=201)
                except:
                    return JsonResponse({"message": f"Ingredient {name} already exists"}, status=400)
            elif data.get("action") == "delete":
                ingredient = Ingredient.objects.get(id=id)
                ingredient.delete()
                return JsonResponse({"message": f"Ingredient {ingredient.name} successfully deleted."}, status=201)
            elif data.get("action") == "edit":
                ingredient = Ingredient.objects.get(id=id)
                ingredient.name = name
                ingredient.unit = unit
                ingredient.save()
                return JsonResponse({"message": f"Ingredient {name} successfully edited."}, status=201)
    else:
        return render(request, "meals/ingredients.html", {
            "ingredients": ingredients
        })

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

