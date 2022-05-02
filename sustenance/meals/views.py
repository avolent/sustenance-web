import json, random
from django.shortcuts import render
from django.db import IntegrityError
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponseRedirect, JsonResponse
from django.urls import reverse
from django.core.paginator import Paginator
from .models import User, Ingredient, Recipe, RecipeIngredient, History

# Returns the index page of the site also does meal/shopping list generation.
def index(request):
    # Post request for generating meal and shopping lists.
    if request.method == "POST":
        print("Generating")
        # Grab all recipes created by the user.
        recipes = Recipe.objects.order_by("name").filter(created_by=request.user)
        # Load the request data and grab the meal count
        data = json.loads(request.body)
        count = int(data.get("count"))
        # If meal count more the total recipes, return an error to user.
        if len(recipes) < count:
            return JsonResponse({"message": "Not enough recipes to generate!"}, status=400)
        # randomly select meals based on count from the recipes and return it to the user.
        recipe_selection = random.sample(list(recipes), count)
        return JsonResponse([recipe.serialize() for recipe in recipe_selection], safe=False, status=200)
    # If its not a post request return the index page
    return render(request, "meals/index.html")

# History route used for the history api and history page.
@login_required
def history(request):
    # If the request is post, save the users generated results to the database.
    if request.method == "POST":
        # Load the data and grab the meals and shopping list
        data = json.loads(request.body)
        meals = data.get("meals")
        shoppinglist = data.get("shoppinglist")
        # Save info to database and return message.
        history = History(meals=meals, shopping_list=shoppinglist, generated_by=request.user)
        history.save()
        return JsonResponse({"message": "Shopping List generated and added to history!"}, status=200)
    else:
        # If request is get, pull the 20 latest generation from database and return to site in pagination form.
        history = History.objects.order_by("-date_generated").filter(generated_by=request.user)[:20]
        pages = Paginator(history, 5)
        page_number = request.GET.get('page')
        page_obj = pages.get_page(page_number)
        return render(request, "meals/history.html", {
            "page_obj": page_obj,
        })


# Returns the meals page also used for recipe editing.
@login_required
def recipes_view(request):
    # Pull all recipes created by user.
    recipes = Recipe.objects.order_by("name").filter(created_by=request.user)
    # For POST requests pull all or selected ingredient details.
    if request.method == "POST":
        data = json.loads(request.body)
        print(data)
        if data.get("action") == "pull":
            # If action is pull and recipe is all, pull all recipes
            if data.get("recipe") == "all":
                print(recipes)
                return JsonResponse([recipe.serialize() for recipe in recipes], safe=False, status=200)
            # Else grab the individual recipe from the database and return to user.
            else:
                name = data.get("recipe")
                try:
                    recipe = Recipe.objects.get(name=name)
                    print(recipe.ingredients.all())
                    return JsonResponse(recipe.serialize(), status=200)
                except Exception as error:
                    return JsonResponse({"message": error}, status=400)
        # Any anything not pull like "edit" start here.
        else:
            id = data.get("id")
            name = data.get("name").capitalize()
            # If name is empty return an error to the user.
            if not name:
                return JsonResponse({"message": f"Recipe name can't be blank"}, status=400)
            # If action is add we can add the recipe to the database and return message to the user.
            if data.get("action") == "add":
                link = data.get("link").lower()
                try:
                    print(name)
                    recipe = Recipe(name=name, link=link, created_by=request.user)
                    recipe.save()
                    return JsonResponse({"message": f"Recipe {name} successfully added."}, status=200)
                except IntegrityError:
                    return JsonResponse({"message": f"Recipe {name} already exists!"}, status=400)
            # If action is delete, we can delete it from the database.
            if data.get("action") == "delete":
                try:
                    print(id)
                    recipe = Recipe.objects.get(id=id)
                    recipe.delete()
                    return JsonResponse({"message": f"Recipe {name} successfully deleted."}, status=200)
                except IntegrityError:
                    return JsonResponse({"message": f"Recipe {name} already exists!"}, status=400)
            # If the action is save we can update the entry in the database
            if data.get("action") == "save":
                print(id)
                recipe = Recipe.objects.get(id=id)
                ingredients = data.get("ingredients")
                print(ingredients)
                for ingredient in ingredients:
                    ingre = Ingredient.objects.get(name=ingredient["name"])
                    # Confirm recipe already has the ingredient in the database, update it.
                    if RecipeIngredient.objects.filter(recipe=recipe, ingredient=ingre).exists():
                        recipeingredient = RecipeIngredient.objects.get(recipe=recipe, ingredient=ingre)
                        recipeingredient.quantity = ingredient["quantity"]
                    else:
                        recipeingredient = RecipeIngredient(recipe=recipe, ingredient=ingre, quantity=ingredient["quantity"])
                    recipeingredient.save()
                print(recipe.ingredients.all())
                return JsonResponse({"message": f"Recipe {name} successfully edited."}, status=200)
    # Return recipes page.
    else:
        return render(request, "meals/recipes.html", {
            "recipes": recipes,
        })

# For all ingredient requests
@login_required
def ingredients_view(request):
    # Pull all ingredients in the database
    ingredients = Ingredient.objects.order_by("name").all()
    if request.method == "POST":
        data = json.loads(request.body)
        print(data)
        # If request is pull
        if data.get("action") == "pull":
            # If ingredient is all, return all avaible ingredients to the user.
            if data.get("ingredient") == "all":
                print(ingredients)
                return JsonResponse([ingredient.serialize() for ingredient in ingredients], safe=False)
            else:
                # Else grab the single ingredient from the database and return to the user.
                name = data.get("ingredient")
                try:
                    ingredient = Ingredient.objects.get(name=name)
                    return JsonResponse(ingredient.serialize())
                except Exception as error:
                    return JsonResponse({"message": error}, status=400)
        else:
            # If request action is not pull 
            id = data.get("id")
            name = data.get("name").capitalize()
            # Name is empty, return error to user.
            if not name:
                return JsonResponse({"message": f"Ingredient name can't be blank"}, status=400)
            unit = data.get("unit").lower()
            # If request is add, grab ingredient details and add to database, return message to user.
            if data.get("action") == "add":
                try:
                    print(name)
                    ingredient = Ingredient(name=name, unit=unit)
                    ingredient.save()
                    return JsonResponse({"message": f"Ingredient {name} successfully added."}, status=200)
                except IntegrityError:
                    return JsonResponse({"message": f"Ingredient {name} already exists!"}, status=400)
            # else action is delete, remove ingredient from the databae
            elif data.get("action") == "delete":
                ingredient = Ingredient.objects.get(id=id)
                ingredient.delete()
                return JsonResponse({"message": f"Ingredient {ingredient.name} successfully deleted."}, status=200)
            # If action is edit, find it within the database and update the values.
            elif data.get("action") == "edit":
                try:
                    ingredient = Ingredient.objects.get(id=id)
                    ingredient.name = name
                    ingredient.unit = unit
                    ingredient.save()
                    return JsonResponse({"message": f"Ingredient {name} successfully edited."}, status=200)
                except IntegrityError:
                    return JsonResponse({"message": f"Ingredient {name} already exists!"}, status=400)
    # Return the ingredients page
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
