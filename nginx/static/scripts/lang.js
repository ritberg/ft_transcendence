import { userIsConnected } from "./users.js";
import { token, getUserId, username_global } from "./users.js";
import { errorMsg, sleep } from "./utils.js";
import { closeWebSocket, openWebSocket } from "./userStatus.js";

export function loadLanguage(lang) {
  if (lang === undefined)
    return;
  fetch(`/static/lang/${lang}.json`)
    .then(response => response.json())
    .then(data => {
      // Informations section
      if (document.getElementById('user-name') && userIsConnected == false)
        document.getElementById('user-name').textContent = data.info.default_username;

      // signin form
      if (document.getElementById('signin-title'))
        document.getElementById('signin-title').textContent = data.signin.title;
      if (document.getElementById('signin-username'))
        document.getElementById('signin-username').textContent = data.signin.username;
      if (document.getElementById('signin-password'))
        document.getElementById('signin-password').textContent = data.signin.password;
      if (document.getElementById('login-otp-input'))
        document.getElementById('login-otp-input').placeholder = data.signin.otp_enter;
      if (document.getElementById('verif-button'))
        document.getElementById('verif-button').textContent = data.signin.otp_verif;
      if (document.getElementById('b-signin-ok'))
        document.getElementById('b-signin-ok').textContent = data.signin.ok;
      if (document.getElementById('signup-switch')) {
        document.getElementById('signup-switch').textContent = `${data.signup.switch}\u00A0`;
        const link = document.createElement('a');
        link.href = "/signin/";
        link.id = "b-to_signin";
        link.textContent = data.signup.signin;
        document.getElementById('signup-switch').appendChild(link);
      }

      // signup form
      if (document.getElementById('signup-title'))
        document.getElementById('signup-title').textContent = data.signup.title;
      if (document.getElementById('signup-username'))
        document.getElementById('signup-username').textContent = data.signup.username;
      if (document.getElementById('signup-email'))
        document.getElementById('signup-email').textContent = data.signup.email;
      if (document.getElementById('signup-password'))
        document.getElementById('signup-password').textContent = data.signup.password;
      if (document.getElementById('signup-password-confirmation'))
        document.getElementById('signup-password-confirmation').textContent = data.signup.password_confirmation;
      if (document.getElementById('b-signup-ok'))
        document.getElementById('b-signup-ok').textContent = data.signup.ok;
      if (document.getElementById('signin-switch')) {
        document.getElementById('signin-switch').textContent = `${data.signin.switch}\u00A0`;
        const link = document.createElement('a');
        link.href = "/signup/";
        link.id = "b-to_signup";
        link.textContent = data.signin.signup;
        document.getElementById('signin-switch').appendChild(link);
      }

      // main menu
      if (document.getElementById('main-title'))
        document.getElementById('main-title').textContent = data.main.title;
      if (document.getElementById('pvp-mode'))
        document.getElementById('pvp-mode').textContent = data.main.pvp_mode;
      if (document.getElementById('cpu-mode'))
        document.getElementById('cpu-mode').textContent = data.main.cpu_mode;
      if (document.getElementById('tourney-mode'))
        document.getElementById('tourney-mode').textContent = data.main.tourney_mode;
      if (document.getElementById('online-mode'))
        document.getElementById('online-mode').textContent = data.main.online_mode;

      // online form
      if (document.getElementById('join-game-title'))
        document.getElementById('join-game-title').textContent = data.online.title;
      if (document.getElementById('room-name-label'))
        document.getElementById('room-name-label').textContent = data.online.room_name;
      if (document.getElementById('t-empty_room'))
        document.getElementById('t-empty_room').textContent = data.online.empty_room;
      if (document.getElementById('b-online-go'))
        document.getElementById('b-online-go').textContent = data.online.go;

      // user info
      if (document.getElementById('match-history-title'))
        document.getElementById('match-history-title').textContent = data.user_info.match_history;
      if (document.getElementById('stats-title'))
        document.getElementById('stats-title').textContent = data.user_info.stats;
      if (document.getElementById('stat-wins'))
        document.getElementById('stat-wins').firstChild.textContent = data.user_info.wins;
      if (document.getElementById('stat-losses'))
        document.getElementById('stat-losses').firstChild.textContent = data.user_info.losses;
      if (document.getElementById('stat-win-rate'))
        document.getElementById('stat-win-rate').firstChild.textContent = data.user_info.win_rate;
      if (document.getElementById('stat-goals-avg'))
        document.getElementById('stat-goals-avg').firstChild.textContent = data.user_info.goals_avg;
      if (document.getElementById('stat-goals-scored'))
        document.getElementById('stat-goals-scored').firstChild.textContent = data.user_info.goals_scored;
      if (document.getElementById('stat-goals-conceded'))
        document.getElementById('stat-goals-conceded').firstChild.textContent = data.user_info.goals_conceded;
      if (document.getElementById('stat-total-games'))
        document.getElementById('stat-total-games').firstChild.textContent = data.user_info.total_games;
      if (document.getElementById('stat-total-hours'))
        document.getElementById('stat-total-hours').firstChild.textContent = data.user_info.total_hours;

      // settings
      if (document.getElementById('user-logout'))
        document.getElementById('user-logout').textContent = data.settings.logout;
      if (document.getElementById('l-new-username'))
        document.getElementById('l-new-username').textContent = data.settings.new_username;
      if (document.getElementById('l-new-email'))
        document.getElementById('l-new-email').textContent = data.settings.new_email;
      if (document.getElementById('l-new-password'))
        document.getElementById('l-new-password').textContent = data.settings.new_password;
      if (document.getElementById('update-profile'))
        document.getElementById('update-profile').textContent = data.settings.update_profile;
      if (document.getElementById('upload-avatar'))
        document.getElementById('upload-avatar').textContent = data.settings.upload_avatar;
      const toggle2FAButton = document.getElementById('toggle-2fa-button');
      if (toggle2FAButton) {
        if (toggle2FAButton.classList.contains('enable2FA'))
          toggle2FAButton.textContent = data.settings.enable_2fa;
        else if (toggle2FAButton.classList.contains('disable2FA'))
          toggle2FAButton.textContent = data.settings.disable_2fa;
        else if (toggle2FAButton.classList.contains('cancel2FA') && !toggle2FAButton.classList.contains('disable2FA'))
          toggle2FAButton.textContent = data.settings.cancel_2fa;
      }
      if (document.getElementById('language-select-label'))
        document.getElementById('language-select-label').textContent = data.settings.choose_language;
      console.log("fsdafsad", data.settings.otp_verif1);
      if (document.getElementById('verif-button1'))
        document.getElementById('verif-button1').textContent = data.settings.otp_verif1;

      // game settings
      if (document.getElementById('settings-title'))
        document.getElementById('settings-title').textContent = data.game.settings_title;
      if (document.getElementById('t-players'))
        document.getElementById('t-players').textContent = data.game.players;
      if (document.getElementById('t-points'))
        document.getElementById('t-points').textContent = data.game.points;
      if (document.getElementById('b-tourney_settings'))
        document.getElementById('b-tourney_settings').textContent = data.game.ok_button;
      if (document.getElementById('player-names-title'))
        document.getElementById('player-names-title').textContent = data.game.player_names_title;

      // users lists
      if (document.getElementById('ulist-title'))
        document.getElementById('ulist-title').textContent = data.users_lists.ulist_title;
      if (document.getElementById('flist-title'))
        document.getElementById('flist-title').textContent = data.users_lists.flist_title;
      if (document.getElementById('requests-title'))
        document.getElementById('requests-title').textContent = data.users_lists.requests_title;
      if (document.getElementById('users-not-allowed'))
        document.getElementById('users-not-allowed').textContent = data.users_lists.not_allowed;

      // verify otp
      if (document.getElementById('otp-input'))
        document.getElementById('otp-input').placeholder = data.verify_otp.enter_otp;
      if (document.getElementById('verify-otp-button'))
        document.getElementById('verify-otp-button').textContent = data.verify_otp.verify_otp;

      // index
      if (document.getElementById('tabs-title'))
        document.getElementById('tabs-title').textContent = data.index.tabs_title;
      if (document.getElementById('home-id'))
        document.getElementById('home-id').textContent = data.index.home_button;
      if (document.getElementById('users-id'))
        document.getElementById('users-id').textContent = data.index.users_button;
      if (document.getElementById('settings-id'))
        document.getElementById('settings-id').textContent = data.index.settings_button;
    });
}

let fetchLanguageUrl = "https://" + window.location.host + "/auth/get-language/";
export async function fetchLanguage() {

  return await fetch(fetchLanguageUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": token,
    },
    credentials: "include",
  })
    .then(async (response) => {
      if (!response.ok) {
        const error = await response.json();
        errorMsg(error.message);
        return null;
      }
      return response.json();
    })
    .then((data) => {
      if (data !== null) {
        console.log(data);
        return data.language;
      }
    })
}

let changeLanguageUrl = "https://" + window.location.host + "/auth/change-language/";

export async function changeLanguage(language) {
  if (userIsConnected == false) {
    errorMsg("You need an account to set a profile language");
    return;
  }

  if (!language) {
    errorMsg("no language selected");
    return;
  }

  await closeWebSocket();
  await sleep(100);

  return await fetch(changeLanguageUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": token,
    },
    body: JSON.stringify({ language: language }),
    credentials: "include",
  })
    .then(async (response) => {
      if (!response.ok) {
        const error = await response.json();
        errorMsg(error.message);
        return null;
      }
      return response.json();
    })
    .then(async (data) => {
      let user_id = await getUserId(username_global);
      await openWebSocket(user_id);
      if (data !== null) {
        return data;
      }
      else
        return null;
    })
}
