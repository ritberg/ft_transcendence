document.addEventListener('DOMContentLoaded', (event) => {
  const langSelect = document.getElementById('language-select');
  const savedLang = localStorage.getItem('selectedLang') || navigator.language.startsWith('fr') ? 'fr' : 'en';

  // Définir la langue sélectionnée dans le sélecteur
  langSelect.value = savedLang;

  // Charger le fichier JSON approprié
  loadLanguage(savedLang);

  langSelect.addEventListener('change', (event) => {
    const selectedLang = event.target.value;
    localStorage.setItem('selectedLang', selectedLang);
    loadLanguage(selectedLang);
  });
});

// function loadLanguage(lang) {
//   fetch(`${STATIC_URL}lang/${lang}.json`)
//     .then(response => response.json())
//     .then(data => {
//       // Informations section
//       document.getElementById('info').textContent = data.info.info;
//       document.getElementById('user-name').textContent = data.info.default_username;

//       // Profil section
//       document.getElementById('new-username').placeholder = data.profile.username_placeholder;
//       document.getElementById('new-email').placeholder = data.profile.email_placeholder;
//       document.getElementById('new-password').placeholder = data.profile.password_placeholder;
//       document.getElementById('update-profile').textContent = data.profile.update_profile_button;

//       document.getElementById('user-name').textContent = data.profile.user_name;
//       document.getElementById('info').textContent = data.profile.info;
//       document.getElementById('user-logout').textContent = data.profile.user_logout;
//       document.getElementById('upload-avatar').textContent = data.profile.upload_avatar;

//       // Add friend section
//       document.getElementById('add-friend-title').textContent = data.add_friend.title;
//       document.getElementById('friend-username-to-add').placeholder = data.add_friend.username_placeholder;
//       document.getElementById('add-friend-btn').textContent = data.add_friend.add_button;

//       // Del friend section
//       document.getElementById('del-friend-title').textContent = data.del_friend.title;
//       document.getElementById('friend-username-to-del').placeholder = data.del_friend.username_placeholder;
//       document.getElementById('del-friend-btn').textContent = data.del_friend.del_button;

//       // Friends list
//       document.getElementById('friend-list-title').textContent = data.friend_list.title;
//       document.getElementById('friend-requests-title').textContent = data.friend_requests.title;
//       document.getElementById('refresh-btn').textContent = data.refresh_button;

//       // Login section
//       document.getElementById('login-title').textContent = data.login.login_title;
//       document.querySelector('.login-form input[name="username"]').placeholder = data.login.username_placeholder;
//       document.querySelector('.login-form input[name="password"]').placeholder = data.login.password_placeholder;
//       document.getElementById('login-submit').textContent = data.login.login_button;
//       document.getElementById('remember-me-text').textContent = data.login.remember_me;
//       document.getElementById('forgot-pw').textContent = data.login.forgot_password;
//       document.getElementById('signup-prompt').textContent = data.login.signup_prompt;
//       document.getElementById('signup').textContent = data.login.signup_link;

//       // Signup section
//       document.getElementById('signup-title').textContent = data.signup.signup_title;
//       document.querySelector('.signup-form input[name="username"]').placeholder = data.signup.username_placeholder;
//       document.querySelector('.signup-form input[name="email"]').placeholder = data.signup.email_placeholder;
//       document.querySelector('.signup-form input[name="password"]').placeholder = data.signup.password_placeholder;
//       document.querySelector('.signup-form input[name="password-confirmation"]').placeholder = data.signup.password_confirmation_placeholder;
//       document.getElementById('signup-submit').textContent = data.signup.signup_button;
//       document.getElementById('login-prompt').textContent = data.signup.login_prompt;
//       document.getElementById('login').textContent = data.signup.login_link;
//     });
// }

function loadLanguage(lang) {
  fetch(`${STATIC_URL}lang/${lang}.json`)
    .then(response => response.json())
    .then(data => {
      // Hamburger Icon and Language Switch
      document.querySelector('.language-switch label').textContent = data.language_switch.label;
      document.querySelectorAll('#language-select option')[0].textContent = data.language_switch.english;
      document.querySelectorAll('#language-select option')[1].textContent = data.language_switch.french;
      document.querySelectorAll('#language-select option')[2].textContent = data.language_switch.spanish;

      // Vertical Tab
      document.getElementById('chat-button').textContent = data.vertical_tab.chat;
      document.getElementById('profile-button').textContent = data.vertical_tab.profile;
      document.querySelector('#vertical-tab button:nth-child(3)').textContent = data.vertical_tab.friends;
      document.querySelector('#vertical-tab button:nth-child(4)').textContent = data.vertical_tab.settings;

      // Chat Box
      document.getElementById('chat-box').querySelector('h6').textContent = data.chat_box.sample_message;

      // Profile Box
      document.getElementById('profile-box').querySelector('h6').textContent = data.profile_box.username;
      document.getElementById('profile-box').querySelector('img').alt = data.profile_box.avatar_alt;

      // Main Buttons
      document.getElementById('pvp-mode').textContent = data.main_buttons.pvp;
      document.getElementById('cpu-mode').textContent = data.main_buttons.cpu;
      document.getElementById('tournoi-mode').textContent = data.main_buttons.tournament;
      document.getElementById('online-mode').textContent = data.main_buttons.online;

      // Login Box
      document.getElementById('login-box').querySelector('h1').textContent = data.login_box.title;
      document.getElementById('room_name_input').placeholder = data.login_box.room_name_placeholder;
      document.getElementById('empty_room_text').textContent = data.login_box.empty_room_text;
      document.getElementById('GO_O').textContent = data.login_box.go_button;

      // Profile Box Main
      document.getElementById('profile-box_main').querySelector('h1').textContent = data.profile_box_main.title;
      document.getElementById('profile-box_main').querySelector('form .user-box:nth-child(1) input').placeholder = data.profile_box_main.username_placeholder;
      document.getElementById('profile-box_main').querySelector('form .user-box:nth-child(2) input').placeholder = data.profile_box_main.email_placeholder;
      document.getElementById('profile-box_main').querySelector('form .user-box:nth-child(3) input').placeholder = data.profile_box_main.password_placeholder;
      document.getElementById('profile-box_main').querySelector('form button').textContent = data.profile_box_main.go_button;

      // Tourney Box
      document.getElementById('tournoi').querySelector('h1').textContent = data.tourney.title;
      document.getElementById('PLAYERS_T').textContent = data.tourney.players;
      document.getElementById('DIFFICULTY_T').textContent = data.tourney.difficulty;
      document.getElementById('MODE_T').textContent = data.tourney.mode;
      document.getElementById('OK_T').textContent = data.tourney.ok_button;

      // Brackets
      document.getElementById('brackets').querySelector('i').setAttribute('title', data.brackets.title);

      // Nickname Setup Box
      document.getElementById('nickname_setup_box').querySelector('h1').textContent = data.nickname_setup_box.title;
    });
}
