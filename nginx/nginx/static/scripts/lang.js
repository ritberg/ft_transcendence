import { userIsConnected } from "./users.js";

export function loadLanguage(lang) {
  fetch(`/static/lang/${lang}.json`)
    .then(response => response.json())
    .then(data => {
      // Informations section
      if (document.getElementById('user-name') && userIsConnected == false) {
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

      // online form
      if (document.getElementById('join-game-title')) {
        document.getElementById('join-game-title').textContent = data.online.title;
      }
      if (document.getElementById('room-name-label')) {
        document.getElementById('room-name-label').textContent = data.online.room_name;
      }
      if (document.getElementById('t-empty_room')) {
        document.getElementById('t-empty_room').textContent = data.online.empty_room;
      }
      if (document.getElementById('b-online-go')) {
        document.getElementById('b-online-go').textContent = data.online.go;
      }

      // user info
      if (document.getElementById('match-history-title')) {
        document.getElementById('match-history-title').textContent = data.user_info.match_history;
      }
      if (document.getElementById('stats-title')) {
        document.getElementById('stats-title').textContent = data.user_info.stats;
      }
      if (document.getElementById('stat-wins')) {
        document.getElementById('stat-wins').firstChild.textContent = data.user_info.wins;
      }
      if (document.getElementById('stat-losses')) {
        document.getElementById('stat-losses').firstChild.textContent = data.user_info.losses;
      }
      if (document.getElementById('stat-win-rate')) {
        document.getElementById('stat-win-rate').firstChild.textContent = data.user_info.win_rate;
      }
      if (document.getElementById('stat-goals-avg')) {
        document.getElementById('stat-goals-avg').firstChild.textContent = data.user_info.goals_avg;
      }
      if (document.getElementById('stat-goals-scored')) {
        document.getElementById('stat-goals-scored').firstChild.textContent = data.user_info.goals_scored;
      }
      if (document.getElementById('stat-goals-conceded')) {
        document.getElementById('stat-goals-conceded').firstChild.textContent = data.user_info.goals_conceded;
      }
      if (document.getElementById('stat-total-games')) {
        document.getElementById('stat-total-games').firstChild.textContent = data.user_info.total_games;
      }
      if (document.getElementById('stat-total-hours')) {
        document.getElementById('stat-total-hours').firstChild.textContent = data.user_info.total_hours;
      }

      // settings
      if (document.getElementById('user-logout')) {
        document.getElementById('user-logout').textContent = data.settings.logout;
      }
      if (document.getElementById('new-username')) {
        document.getElementById('new-username').placeholder = data.settings.new_username;
      }
      if (document.getElementById('new-email')) {
        document.getElementById('new-email').placeholder = data.settings.new_email;
      }
      if (document.getElementById('new-password')) {
        document.getElementById('new-password').placeholder = data.settings.new_password;
      }
      if (document.getElementById('update-profile')) {
        document.getElementById('update-profile').textContent = data.settings.update_profile;
      }
      if (document.getElementById('upload-avatar')) {
        document.getElementById('upload-avatar').textContent = data.settings.upload_avatar;
      }
      if (document.getElementById('enable-2fa')) {
        document.getElementById('enable-2fa').textContent = data.settings.enable_2fa;
      }
      if (document.getElementById('language-select-label')) {
        document.getElementById('language-select-label').textContent = data.settings.choose_language;
      }

      // game settings
      if (document.getElementById('settings-title')) {
        document.getElementById('settings-title').textContent = data.game.settings_title;
      }
      if (document.getElementById('t-players')) {
        document.getElementById('t-players').textContent = data.game.players;
      }
      if (document.getElementById('t-points')) {
        document.getElementById('t-points').textContent = data.game.points;
      }
      if (document.getElementById('b-tourney_settings')) {
        document.getElementById('b-tourney_settings').textContent = data.game.ok_button;
      }
      if (document.getElementById('player-names-title')) {
        document.getElementById('player-names-title').textContent = data.game.player_names_title;
      }

      // users lists
      if (document.getElementById('ulist-title')) {
        document.getElementById('ulist-title').textContent = data.users_lists.ulist_title;
      }
      if (document.getElementById('flist-title')) {
        document.getElementById('flist-title').textContent = data.users_lists.flist_title;
      }
      if (document.getElementById('requests-title')) {
        document.getElementById('requests-title').textContent = data.users_lists.requests_title;
      }

      // verify otp
      if (document.getElementById('otp-input')) {
        document.getElementById('otp-input').placeholder = data.verify_otp.enter_otp;
      }
      if (document.getElementById('verify-otp-button')) {
        document.getElementById('verify-otp-button').textContent = data.verify_otp.verify_otp;
      }

      // index
      if (document.getElementById('tabs-title')) {
        document.getElementById('tabs-title').textContent = data.index.tabs_title;
      }
      if (document.getElementById('home-button')) {
        document.getElementById('home-button').textContent = data.index.home_button;
      }
      if (document.getElementById('users-full-list-button')) {
        document.getElementById('users-full-list-button').textContent = data.index.users_button;
      }
      if (document.getElementById('settings-button')) {
        document.getElementById('settings-button').textContent = data.index.settings_button;
      }
    });
}
