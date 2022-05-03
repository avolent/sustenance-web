# CS50 Web Capstone Project
My CS50 Web Capstone Project.
https://cs50.harvard.edu/web/2020/projects/final/capstone/

Youtube Video - https://youtu.be/hm-lY72mOCs

## Description
This project is what I call Sustenence. The goal of this project is to simplify the process of choosing meals to eat each week and then have to mentally organise these meals into a shopping list. This app does this all for you, it will take the meal count you select then return the same amount of meals (No duplicates) and a shopping list with the total amount of ingredients required. So if you have one meal which requires 20 mls of milk and then another which requires 50, these will summed up and shown as a total in the end shopping list. You can then just check off each item when you are a next at the shops and not have to worry about forgetting an ingredients. This should in turn reduce that amount of time and useless purchases when at the shop. The ingredients are crowd source pooled so all users can see any of the ingredients listed in the database, hopefully this saving time on having to create every single ingredient. Recipes are then only for each user and can not be seen by others. Upon generating a shopping list, it is saved to the history and you are then able to see previous generations on the history. This is limited to 20 history entries as it is only intended to be for incase you refresh or need to check a previous generation.

## Distinctiveness and Complexity

I believe my project satisfies the distinctiveness and complexity requirements as I tried to stick with Vanilla JS, HTML and CSS. I did not use any framework or bootstrap to build the pages. Although a basic layout, It was quite overwhelming at first and this added a bit of complications when using with javascript. I built the nav bar with a floating login/register panel which is controlled via javascript.
Most things are all displayed on the pages via js and the only page which is not is the history page.
The database structure was quite complex and had lot of relationships with in it. Linking the Recipes and Ingredients together in one model required a bit of work to understand serialising and preparing the data for returning to the user and processing the data in js.  I believe its has no relation to a social media project and the ecommerce site done throughout the course..

## Files
templates\meals
- All house the template files required, each one being for an individual page besides the layout.html. This being used as the main template for all pages.

static\meals\*.js
- Individual js script files used for each page to keep it organised.
- Each being script file use the focuses on organising data on the page and talking with the api on the page.

static\meals\script.js
- Used for managing the dynamic log in and log out panel on the page.

views.py
- All routes and functions stored with in here.

models.py
- There are 5 models used with in the app.
    User, basically the default user model which is related to many other models.
    Ingredients, used for storing all ingredients created which will then be linked to recipes. Has a name and unit for the ingredient.
    Recipes, used for recipes and stored link, name and dates created/who by.
    RecipeIngredient is what is used to relate both ingredient with recipes. Keeps track of which ingredients are used in what recipes and how much is used.
    History, basically stored json values of previously generated shopping lists.

## How to run.

Clone the file to your directory, change in to the sustenance directory then run the `python3 manage.py runserver`. After this you should be able to access it from http://127.0.0.1:8000/.

