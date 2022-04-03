from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    def __str__(self):
        return f"ID:{self.id} - {self.username} | {self.email}"

class Ingredient(models.Model):
    name = models.CharField(max_length=120, unique=True, blank=False)
    unit = models.CharField(max_length=10)
    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "unit": self.unit
        }
    def __str__(self):
        return f"ID:{self.id} - {self.name}, {self.unit}"

class Recipe(models.Model):
    pass

class RecipeIngredient(models.Model):
    pass