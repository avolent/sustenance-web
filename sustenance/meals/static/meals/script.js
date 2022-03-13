document.addEventListener('DOMContentLoaded', function() {
    console.log("Script Loaded");
    let account = document.querySelectorAll(".account")
    console.log(account);
    account.forEach(btn => btn.addEventListener('click', () => login(btn)));
});

function login(btn) {
    console.log(btn.id);
    form = document.getElementById('account-form');
    
    if (btn.id == "login") {
        form.querySelector('#account-submit').value = "Login";
        form.action = "login";
    } else {
        form.querySelector('#account-submit').value = "Register";
        form.action = "logout";
    }
    if (form.style.display != "none") {
        form.style.display = "none";
    } else {
        form.style.display = "flex";
    }
    console.log(form.action);
}