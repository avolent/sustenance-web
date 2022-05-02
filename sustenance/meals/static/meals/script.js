// Load on page finish and add event listener to both register/login buttons.
document.addEventListener('DOMContentLoaded', function() {
    console.log('script.js Loaded');
    let account = document.querySelectorAll('.account')
    account.forEach(btn => btn.addEventListener('click', () => login(btn)));
});

//Function for both login and register button.
function login(btn) {
    let forms = document.getElementsByClassName('account-form');
    let form = forms[`${btn.id}-form`];
    // If button is login show the login form.
    if (btn.id == 'login') {
        forms['register-form'].style.display = 'none'
        if (form.style.display == 'none') {
            form.style.display = 'flex';
        } else {
            form.style.display = 'none';
        }
        // else show the register form.
    } else {
        forms['login-form'].style.display = 'none'
        if (form.style.display != 'none') {
            form.style.display = 'none';
        } else {
            form.style.display = 'flex';
        }
    }
}