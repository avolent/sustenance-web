from queue import Empty
from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    def __str__(self):
        return f"ID:{self.id} - {self.username} | {self.email}"

class Ingredient(models.Model):
    name = models.CharField(max_length=120, unique=True, null=False, blank=False)
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
    name = models.CharField(max_length=120, null=False, blank=False)
    link = models.CharField(max_length=255, null=True)
    date_created = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey("User", on_delete=models.CASCADE, related_name="recipes")
    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "link": self.link,
            "ingredients": [ingredient.serialize() for ingredient in self.ingredients.all()],
            "date_created": self.date_created,
            "created_by": self.created_by.username
        }
    def __str__(self):
        return f"ID:{self.id} - {self.name}, {self.created_by.username} {self.date_created}"

    class Meta:
      unique_together = 'created_by', 'name'

class RecipeIngredient(models.Model):
    recipe = models.ForeignKey("Recipe", on_delete=models.CASCADE, related_name="ingredients")
    ingredient = models.ForeignKey("Ingredient", on_delete=models.CASCADE, related_name="recipes")
    quantity = models.IntegerField(null=False, blank=False)
    def serialize(self):
        return {
            "id": self.id,
            "ingredientId": self.ingredient.id,
            "ingredient": self.ingredient.name,
            "quantity": self.quantity,
            "unit": self.ingredient.unit
        }
    def __str__(self):
        return f"{self.ingredient.name}: {self.quantity}{self.ingredient.unit}"

