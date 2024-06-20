import { GameMode } from './main.js';
import { route } from './router.js';
import { sleep } from './utils.js';
import { signupButton, loginButton, logoutFunc, userIsConnected, uploadPicture, updateUser } from './users.js';
import { displayProfile } from './stats.js';
import { tournamentSettings } from './animations.js';

document.addEventListener('DOMContentLoaded', () => {
	/////////// CONTENT //////////////
	const contentContainer = document.getElementById("content");
	contentContainer.addEventListener("click", async function (event) {
		let url = window.location.pathname;
		if (url == "/" && event.target.id !== "content") {
			document.getElementById("content").style.pointerEvents = "none";
			document.getElementById("content").classList.remove("shown");
			document.getElementById("content").classList.add("hidden");
			await sleep(500);
			document.getElementById("content").style.pointerEvents = "auto";
		}
		if (event.target && event.target.id === "b-signin-ok") {
			await loginButton(event);
			if (userIsConnected == true)
				route('/');
		}
		else if (event.target && event.target.id === "b-signup-ok") {
			signupButton(event);
		}
		else if (event.target && event.target.id === "pvp-mode") {
			route("/pvp/");
		}
		else if (event.target && event.target.id === "cpu-mode") {
			route("/bot/");
		}
		else if (event.target && event.target.id === "tourney-mode") {
			route("/tourney/");
		}
		else if (event.target && event.target.id === "online-mode") {
			route("/online/");
		}
		// else if (event.target && event.target.id === "cpu-mode") {
		//     document.getElementById("main-menu").classList.add("hidden");
		//     GameMode(1);
		// }
		else if (event.target && event.target.id === "b-tourney_settings") {
			tournamentSettings();
		}
		else if (event.target && event.target.id === "b-online-go"){
			GameMode(3);
		}
		else if (event.target && event.target.id === "refresh-stats") {
			// addGame();
			displayProfile();
		}
		// else if (event.target && event.target.id === "logout") {
		// 	logoutButton();
		// 	route("/");
		// }
		else if (event.target && event.target.id === "user-logout") {
			logoutFunc();
		}
		else if (event.target && event.target.id === "upload-avatar") {
			uploadPicture();
		}
		else if (event.target && event.target.id === "update-profile") {
			updateUser();
		}
		else if (event.target && event.target.id === "profile") {
			displayProfile();
		}
		document.getElementById("content").classList.remove("hidden");
		document.getElementById("content").classList.add("shown");
		//document.getElementById("content").style.opacity = "1";
	});

	////////// PROFILE ///////////
	document.getElementById("profile_tab").addEventListener("click", async function (event){
		event.preventDefault();
		let url = window.location.pathname;
		document.getElementById("content").classList.remove("shown");
		document.getElementById("content").classList.add("hidden");
		await sleep(500);
		if (url === "/profile/")
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
			route('/profile/');
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
