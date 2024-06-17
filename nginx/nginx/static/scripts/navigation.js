import { GameMode } from './main.js';
import { route } from './router.js';
import { sleep } from './utils.js';
import { signupButton, loginButton, logoutButton, userIsConnected } from './users.js';
import { displayProfile } from './stats.js';

/////////// CONTENT //////////////
const contentContainer = document.getElementById("content");
contentContainer.addEventListener("click", async function (event) {
    let url = window.location.pathname;
    if (event.target && event.target.id === "b-signin-ok") {
        await loginButton(event);
        if (userIsConnected == true)
            route('/');
    }
    else if (event.target && event.target.id === "b-signup-ok") {
        signupButton(event);
    }
    else if (event.target && event.target.id === "pvp-mode") {
        if (url == "/") {
            document.getElementById("main-menu").classList.remove("shown");
            document.getElementById("main-menu").classList.add("hidden");
            await sleep(500);
        }
        route("/pvp/");
    }
    else if (event.target && event.target.id === "tourney-mode") {
        if (url == "/") {
            document.getElementById("main-menu").classList.remove("shown");
            document.getElementById("main-menu").classList.add("hidden");
            await sleep(500);
        }
        route("/tourney/");
    }
    else if (event.target && event.target.id === "online-mode") {
        if (url == "/") {
            document.getElementById("main-menu").classList.remove("shown");
            document.getElementById("main-menu").classList.add("hidden");
            await sleep(500);
        }
        route("/online/");
    }
    else if (event.target && event.target.id === "cpu-mode") {
        document.getElementById("main-menu").classList.add("hidden");
        GameMode(1);
    }
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
    else if (event.target && event.target.id === "logout") {
        logoutButton();
        route("/");
    }
    else if (event.target && event.target.id === "profile") {
        displayProfile();
    }
});

////////// PROFILE ///////////
document.getElementById("profile_tab").addEventListener("click", async function (event){
    event.preventDefault();
    let url = window.location.pathname;
    if (url === "/profile/" || url === "/signin/" || url === "/signup/")
    {	
        route('/');
    }
    else if (userIsConnected == true)
    {
        if (url == "/") {
            document.getElementById("main-menu").classList.remove("shown");
            document.getElementById("main-menu").classList.add("hidden");
            await sleep(500);
        }
        route('/profile/');
        // await sleep(100);
        // document.getElementById("user-info-box").style.opacity = "0";
        // document.getElementById("user-info-box").classList.remove("hidden");
        // document.getElementById("user-info-box").classList.add("shown");
    }
    else if (userIsConnected == false)
    {
        if (url == "/") {
            document.getElementById("main-menu").classList.remove("shown");
            document.getElementById("main-menu").classList.add("hidden");
            await sleep(500);
        }
        route('/signin/');
    }
    console.log("fdsafdsa", userIsConnected);
});

////////// USERS_LIST ///////////
document.getElementById("home-button").addEventListener("click", async function (event) {
	route("/");
});

document.getElementById("users-full-list-button").addEventListener("click", async function (event) {					//// frontend
    event.preventDefault();
    if (window.location.pathname === "/users/") {
        route("/");
    }
    else {
        if (window.location.pathname === "/") {
            document.getElementById("main-menu").classList.remove("shown");
            document.getElementById("main-menu").classList.add("hidden");
            await sleep(500);
        }
        route("/users/");
    }
});
