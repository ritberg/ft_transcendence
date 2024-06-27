import { displayProfile } from "./stats.js";
import { usersClick, getUserId, userIsConnected } from "./users.js";
import { displaySettings } from "./settings.js";
import { GameMode } from "./main.js";
import { modifyDelta,stars } from './stars.js';
import { change_loop_exec } from "../games/pong_tourney.js";
import { errorMsg } from "./utils.js";
import { loadLanguage } from './lang.js';
import { updateStatus } from "./userStatus.js";


export const game = {
    game_type : null,
    game_class: null,
    animation_id : null,
    ws : null,
};

let route;
document.addEventListener('DOMContentLoaded', () => {
	const routes = {
		404: {
			template: "/templates/404.html",
			title: "404",
		},
		"/": {
			template: "/templates/index.html",
			title: "Pong",
		},
		"/signin/": {
			template: "/templates/signin.html",
			title: "Signin",
		},
		"/signup/": {
			template: "/templates/signup.html",
			title: "Signup",
		},
		"/users/": {
			template: "/templates/users.html",
			title: "Users",
		},
		"/online/": {
			template: "/templates/online.html",
			title: "Online",
		},
		"/tourney/": {
			template: "/templates/tourney.html",
			title: "Tournament",
		},
		"/profile/:username/": {
			template: "/templates/profile.html",
			title: "Profile",
		},
		"/pvp/": {
			template: "/templates/pvp.html",
			title: "PVP",
		},
		"/bot/": {
			template: "/templates/bot.html",
			title: "bot",
		},
		"/settings/": {
			template: "/templates/settings.html",
			title: "Settings",
		},
	}

	document.addEventListener("click", (e) => {
		const { target } = e;
		if (!target.matches("#profile_tab a, #user-name a, #online-mode a, #signup-switch a, #signin-switch a, #tabs-list a, #tourney-mode a")) {
			return;
		}
		e.preventDefault();
		route(e);
	});

	route = (url) => {
		if (typeof url !== 'string') {
			let event = url || window.event; // get window.event if event argument not provided
			event.preventDefault();
			url = event.target.href;
		}
		// window.history.pushState(state, unused, target link);
		window.history.pushState({}, "", url);
		locationHandler();
	};

	const locationHandler = async () => {
		let location = window.location.pathname; // get the url path
		// if the path length is 0, set it to primary page route
		resetGameState();
		if (location.length == 0) {
			location = "/";
		}
		
		await updateStatus("online");
		// get the route object from the urlRoutes object
		// const route = routes[location] || routes["404"];
		const { route, params } = matchRoute(location);
		let profileCut = location.substring(0, location.indexOf('/', location.indexOf('/') + 1) + 1);
		// get the html from the template
		if (profileCut == "/profile/" && countString(location, '/') == 3) {
			await routerProfile(location, route.template);
		}
		else {
			const html = await fetch(route.template).then((response) => response.text());
			document.getElementById("content").innerHTML = html;
		}
		// const html = await fetch(route.template).then((response) => response.text());
		// document.getElementById("content").innerHTML = html;
		const language = getPreferredLanguage();

		loadLanguage(language);
		addJS(location);
		// set the title of the document to the title of the route
		document.title = route.title;
	};

	function addJS(location) {
		// if (location == "/online/") {
		// 	const scriptContent = `
		// 	document.getElementById("online-box").style.display = "block";
		// 	document.getElementById("online-box").classList.add("shown");
		// `;
		// 	const scriptElement = document.createElement('script');
		// 	scriptElement.text = scriptContent;
		// 	document.getElementById("content").appendChild(scriptElement);        }
		if (location == "/tourney/") {
			const scriptContent = `
				document.getElementById("tourney_settings-box").style.display = "block";
				document.getElementById("tourney_settings-box").classList.add("shown");
			`;
			const scriptElement = document.createElement('script');
			scriptElement.text = scriptContent;
			document.getElementById("content").appendChild(scriptElement);
		}
		else if (location == "/users/") {
			usersClick();
		}
		else if (location == "/pvp/") {
			GameMode(0);
		}
		else if (location == "/bot/") {
			GameMode(1);
		}
		else if (location == "/settings/") {
			displaySettings();
		}
	}

	// Function to get the preferred language
	function getPreferredLanguage() {
		let language = localStorage.getItem('preferredLanguage') || navigator.language.split('-')[0] || 'en';
		console.log('Initial language from localStorage or navigator:', language);
		const supportedLanguages = ['en', 'fr', 'it', 'de', 'el', 'zh', 'la'];

		if (!supportedLanguages.includes(language)) {
			language = 'en';
		}

		console.log('Final selected language:', language);
		return language;
	}

	function resetGameState() {
		if (game.game_class !== null) {
			window.cancelAnimationFrame(game.animation_id);
			game.animation_id = null;
			// findEventListeners(game.game_type);
			removeMovementEventListener(game.game_class.stopPlayer, game.game_class.movePlayer);
			if (game.game_type == 'tourney')
			{
				change_loop_exec(false);
				modifyDelta(1.5);
				stars(document.getElementById("main_canvas"));
			}
			game.game_type = null;
			game.game_class = null;
			if (game.ws !== null) {
				game.ws.close();
				game.ws = null;
			}
		}
	}

	const matchRoute = (location) => {
		for (const path in routes) {
			const regexPath = path.replace(/:\w+/g, '([^/]+)'); // Replace :param with regex capture group
			const match = location.match(new RegExp(`^${regexPath}$`));
			if (match) {
				const params = {};
				const paramNames = (path.match(/:\w+/g) || []).map(name => name.substring(1));
				paramNames.forEach((name, index) => {
					params[name] = match[index + 1];
				});
				return { route: routes[path], params };
			}
		}
		return { route: routes["404"], params: {} };
	};

	async function routerProfile(location, template) {
		if (userIsConnected == false) {
			errorMsg("you must be logged in to access profiles");
			const html = await fetch("/templates/profile.html").then((response) => response.text());
			document.getElementById("content").innerHTML = html;
			return;
		}
		let username = location.substring(location.indexOf('/', location.indexOf('/') + 1) + 1, location.length - 1);
		username = decodeURIComponent(username);
		let user_id = await getUserId(username);
		if (user_id == null) {
			const html = await fetch("/templates/404.html").then((response) => response.text());
			document.getElementById("content").innerHTML = html;
			return;
		}
		await fetch(template)
			.then((response) => {return response.text();})
			.then((data) => {
				document.getElementById("content").innerHTML = data;
				displayProfile(username);
			})
	}

	function countString(str, letter) {

		// creating regex 
		const re = new RegExp(letter, 'g');

		// matching the pattern
		const count = str.match(re).length;

		return count;
	}

	function removeMovementEventListener(functionKeyUp, functionKeyDown) {
		if (functionKeyUp !== null)
			document.removeEventListener("keyup", functionKeyUp);
		if (functionKeyDown !== null)
			document.removeEventListener("keydown", functionKeyDown);
	}
	// add an event listener to the window that watches for url changes
	window.onpopstate = locationHandler;
	// call the urlLocationHandler function to handle the initial url
	window.route = route;
	// call the urlLocationHandler function to handle the initial url
	locationHandler();
});
export { route }