import { displayProfile } from "./stats.js";
import { usersClick, getUserId, userIsConnected } from "./users.js";
import { displaySettings } from "./settings.js";
import { GameMode } from "./main.js";
import { modifyDelta,stars } from './stars.js';
import { change_loop_exec } from "../games/pong_tourney.js";
import { msg } from "./utils.js";
import { loadLanguage } from './lang.js';
import { updateStatus } from "./userStatus.js";

//this struct will contain the game classes, animation_id, webocket and so on
//allows for easy access of the games and easy removal of it
export const game = {
    game_type : null,
    game_class: null,
    animation_id : null,
    ws : null,
};

let route;
document.addEventListener('DOMContentLoaded', () => {
	//routes to be matched to find the right html to put in content
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

	//currently not used, but kept here if needed
	document.addEventListener("click", (e) => {
		const { target } = e;
		// if (!target.matches("")) 
		return;

		// e.preventDefault();
		// route(e);
	});

	//adds the location to the history to allow for arrows usage
	route = (url) => {
		if (typeof url !== 'string') {
			let event = url || window.event;
			event.preventDefault();
			url = event.target.href;
		}
		window.history.pushState({}, "", url);
		locationHandler();
	};

	const locationHandler = async () => {
		let location = window.location.pathname; // get the url path
		// if the path length is 0, set it to primary page route
		if (location.length == 0) {
			location = "/";
		}

		//resets game websockets, event listeners, animation_ids
		resetGameState();
		
		await updateStatus("online");

		// get the route object from the urlRoutes object
		const { route, params } = matchRoute(location);

		//this blocks handles profiles, it needs to match what is after the /profile/ to get the username and display the right profile
		let profileCut = location.substring(0, location.indexOf('/', location.indexOf('/') + 1) + 1);
		if (profileCut == "/profile/" && countString(location, '/') == 3) {
			await routerProfile(location, route.template, params.username);
		}
		else {
			//adds new html to content
			const html = await fetch(route.template).then((response) => response.text());
			document.getElementById("content").innerHTML = html;
		}

		//load new html page
		const language = getPreferredLanguage();
		loadLanguage(language);

		//some html needs new js for animations for example
		addJS(location);
		// set the title of the document to the title of the route
		document.title = route.title;
	};

	function addJS(location) {
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
		const supportedLanguages = ['en', 'fr', 'it', 'de', 'el', 'zh', 'la'];

		if (!supportedLanguages.includes(language)) {
			language = 'en';
		}

		return language;
	}

	function resetGameState() {
		if (game.game_class !== null) {
			window.cancelAnimationFrame(game.animation_id);
			game.animation_id = null;
			removeMovementEventListener(game.game_class.stopPlayer, game.game_class.movePlayer);
			if (game.game_type == 'tourney')
			{
				change_loop_exec(false);
				//resets stars speed
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

	//finds the /profile/ in /profile/username/ and matches it to the right html
	const matchRoute = (location) => {
		// Iterate over each path in the routes object
		for (const path in routes) {
			// Convert the route path into a regular expression pattern
			const regexPath = path.replace(/:\w+/g, '([^/]+)');
			
			// Use the generated regex pattern to match against the provided location
			const match = location.match(new RegExp(`^${regexPath}$`));
			
			// If there is a match, extract the parameters
			if (match) {
				const params = {};
				
				const paramNames = (path.match(/:\w+/g) || []).map(name => name.substring(1));
				
				//finds the username in the url
				paramNames.forEach((name, index) => {
					params[name] = match[index + 1];
				});
				
				// Return the matched route and the username
				return { route: routes[path], params };
			}
		}
		// If no route matches, return 404
		return { route: routes["404"], params: {} };
	};

	//finds the right user to display the profile
	async function routerProfile(location, template, username) {
		//if user isn't connected, they aren't allowed to see profiles
		if (userIsConnected == false) {
			msg("you must be logged in to access profiles");
			//displays an empty profile page
			const html = await fetch("/templates/profile.html").then((response) => response.text());
			document.getElementById("content").innerHTML = html;
			return;
		}
		//decode special characters, for example make profile work with chinese characters
		username = decodeURIComponent(username);
		let user_id = await getUserId(username);
		if (user_id == null) {
			//if profile isn't found, return 404 page
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

	//to make sure there isn't anything after the url /profile/username/
	function countString(str, letter) {

		// creating regex 
		const re = new RegExp(letter, 'g');

		// matching the pattern
		const count = str.match(re).length;

		return count;
	}

	//removes game event listeners
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