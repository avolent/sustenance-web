# Generated by Django 4.0.1 on 2022-04-29 04:55

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('meals', '0016_rename_ingredients_history_meals_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='history',
            old_name='date_created',
            new_name='date_generated',
        ),
        migrations.RenameField(
            model_name='history',
            old_name='shoppingList',
            new_name='shopping_list',
        ),
    ]
