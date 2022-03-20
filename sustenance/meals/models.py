from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    def __str__(self):
        return f"ID:{self.id} - {self.username} | {self.email}"

class Ingredient():
    name = models.CharField(max_length=120)
    unit = models.CharField(max_length=10, blank=True)

class Recipe():
    pass

class RecipeIngredient():
    pass