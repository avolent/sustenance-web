// Wait for page to load and the add event listeners to buttons.
document.addEventListener('DOMContentLoaded', async function() {
    console.log('ingredients.js Loaded');
    await pullIngredients('all');
    document.querySelector('#ingredientSelection').addEventListener('change', (event) => itemList(event));
    document.querySelectorAll('.button').forEach((button) => button.addEventListener('click', (event) => editIngredient(event)));
});

// Function for ingredient editing, initiated by the click of the edit ingredient button.
function editIngredient(event) {
    // Set/grab off page all variables for later use.
    const csrftoken = Cookies.get('csrftoken');
    const action = event.target.value;
    const ingredientForm = event.target.parentElement;
    let message = document.querySelector('#message')
    let id = ingredientForm.querySelector('.id').value;
    let name = ingredientForm.querySelector('.name').value;
    let unit = ingredientForm.querySelector('.unit').value;
    fetch('/ingredients', {
        method: 'POST',
        headers: { 'X-CSRFToken': csrftoken },
        body: JSON.stringify({
            action: action,
            id: id,
            name: name,
            unit: unit
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
        pullIngredients('all');
        ingredientForm.style.display = 'none'
        document.querySelector('#ingredientSelection').value = '';
        message.style.backgroundColor = 'var(--success)';
        message.innerHTML = result.message;
    })
    // If response not ok, update message with error.
    .catch(err => {
        err.then(result => {
            message.style.backgroundColor = 'var(--error)';
            message.innerHTML = result.message;
        })
    })
}

// Pull all current ingredients avaible
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
            // If request is for "all", Pull them all and display on page. Otherwise grab individual ingredient data.
            if (ingredient == "all") {
                document.querySelector('#ingredientsCount').innerHTML = result.length;
                let options = document.querySelector('#datalistOptions')
                options.innerHTML = '<option id="Create" value="Create"></option>'
                result.forEach((ingredient) => {
                    options.innerHTML += `<option id='${ingredient.name}' value='${ingredient.name}'>`;
                })
            }
            resolve(result);
        })
    });
}

// Function for updating the UI when Create or an ingredient is selected for updating.
async function itemList(event) {
    // blue the datalist input on event activation (change)
    event.target.blur();
    document.querySelector('#message').innerHTML = '';
    let ingredient = event.target.value;
    // console.log(ingredient)
    // Check if the option exists in the datalist.
    if (document.querySelector('#datalistOptions').options.namedItem(ingredient)) {
        // If it is create show blank add form.
        if (ingredient == 'Create') {
            const ingredientForm = document.querySelector('#ingredientAdd');
            ingredientForm.querySelector('.id').value = '';
            ingredientForm.querySelector('.name').value = '';
            ingredientForm.querySelector('.unit').value = '';
            document.querySelector('#ingredientEdit').style.display = 'none';
            ingredientForm.style.display = 'block';
        // else update form with selected ingredient details
        } else {
            let ingredientData = await pullIngredients(ingredient);
            const ingredientForm = document.querySelector('#ingredientEdit');
            ingredientForm.querySelector('.id').value = ingredientData.id;
            ingredientForm.querySelector('.name').value = ingredientData.name;
            ingredientForm.querySelector('.unit').value = ingredientData.unit;
            document.querySelector('#ingredientAdd').style.display = 'none';
            ingredientForm.style.display = 'block';
        }
    } else {
        // If option not in list hide both divs.
        document.querySelector('#ingredientEdit').style.display = 'none';
        document.querySelector('#ingredientAdd').style.display = 'none';
    };
}