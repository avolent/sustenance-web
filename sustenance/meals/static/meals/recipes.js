document.addEventListener('DOMContentLoaded', async function() {
    console.log('recipes.js Loaded');
    await pullRecipes('all');
    document.querySelector('#recipeSelection').addEventListener('change', (event) => itemList(event));
    document.querySelectorAll('.button').forEach((button) => button.addEventListener('click', (event) => editRecipe(event)));
    document.querySelectorAll('.ingredientButton').forEach((button) => button.addEventListener('click', (event) => editIngredient(event)));
});

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
            if (recipe == "all") {
                document.querySelector('#recipesCount').innerHTML = result.length;
                let options = document.querySelector('#datalistOptions')
                options.innerHTML = '<option id="Create" value="Create"></option>'
                result.forEach((recipe) => {
                    options.innerHTML += `<option id='${recipe.name}' value='${recipe.name}'>`;
                })
            }
            resolve(result);
        })
    });
}

async function itemList(event) {
    event.target.blur();
    document.querySelector('#message').innerHTML = '';
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
            let recipeData = await pullRecipes(recipe);
            const recipeForm = document.querySelector('#recipeEdit');
            recipeForm.querySelector('.id').value = recipeData.id;
            recipeForm.querySelector('.name').innerHTML = recipeData.name;
            recipeForm.querySelector('.link').href = `https://${recipeData.link}`
            recipeForm.querySelector('.ingredientList').innerHTML = ''
            recipeData.ingredients.forEach((ingredient) => recipeForm.querySelector('.ingredientList').innerHTML += `<div class="ingredient" id="${ingredient.ingredientId}"><div class="ingredientName">${ingredient.ingredient}</div><div>:</div><div class="ingredientQuantity">${ingredient.quantity}</div><div class="ingredientUnit">${ingredient.unit}</div></div>`);
            let editButton = recipeForm.querySelector('#edit');
            editButton.value = "edit";
            editButton.innerHTML = "Edit";
            document.querySelector('#recipeAdd').style.display = 'none';
            recipeForm.querySelector("#ingredientAdd").style.display = "none"
            recipeForm.style.display = 'flex';
        }
    } else {
        document.querySelector('#recipeEdit').style.display = 'none';
        document.querySelector('#recipeAdd').style.display = 'none';
    };
}

function editRecipe(event) {
    const csrftoken = Cookies.get('csrftoken');
    const action = event.target.value;
    const recipeForm = event.target.parentElement;
    let message = document.querySelector('#message')
    let id = recipeForm.querySelector('.id').value;
    let editButton = recipeForm.querySelector('#edit');
    let name = recipeForm.querySelector('.name').value || recipeForm.querySelector('.name').innerHTML;
    let link = recipeForm.querySelector('.link').value || recipeForm.querySelector('.name').innerHTML;
    let ingredients = [];
    console.log(action)
    if (action == "save") {
        recipeForm.querySelectorAll(".ingredient").forEach(ingredient => {
            let item = {
                name: ingredient.children[0].innerHTML,
                quantity: ingredient.children[2].innerHTML,
            }
            ingredients.push(item)
        })
        console.log(ingredients)
    } 
    if (action == "edit") {
        editButton.value = "save";
        editButton.innerHTML = "Save";
        pullIngredients("all");
        recipeForm.querySelector("#ingredientSelection").value = "";
        recipeForm.querySelector("#QuantityAdd").value = "";
        recipeForm.querySelector("#ingredientAdd").style.display = "flex"
    } else {
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

async function editIngredient(event) {
    const action = event.target.value;
    let ingredientList = document.querySelector(".ingredientList");
    let ingredientAddForm = document.querySelector("#ingredientAdd");
    let ingredient = await pullIngredients(ingredientAddForm.querySelector("#ingredientSelection").value);
    let quantity = ingredientAddForm.querySelector(".quantity").value;
    console.log(action);
    let ingredients = {}
    ingredientList.querySelectorAll(".ingredient").forEach(ingredient => {
        let name = ingredient.children[0].innerHTML;
        let item = {
            quantity: ingredient.children[2].innerHTML
        }
        ingredients[name] = item
    })
    if (action == "edit") {
        if (ingredient.name in ingredients) {
            let ingredientDiv = document.getElementById(`${ingredient.id}`)
            ingredientDiv.querySelector(".ingredientQuantity").innerHTML = quantity;
        } else {
            ingredientList.innerHTML += `<div class="ingredient" id="${ingredient.ingredientId}"><div class="ingredientName">${ingredient.name}</div><div>:</div><div class="ingredientQuantity">${quantity}</div><div class="ingredientUnit">${ingredient.unit}</div></div>`
        }
    }
}