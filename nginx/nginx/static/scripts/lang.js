document.addEventListener('DOMContentLoaded', (event) => {
  // const langSelect = document.getElementById('language-select');
  const langSelect = 'fr';
  const savedLang = localStorage.getItem('selectedLang') || navigator.language.startsWith('fr') ? 'fr' : 'en';

  // Définir la langue sélectionnée dans le sélecteur
  // langSelect.value = savedLang;

  // Charger le fichier JSON approprié
  loadLanguage(savedLang);
});

export function loadLanguage(lang) {
  let url = window.location.pathname;
  fetch(`/static/lang/${lang}.json`)
    .then(response => response.json())
    .then(data => {
      // Informations section
      document.getElementById('info').textContent = data.info.info;
      document.getElementById('user-name').textContent = data.info.default_username;

      // Profil section
      if (url == "/profile/")
      document.getElementById('new-username').placeholder = data.profile.username_placeholder;
      document.getElementById('new-email').placeholder = data.profile.email_placeholder;
      document.getElementById('new-password').placeholder = data.profile.password_placeholder;
      document.getElementById('update-profile').textContent = data.profile.update_profile_button;

      document.getElementById('user-name').textContent = data.profile.user_name;
      document.getElementById('info').textContent = data.profile.info;
      document.getElementById('user-logout').textContent = data.profile.user_logout;
      document.getElementById('upload-avatar').textContent = data.profile.upload_avatar;

      // Add friend section
      document.getElementById('add-friend-title').textContent = data.add_friend.title;
      document.getElementById('friend-username-to-add').placeholder = data.add_friend.username_placeholder;
      document.getElementById('add-friend-btn').textContent = data.add_friend.add_button;

      // Del friend section
      document.getElementById('del-friend-title').textContent = data.del_friend.title;
      document.getElementById('friend-username-to-del').placeholder = data.del_friend.username_placeholder;
      document.getElementById('del-friend-btn').textContent = data.del_friend.del_button;

      // Friends list
      document.getElementById('friend-list-title').textContent = data.friend_list.title;
      document.getElementById('friend-requests-title').textContent = data.friend_requests.title;
      document.getElementById('refresh-btn').textContent = data.refresh_button;

      // Login section
      document.getElementById('login-title').textContent = data.login.login_title;
      document.querySelector('.login-form input[name="username"]').placeholder = data.login.username_placeholder;
      document.querySelector('.login-form input[name="password"]').placeholder = data.login.password_placeholder;
      document.getElementById('login-submit').textContent = data.login.login_button;
      document.getElementById('remember-me-text').textContent = data.login.remember_me;
      document.getElementById('forgot-pw').textContent = data.login.forgot_password;
      document.getElementById('signup-prompt').textContent = data.login.signup_prompt;
      document.getElementById('signup').textContent = data.login.signup_link;

      // Signup section
      document.getElementById('signup-title').textContent = data.signup.signup_title;
      document.querySelector('.signup-form input[name="username"]').placeholder = data.signup.username_placeholder;
      document.querySelector('.signup-form input[name="email"]').placeholder = data.signup.email_placeholder;
      document.querySelector('.signup-form input[name="password"]').placeholder = data.signup.password_placeholder;
      document.querySelector('.signup-form input[name="password-confirmation"]').placeholder = data.signup.password_confirmation_placeholder;
      document.getElementById('signup-submit').textContent = data.signup.signup_button;
      document.getElementById('login-prompt').textContent = data.signup.login_prompt;
      document.getElementById('login').textContent = data.signup.login_link;
    });
}
