document.addEventListener('DOMContentLoaded', async function() {
    console.log('ingredients.js Loaded');
    await pullIngredients('all');
    document.querySelector('#ingredientSelection').addEventListener('change', (event) => itemList(event));
    document.querySelectorAll('.button').forEach((button) => button.addEventListener('click', (event) => editIngredient(event)));
});

// Function for ingredient editing
function editIngredient(event) {
    const csrftoken = Cookies.get('csrftoken');
    const action = event.target.value;
    const ingredientForm = event.target.parentElement;
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
    .then(response => response.json())
    .then(result => {
        console.log(result)
        pullIngredients('all');
        ingredientForm.style.display = 'none'
        document.querySelector('#ingredientSelection').value = '';
    })
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
                document.querySelector('#ingredientsCount').innerHTML = result.length;
                let options = document.querySelector('#datalistOptions')
                options.innerHTML = '<option id="create" value="create"></option>'
                result.forEach((ingredient) => {
                    options.innerHTML += `<option id='${ingredient.name}' value='${ingredient.name}'>`;
                })
            }
            resolve(result);
        })
    });
}

async function itemList(event) {
    event.target.blur();
    let ingredient = event.target.value;
    if (document.querySelector('#datalistOptions').options.namedItem(ingredient)) {
        if (ingredient == 'create') {
            const ingredientForm = document.querySelector('#ingredientAdd');
            ingredientForm.querySelector('.id').value = '';
            ingredientForm.querySelector('.name').value = '';
            ingredientForm.querySelector('.unit').value = '';
            document.querySelector('#ingredientEdit').style.display = 'none';
            ingredientForm.style.display = 'block';
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
        document.querySelector('#ingredientEdit').style.display = 'none';
        document.querySelector('#ingredientAdd').style.display = 'none';
    };
}