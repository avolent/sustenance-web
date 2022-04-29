// Wait till page is loaded then add Eventlisteners to all buttons within page.
document.addEventListener('DOMContentLoaded', async function() {
    console.log('recipes.js Loaded');
    // Pull all recipes available
    await pullRecipes('all');
    document.querySelector('#recipeSelection').addEventListener('change', (event) => itemList(event));
    document.querySelector('#ingredientSelection').addEventListener('change', (event) => ingredientList(event));
    document.querySelectorAll('.button').forEach((button) => button.addEventListener('click', (event) => editRecipe(event)));
    document.querySelectorAll('.ingredientButton').forEach((button) => button.addEventListener('click', (event) => editIngredient(event)));
});

// Pull all recipes and update recipe datalist options within the page.
function pullRecipes(recipe) {
    return new Promise((resolve, reject) => {
        const csrftoken = Cookies.get('csrftoken')
        fetch('/recipes', {
            method: 'POST',
            headers: { 'X-CSRFToken': csrftoken },
            body: JSON.stringify({
                action: 'pull',
                recipe: recipe
            })
        })
        .then(response => response.json())
        .then(result => {
            console.log(result);
            // If the recipe is all then grab the end results and update the datalist options with the results.
            if (recipe == "all") {
                document.querySelector('#recipesCount').innerHTML = result.length;
                let options = document.querySelector('#datalistOptions')
                options.innerHTML = '<option id="Create" value="Create"></option>'
                result.forEach((recipe) => {
                    options.innerHTML += `<option id='${recipe.name}' value='${recipe.name}'>`;
                })
            }
            // otherwise just resolve the request as an individual result and the user can do what ever they want with it.
            resolve(result);
        })
    });
}

// Controls how the recipe selection works.
async function itemList(event) {
    // After option selection, unfocus the input box.
    event.target.blur();
    // Reset the page message to nothing
    document.querySelector('#message').innerHTML = '';
    // Grab the recipe from the input and if it is "create", show the create div.
    // Else show the Recipe action buttons and information/ingredients
    let recipe = event.target.value;
    if (document.querySelector('#datalistOptions').options.namedItem(recipe)) {
        if (recipe == 'Create') {
            const recipeForm = document.querySelector('#recipeAdd');
            recipeForm.querySelector('.id').value = '';
            recipeForm.querySelector('.name').value = '';
            recipeForm.querySelector('.link').value = '';
            document.querySelector('#recipeEdit').style.display = 'none';
            recipeForm.style.display = 'flex';
        } else {
            // Pull currently selected recipe data.
            let recipeData = await pullRecipes(recipe);
            // Grab Recipe Form and update all information within the div.
            const recipeForm = document.querySelector('#recipeEdit');
            recipeForm.querySelector('.id').value = recipeData.id;
            recipeForm.querySelector('.name').innerHTML = recipeData.name;
            recipeForm.querySelector('.link').href = `https://${recipeData.link}`
            recipeForm.querySelector('.ingredientList').innerHTML = ''
            recipeData.ingredients.forEach((ingredient) => recipeForm.querySelector('.ingredientList').innerHTML += `<div class="ingredient" id="${ingredient.ingredientId}"><div class="ingredientName">${ingredient.ingredient}</div><div>:</div><div class="ingredientQuantity">${ingredient.quantity}</div><div class="ingredientUnit">${ingredient.unit}</div></div>`);
            // Reset button to "edit" from last action
            let editButton = recipeForm.querySelector('#edit');
            editButton.value = "edit";
            editButton.innerHTML = "Edit";
            // Hide all other divs, ie. Create Recipe and Ingredient edit.
            // Make the Recipe form visible.
            document.querySelector('#recipeAdd').style.display = 'none';
            recipeForm.querySelector("#ingredientAdd").style.display = "none"
            recipeForm.style.display = 'flex';
        }
    } else {
        // Hide all other divs on the page.
        document.querySelector('#recipeEdit').style.display = 'none';
        document.querySelector('#recipeAdd').style.display = 'none';
    };
}

// Function for editing selected recipes. Initiated by the edit button event listener.
function editRecipe(event) {
    // Grab cookie token.
    const csrftoken = Cookies.get('csrftoken');
    // Determine the event action via the hidden input and grab all divs required
    const action = event.target.value;
    const recipeForm = event.target.parentElement;
    let message = document.querySelector('#message')
    let id = recipeForm.querySelector('.id').value;
    let editButton = recipeForm.querySelector('#edit');
    let name = recipeForm.querySelector('.name').value || recipeForm.querySelector('.name').innerHTML;
    let link = recipeForm.querySelector('.link').value || recipeForm.querySelector('.link').innerHTML;
    // Set up an ingredients array for later use.
    let ingredients = [];
    console.log(action)
    // If action is save, grab all updated ingredients.
    if (action == "save") {
        recipeForm.querySelectorAll(".ingredient").forEach(ingredient => {
            let item = {
                name: ingredient.children[0].innerHTML,
                quantity: ingredient.children[2].innerHTML,
            }
            ingredients.push(item)
        })
        console.log(ingredients)
        editButton.value = "edit";
        editButton.innerHTML = "Edit";
    } 
    // If action is edit, update buttons to Save. Pull all ingredients for the recipe form and show the ingredient edit div.
    if (action == "edit") {
        editButton.value = "save";
        editButton.innerHTML = "Save";
        pullIngredients("all");
        recipeForm.querySelector("#ingredientSelection").value = "";
        recipeForm.querySelector("#quantityAdd").value = "";
        recipeForm.querySelector("#ingredientAdd").style.display = "flex"
    } else {
        // Else if not "Edit" update, take as save and update the recipe with the new ingredients.
        fetch('/recipes', {
            method: 'POST',
            headers: { 'X-CSRFToken': csrftoken },
            body: JSON.stringify({
                action: action,
                id: id,
                name: name,
                link: link,
                ingredients: ingredients,
            })
        })
        .then(response => {
            console.log(response)
            if (!response.ok) {
                throw response.json();
            }
            return response.json();
        })
        // If response ok, reset ui and update success message
        .then(result => {
            console.log(result)
            pullRecipes('all');
            recipeForm.style.display = 'none'
            editButton.value = "edit";
            editButton.innerHTML = "Edit";
            document.querySelector('#recipeSelection').value = '';
            message.style.backgroundColor = 'var(--success)';
            message.innerHTML = result.message;
        })
        // If response not ok, update message with error.
        .catch(err => 
            err.then(result => {
                message.style.backgroundColor = 'var(--error)';
                message.innerHTML = result.message;
            })
        )
    }
}

// Pull Recipe Ingredients function.
function pullIngredients(ingredient) {
    return new Promise((resolve, reject) => {
        const csrftoken = Cookies.get('csrftoken')
        fetch('/ingredients', {
            method: 'POST',
            headers: { 'X-CSRFToken': csrftoken },
            body: JSON.stringify({
                action: 'pull',
                ingredient: ingredient
            })
        })
        .then(response => response.json())
        .then(result => {
            console.log(result);
            // If ingredient is "all" update the datalist option with all the ingredients
            if (ingredient == "all") {
                let options = document.querySelector('#ingredientdatalistOptions')
                options.innerHTML = "";8
                result.forEach((ingredient) => {
                    options.innerHTML += `<option id='${ingredient.name}' value='${ingredient.name}'>`;
                })
            }
            resolve(result);
        })
    });
}


// Ingredient list function
async function ingredientList(event) {
    event.target.blur();
    let ingredient = event.target.value;
    let ingredientList = document.querySelector(".ingredientList");
    let ingredientAddForm = document.querySelector("#ingredientAdd");
    let ingredients = {}
    ingredientList.querySelectorAll(".ingredient").forEach(ingredient => {
        let name = ingredient.children[0].innerHTML;
        let item = {
            quantity: ingredient.children[2].innerHTML
        }
        ingredients[name] = item
    })
    // If selected ingredient is in the current list of ingredients change buttons to edit and show delete button.
    if (ingredient in ingredients) {
        ingredientAddForm.querySelector("#quantityAdd").value = ingredients[ingredient].quantity;
        ingredientAddForm.querySelector("#edit").innerHTML = 'Edit';
        ingredientAddForm.querySelector("#edit").value = 'edit';
        ingredientAddForm.querySelector("#delete").style.display = "block";
    } else {
        ingredientAddForm.querySelector("#quantityAdd").value = "";
        ingredientAddForm.querySelector("#edit").innerHTML = 'Add';
        ingredientAddForm.querySelector("#edit").value = 'add';
        ingredientAddForm.querySelector("#delete").style.display = "none";
    }
}


// Function for editing ingredients under recipes
async function editIngredient(event) {
    // Reset message
    message.innerHTML = '';
    const action = event.target.value;
    let ingredientList = document.querySelector(".ingredientList");
    let ingredientAddForm = document.querySelector("#ingredientAdd");
    let ingredient = await pullIngredients(ingredientAddForm.querySelector("#ingredientSelection").value);
    let quantity = ingredientAddForm.querySelector(".quantity").value;
    // If quantity no greater then 0 raise error
    if (quantity <= 0) {
        message.style.backgroundColor = 'var(--error)';
        message.innerHTML = 'Quantity needs to be > 0';
        return
    }
    console.log(action);
    // Grab current ingredients off page
    let ingredients = {}
    ingredientList.querySelectorAll(".ingredient").forEach(ingredient => {
        let name = ingredient.children[0].innerHTML;
        let item = {
            quantity: ingredient.children[2].innerHTML
        }
        ingredients[name] = item
    })
    // Determine function and edit page based on the function
    let ingredientDiv = document.getElementById(`${ingredient.id}`)
    if (action == "edit" || action == "add") {
        if (ingredient.name in ingredients) {
            ingredientDiv.querySelector(".ingredientQuantity").innerHTML = quantity;
        } else {
            ingredientList.innerHTML += `<div class="ingredient" id="${ingredient.id}"><div class="ingredientName">${ingredient.name}</div><div>:</div><div class="ingredientQuantity">${quantity}</div><div class="ingredientUnit">${ingredient.unit}</div></div>`
        }
        ingredientAddForm.querySelector("#edit").innerHTML = 'Edit';
        ingredientAddForm.querySelector("#edit").value = 'edit';
        ingredientAddForm.querySelector("#delete").style.display = "block";
    }
    if (action == "delete") {
        ingredientDiv.remove();
    }
}