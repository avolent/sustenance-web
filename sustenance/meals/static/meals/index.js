// Wait for page to load and add event listeners to the buttons etc.
document.addEventListener('DOMContentLoaded', async function() {
    console.log('index.js Loaded');
    document.querySelector('#mealCountInput').addEventListener('change', (event) => mealCount(event));
    document.querySelector('#generate').addEventListener('click', () => generate());
});

// Function used for the slider and changing the value underneath
function mealCount(event) {
    let count = event.target.value;
    document.querySelector('#mealCount').innerHTML = count;
}

// Function for talking with the generate api and pulling shopping list results.
function generate() {
    return new Promise((resolve, reject) => {
        let count = document.querySelector("#mealCountInput").value;
        let message = document.querySelector('#message');
        const csrftoken = Cookies.get('csrftoken');
        fetch('/', {
            method: 'POST',
            headers: { 'X-CSRFToken': csrftoken },
            body: JSON.stringify({
                action: 'generate',
                count: count
            })
        })
        .then(response => {
            if (!response.ok) {
                throw response.json();
              }
            return response.json();
        })
        // If response ok, reset ui and update success message
        .then(result => {
            console.log(result)
            message.style.backgroundColor = 'var(--success)';
            message.innerHTML = "Meals generated!";
            displayMeals(result)
            resolve(result)
        })
        // If response not ok, update message with error.
        .catch(err => {
            // console.log(err)
            err.then(result => {
                console.log(result)
                message.style.backgroundColor = 'var(--error)';
                message.innerHTML = result.message;
            })
        })
    })
}

// Display the meals generated
function displayMeals(meals) {
    return new Promise(async (resolve, reject) => {
        // console.log(meals)
        let meallistdiv = document.querySelector("#mealList");
        let shoppinglistdiv = document.querySelector("#shoppingList");
        meallistdiv.innerHTML = '';
        shoppinglistdiv.innerHTML = '';
        // Create shopping list/meal list variable for later use.
        let shoppingList = [];
        let mealList = []
        // For each meal in results returned push meal name to meal list.
        meals.forEach(meal => {
            // console.log(meal);
            mealList.push(meal.name)
            // Print Meal on page
            meallistdiv.innerHTML += `<div>${meal.name}</div>`;
            // For each ingredient in results, either add to exist ingredient or add to shopping list.
            meal.ingredients.forEach( ingredient => {
                // console.log(ingredient)
                let x = {}
                if (shoppingList.some(el => el.name === ingredient.ingredient)) {
                    shoppingList[shoppingList.findIndex(el => el.name == ingredient.ingredient)].quantity += ingredient.quantity;
                } else {
                    x.name = ingredient.ingredient;
                    x.id = ingredient.ingredientId;
                    x.quantity = ingredient.quantity;
                    x.unit = ingredient.unit;
                    shoppingList.push(x)
                }
            })
        });
        // Print each item in shopping list on page.
        for (ingredient in shoppingList) {
            // console.log(ingredient);
            shoppinglistdiv.innerHTML += `<div class="ingredient"><div><input type="checkbox"></div><div class="ingredientName">${shoppingList[ingredient].name}:</div><div class="ingredientQuantity">${shoppingList[ingredient].quantity}</div><div class=ingredientUnit>${shoppingList[ingredient].unit}</div></div>`;
        }
        // console.log(shoppingList);
        await mealHistory(mealList, shoppingList)
    })
}

// Function for saving the meal history and upload it to the database for later.
function mealHistory(meals, shoppingList) {
    return new Promise((resolve, reject) => {
        console.log(meals, shoppingList)
        const csrftoken = Cookies.get('csrftoken');
        fetch('/history', {
            method: 'POST',
            headers: { 'X-CSRFToken': csrftoken },
            body: JSON.stringify({
                meals: meals,
                shoppinglist: shoppingList
            })
        })
        .then(response => {
            if (!response.ok) {
                throw response.json();
            }
            return response.json();
        })
        // If response ok, reset ui and update success message
        .then(result => {
            console.log(result)
            message.style.backgroundColor = 'var(--success)';
            message.innerHTML = "Meals generated!";
            resolve(result)
        })
        // If response not ok, update message with error.
        .catch(err => {
            // console.log(err)
            err.then(result => {
                message.style.backgroundColor = 'var(--error)';
                message.innerHTML = result.message;
            })
        })
    })
}
