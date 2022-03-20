document.addEventListener('DOMContentLoaded', function() {
    console.log('ingredients.js Loaded');
    let ingredientInput =  document.querySelector('#ingredientInput');
    ingredientInput.addEventListener('change', (input) => updateIngredient(input));
    ingredientInput.addEventListener('focus', (input) => {
        input.target.value = ''
        document.querySelector('#ingredient').style.display = 'none';
    });
});

// Update the ingredient whether it be adding a new one or editing a previous one.
function updateIngredient(input) {
    // CSRF Token for auth in API
    const csrftoken = Cookies.get('csrftoken');
    //Grab form element and prevent it from submitting
    let form = document.querySelector('#ingredientForm')
    form.addEventListener('submit', (event) => {event.preventDefault()});
    
    // Display ingredient section of form and grab all inputs in form.
    document.querySelector('#ingredient').style.display = 'block';
    let ingredient = input.target.value;
    let ingredientName = document.querySelector('#ingredientName')
    let ingredientUnit = document.querySelector('#ingredientUnit')
    console.log(ingredient);
    
    if (ingredient.toLowerCase() == 'add') {
        console.log('Add Ingredient');
        document.querySelector('#ingredient').style.display = 'block';
        ingredientName.value = '';
        form.addEventListener('submit', () => {
            fetch('/ingredients', {
                method: 'POST',
                headers: { 'X-CSRFToken': csrftoken },
                body: JSON.stringify({
                    action: 'add',
                    name: ingredientName.value,
                    unit: ingredientUnit.value
                })
            })
        });
    } else if (ingredient == '') {
        document.querySelector('#ingredient').style.display = 'none';
    } else {
        console.log('Edit Ingredient');
        document.querySelector('#ingredient').style.display = 'block';
        document.querySelector('#ingredientName').value = ingredient;
        form.addEventListener('submit', () => {
            fetch('/ingredients', {
                method: 'POST',
                headers: { 'X-CSRFToken': csrftoken },
                body: JSON.stringify({
                    action: 'edit',
                    name: ingredientName.value,
                    unit: ingredientUnit.value,
                })
            })
        });
    }
};

function pullIngredients() {
    const csrftoken = Cookies.get('csrftoken');

};