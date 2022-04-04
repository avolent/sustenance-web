document.addEventListener('DOMContentLoaded', async function() {
    console.log('recipes.js Loaded');
    await pullRecipes('all');
    document.querySelector('#recipeSelection').addEventListener('change', (event) => itemList(event));
    document.querySelectorAll('.button').forEach((button) => button.addEventListener('click', (event) => editRecipe(event)));
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
            document.querySelector('#recipeAdd').style.display = 'none';
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
    const RecipeForm = event.target.parentElement;
    let message = document.querySelector('#message')
    let id = RecipeForm.querySelector('.id').value;
    let name = RecipeForm.querySelector('.name').value;
    let link = RecipeForm.querySelector('.link').value;
    fetch('/recipes', {
        method: 'POST',
        headers: { 'X-CSRFToken': csrftoken },
        body: JSON.stringify({
            action: action,
            id: id,
            name: name,
            link: link,
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
        pullRecipes('all');
        RecipeForm.style.display = 'none'
        document.querySelector('#Recipeselection').value = '';
        message.style.backgroundColor = 'var(--success)';
        message.innerHTML = result.message;
    })
    // If response not ok, update message with error.
    .catch(error => {
        error.then(result => {
            message.style.backgroundColor = 'var(--error)';
            message.innerHTML = result.message;
        })
    })
}