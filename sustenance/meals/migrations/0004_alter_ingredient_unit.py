# Generated by Django 4.0.1 on 2022-03-20 03:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('meals', '0003_alter_ingredient_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ingredient',
            name='unit',
            field=models.CharField(max_length=10),
        ),
    ]
