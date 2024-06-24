import { GameMode } from './main.js';
import { route } from './router.js';
import { sleep, errorMsg } from './utils.js';
import { signupButton, loginButton, userIsConnected, username_global } from './users.js';
import { updateUser, logoutFunc } from './settings.js';
import { displayProfile} from './stats.js';
import { tournamentSettings } from './animations.js';
import { loadLanguage, changeLanguage } from './lang.js';

document.addEventListener('DOMContentLoaded', () => {
	/////////// CONTENT //////////////
	const contentContainer = document.getElementById("content");
	contentContainer.addEventListener("click", async function (event) {
		let url = window.location.pathname;
		if (url == "/" && event.target.tagName === "BUTTON") {
			document.getElementById("content").style.pointerEvents = "none";
			document.getElementById("content").classList.remove("shown");
			document.getElementById("content").classList.add("hidden");
			await sleep(500);
			document.getElementById("content").style.pointerEvents = "auto";
		}
		if (event.target && event.target.id === "b-signin-ok") {
			await loginButton(event);
			document.getElementById("content").classList.remove("hidden");
			document.getElementById("content").classList.add("shown");
		}
		else if (event.target && event.target.id === "b-signup-ok") {
			signupButton(event);
			document.getElementById("content").classList.remove("hidden");
			document.getElementById("content").classList.add("shown");
		}
		else if (event.target && event.target.id === "pvp-mode") {
			route("/pvp/");
			document.getElementById("content").classList.remove("hidden");
			document.getElementById("content").classList.add("shown");
		}
		else if (event.target && event.target.id === "cpu-mode") {
			route("/bot/");
			document.getElementById("content").classList.remove("hidden");
			document.getElementById("content").classList.add("shown");
		}
		else if (event.target && event.target.id === "tourney-mode") {
			route("/tourney/");
			document.getElementById("content").classList.remove("hidden");
			document.getElementById("content").classList.add("shown");
		}
		else if (event.target && event.target.id === "online-mode") {
			route("/online/");
			document.getElementById("content").classList.remove("hidden");
			document.getElementById("content").classList.add("shown");
		}
		// else if (event.target && event.target.id === "cpu-mode") {
		//     document.getElementById("main-menu").classList.add("hidden");
		//     GameMode(1);
		// }
		else if (event.target && event.target.id === "b-tourney_settings") {
			tournamentSettings();
			document.getElementById("content").classList.remove("hidden");
			document.getElementById("content").classList.add("shown");
		}
		else if (event.target && event.target.id === "b-online-go"){
			GameMode(3);
			document.getElementById("content").classList.remove("hidden");
			document.getElementById("content").classList.add("shown");
		}
		// else if (event.target && event.target.id === "refresh-stats") {
		// 	// addGame();
		// 	displayProfile();
		// }
		// else if (event.target && event.target.id === "logout") {
		// 	logoutButton();
		// 	route("/");
		// }
		else if (event.target && event.target.id === "user-logout") {
			logoutFunc();
			document.getElementById("content").classList.remove("hidden");
			document.getElementById("content").classList.add("shown");
		}
		// else if (event.target && event.target.id === "upload-avatar") {
		// 	uploadPicture();
		// 	document.getElementById("content").classList.remove("hidden");
		// 	document.getElementById("content").classList.add("shown");
		// }
		else if (event.target && event.target.id === "update-profile") {
			updateUser();
			document.getElementById("content").classList.remove("hidden");
			document.getElementById("content").classList.add("shown");
		}
		else if (event.target && event.target.id === "profile") {
			displayProfile(username_global);
			document.getElementById("content").classList.remove("hidden");
			document.getElementById("content").classList.add("shown");
		}
		else if (event.target && event.target.id === "user_profile" || event.target && event.target.id === "friend_profile") {
			let username = event.target.innerText;
			if (username)
				route("/profile/" + username + "/");
			document.getElementById("content").classList.remove("hidden");
			document.getElementById("content").classList.add("shown");
		}
		// else if (event.target && event.target.id === "change")
		// {
		// 	const selectedLang = event.target.value;
		// 	localStorage.setItem('selectedLang', selectedLang);
		// 	loadLanguage(selectedLang);
		// }
		// document.getElementById("content").classList.remove("hidden");
		// document.getElementById("content").classList.add("shown");
		//document.getElementById("content").style.opacity = "1";
	});

	contentContainer.addEventListener("change", async function (event) {
		event.preventDefault();
		if (event.target && event.target.id === "language-select-settings") {
			console.log("fdsa");
			const selectedLanguage = event.target.value;
			let response = await changeLanguage(selectedLanguage);
			if (response == null)
				return;
			document.getElementById('language-select-menu').value = selectedLanguage;
			localStorage.setItem('preferredLanguage', selectedLanguage);
			loadLanguage(selectedLanguage);
		}
		if (event.target && event.target.id === "avatar-input") {
			let file = document.getElementById("avatar-input").files[0];
			if (file == null || file.type == "") {
				errorMsg("please select a file");
				return;
			}
			const reader = new FileReader();
			reader.onload = function(e) {
				document.getElementById("user-avatar").src = e.target.result;
			};
			reader.readAsDataURL(file);
		}
	});

	// contentContainer.addEventListener("submit", async function (event) {
	// 	if (event.target && event.target.id === "avatar-input") {
	// 		console.log("hi");
	// 	}
	// });

	document.getElementById('language-select-menu').addEventListener('change', function () {
		const selectedLanguage = this.value;
		localStorage.setItem('preferredLanguage', selectedLanguage);
		console.log('Language preference saved:', selectedLanguage);
		loadLanguage(selectedLanguage);
	});

	////////// PROFILE ///////////
	document.getElementById("profile_tab").addEventListener("click", async function (event){
		event.preventDefault();
		let url = window.location.pathname;
		document.getElementById("content").classList.remove("shown");
		document.getElementById("content").classList.add("hidden");
		await sleep(500);
		if (url === "/profile/" + username_global + "/")
			route('/');
		else if (url === "/signin/")
			route('/');
		else if (url === "/signup/")
			route('/');
		else if (userIsConnected == true)
		{
			if (url == "/") {
				document.getElementById("content").classList.remove("shown");
				document.getElementById("content").classList.add("hidden");
			}
			route('/profile/' + username_global + "/");
		}
		else if (userIsConnected == false)
			route('/signin/');
		document.getElementById("content").classList.remove("hidden");
		document.getElementById("content").classList.add("shown");
		console.log("fdsafdsa", userIsConnected);
	});

	////////// USERS_LIST ///////////
	document.getElementById("home-button").addEventListener("click", async function (event) {
		document.getElementById("content").classList.remove("shown");
		document.getElementById("content").classList.add("hidden");
		await sleep(500);
		route("/");
		document.getElementById("content").classList.remove("hidden");
		document.getElementById("content").classList.add("shown");
	});

	document.getElementById("users-full-list-button").addEventListener("click", async function (event) {					//// frontend
		event.preventDefault();
		document.getElementById("content").classList.remove("shown");
		document.getElementById("content").classList.add("hidden");
		await sleep(500);
		if (window.location.pathname === "/users/")
			route("/");
		else
			route("/users/");
		document.getElementById("content").classList.remove("hidden");
		document.getElementById("content").classList.add("shown");
	});
});

document.getElementById("settings-button").addEventListener("click", async function (event) {					//// frontend
	event.preventDefault();
	document.getElementById("content").classList.remove("shown");
	document.getElementById("content").classList.add("hidden");
	await sleep(500);
	if (window.location.pathname === "/settings/")
		route("/");
	else
		route("/settings/");
	document.getElementById("content").classList.remove("hidden");
	document.getElementById("content").classList.add("shown");
});
