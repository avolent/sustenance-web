from email import message
import json
import random
from attr import fields
from django.shortcuts import render
from django.db import IntegrityError
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.urls import reverse
from .models import User, Ingredient, Recipe, RecipeIngredient, History

# Returns the index page of the site.
def index(request):
    if request.method == "POST":
        recipes = Recipe.objects.order_by("name").filter(created_by=request.user)
        print("Generating")
        data = json.loads(request.body)
        count = int(data.get("count"))
        if len(recipes) < count:
            return JsonResponse({"message": "Not enough recipes to generate!"}, status=400)
        recipe_selection = random.sample(list(recipes), count)
        return JsonResponse([recipe.serialize() for recipe in recipe_selection], safe=False, status=200)
    return render(request, "meals/index.html")

def history(request):
    if request.method == "POST":
        data = json.loads(request.body)
        meals = data.get("meals")
        shoppinglist = data.get("shoppinglist")
        action = data.get("action")
        print(shoppinglist)
        history = History(meals=meals, shopping_list=shoppinglist, generated_by=request.user)
        history.save()
        return JsonResponse({"message": "Shopping List generated and added to history!"}, status=200)
    else:
        history = History.objects.order_by("-date_generated").filter(generated_by=request.user)
        for x in history:
            print(x.meals)
        return render(request, "meals/history.html", {
            "history": history,
        })


# Returns the meals page
def recipes_view(request):
    recipes = Recipe.objects.order_by("name").filter(created_by=request.user)
    if request.method == "POST":
        data = json.loads(request.body)
        print(data)
        if data.get("action") == "pull":
            if data.get("recipe") == "all":
                print(recipes)
                return JsonResponse([recipe.serialize() for recipe in recipes], safe=False, status=200)
            else:
                name = data.get("recipe")
                try:
                    recipe = Recipe.objects.get(name=name)
                    print(recipe.ingredients.all())
                    return JsonResponse(recipe.serialize(), status=200)
                except Exception as error:
                    return JsonResponse({"message": error}, status=400)
        else:
            id = data.get("id")
            name = data.get("name").capitalize()
            if not name:
                return JsonResponse({"message": f"Recipe name can't be blank"}, status=400)
            if data.get("action") == "add":
                link = data.get("link").lower()
                try:
                    print(name)
                    recipe = Recipe(name=name, link=link, created_by=request.user)
                    recipe.save()
                    return JsonResponse({"message": f"Recipe {name} successfully added."}, status=200)
                except IntegrityError:
                    return JsonResponse({"message": f"Recipe {name} already exists!"}, status=400)
            if data.get("action") == "delete":
                try:
                    print(id)
                    recipe = Recipe.objects.get(id=id)
                    recipe.delete()
                    return JsonResponse({"message": f"Recipe {name} successfully deleted."}, status=200)
                except IntegrityError:
                    return JsonResponse({"message": f"Recipe {name} already exists!"}, status=400)
            if data.get("action") == "save":
                print(id)
                recipe = Recipe.objects.get(id=id)
                ingredients = data.get("ingredients")
                print(ingredients)
                for ingredient in ingredients:
                    ingre = Ingredient.objects.get(name=ingredient["name"])
                    if RecipeIngredient.objects.filter(recipe=recipe, ingredient=ingre).exists():
                        recipeingredient = RecipeIngredient.objects.get(recipe=recipe, ingredient=ingre)
                        recipeingredient.quantity = ingredient["quantity"]
                    else:
                        recipeingredient = RecipeIngredient(recipe=recipe, ingredient=ingre, quantity=ingredient["quantity"])
                    recipeingredient.save()
                print(recipe.ingredients.all())
                return JsonResponse({"message": f"Recipe {name} successfully edited."}, status=200)          
    else:
        return render(request, "meals/recipes.html", {
            "recipes": recipes,
        })

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
                except Exception as error:
                    return JsonResponse({"message": error}, status=400)
        else:
            id = data.get("id")
            name = data.get("name").capitalize()
            if not name:
                return JsonResponse({"message": f"Ingredient name can't be blank"}, status=400)
            unit = data.get("unit").lower()
            if data.get("action") == "add":
                try:
                    print(name)
                    ingredient = Ingredient(name=name, unit=unit)
                    ingredient.save()
                    return JsonResponse({"message": f"Ingredient {name} successfully added."}, status=200)
                except IntegrityError:
                    return JsonResponse({"message": f"Ingredient {name} already exists!"}, status=400)
            elif data.get("action") == "delete":
                ingredient = Ingredient.objects.get(id=id)
                ingredient.delete()
                return JsonResponse({"message": f"Ingredient {ingredient.name} successfully deleted."}, status=200)
            elif data.get("action") == "edit":
                try:
                    ingredient = Ingredient.objects.get(id=id)
                    ingredient.name = name
                    ingredient.unit = unit
                    ingredient.save()
                    return JsonResponse({"message": f"Ingredient {name} successfully edited."}, status=200)
                except IntegrityError:
                    return JsonResponse({"message": f"Ingredient {name} already exists!"}, status=400)
    else:
        return render(request, "meals/ingredients.html", {
            "ingredients": ingredients
        })

# Login api for user
def login_user(request):
    if request.method == "POST":
        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)
        print(user)
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
        username = request.POST["username"]
        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "meals/index.html", {
                "message": "Passwords must match."
            })
        # Attempt to create new user
        try:
            user = User.objects.create_user(username=username, password=password, email=email)
            user.save()
        except IntegrityError:
            return render(request, "meals/index.html", {
                "message": "Email/Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return HttpResponseRedirect(reverse("index"))
