# Generated by Django 4.0.1 on 2022-03-20 01:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('meals', '0002_ingredient_recipe_recipeingredient'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ingredient',
            name='name',
            field=models.CharField(max_length=120, unique=True),
        ),
    ]
