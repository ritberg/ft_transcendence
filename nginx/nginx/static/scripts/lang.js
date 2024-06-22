document.addEventListener('DOMContentLoaded', (event) => {
  const savedLang = localStorage.getItem('selectedLang') || (navigator.language.startsWith('en') ? 'fr' : 'en');
  loadLanguage(savedLang);
});

export function loadLanguage(lang) {
  fetch(`/static/lang/${lang}.json`)
    .then(response => response.json())
    .then(data => {
      // Informations section
      if (document.getElementById('user-name')) {
        document.getElementById('user-name').textContent = data.info.default_username;
      }

      // signin form
      if (document.getElementById('signin-title')) {
        document.getElementById('signin-title').textContent = data.signin.title;
      }
      if (document.getElementById('signin-username')) {
        document.getElementById('signin-username').textContent = data.signin.username;
      }
      if (document.getElementById('signin-password')) {
        document.getElementById('signin-password').textContent = data.signin.password;
      }
      if (document.getElementById('b-signin-ok')) {
        document.getElementById('b-signin-ok').textContent = data.signin.ok;
      }
      if (document.getElementById('signup-switch')) {
        document.getElementById('signup-switch').textContent = data.signup.switch;
        const link = document.createElement('a');
        link.href = "/signin/";
        link.id = "b-to_signin";
        link.textContent = data.signup.signin;
        document.getElementById('signup-switch').appendChild(link);
      }

      // signup form
      if (document.getElementById('signup-title')) {
        document.getElementById('signup-title').textContent = data.signup.title;
      }
      if (document.getElementById('signup-username')) {
        document.getElementById('signup-username').textContent = data.signup.username;
      }
      if (document.getElementById('signup-email')) {
        document.getElementById('signup-email').textContent = data.signup.email;
      }
      if (document.getElementById('signup-password')) {
        document.getElementById('signup-password').textContent = data.signup.password;
      }
      if (document.getElementById('b-signup-ok')) {
        document.getElementById('b-signup-ok').textContent = data.signup.ok;
      }
      if (document.getElementById('signin-switch')) {
        document.getElementById('signin-switch').textContent = data.signin.switch;
        const link = document.createElement('a');
        link.href = "/signup/";
        link.id = "b-to_signup";
        link.textContent = data.signin.signup;
        document.getElementById('signin-switch').appendChild(link);
      }

      // main menu
      if (document.getElementById('main-title')) {
        document.getElementById('main-title').textContent = data.main.title;
      }
      if (document.getElementById('pvp-mode')) {
        document.getElementById('pvp-mode').textContent = data.main.pvp_mode;
      }
      if (document.getElementById('cpu-mode')) {
        document.getElementById('cpu-mode').textContent = data.main.cpu_mode;
      }
      if (document.getElementById('tourney-mode')) {
        document.getElementById('tourney-mode').textContent = data.main.tourney_mode;
      }
      if (document.getElementById('online-mode')) {
        document.getElementById('online-mode').textContent = data.main.online_mode;
      }
    });
}
