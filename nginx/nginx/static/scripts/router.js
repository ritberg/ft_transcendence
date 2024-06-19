import { displayProfile } from "./stats.js";
import { usersClick } from "./users.js";
import { GameMode } from "./main.js";
import { modifyDelta,stars } from './stars.js';
import { change_loop_exec } from "./pong_tourney.js";


export const game = {
    game_type : null,
    game_class: null,
    animation_id : null,
    ws : null,
};

// document.addEventListener('DOMContentLoaded', () => {
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
	"/profile/": {
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
}

document.addEventListener("click", (e) => {
	const { target } = e;
	if (!target.matches("#profile_tab a, #user-name a, #online-mode a, #signup-switch a, #signin-switch a, #tabs-list a, #tourney-mode a")) {
		return;
	}
	e.preventDefault();
	route(e);
});

export const route = (url) => {
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
	// get the route object from the urlRoutes object
	const route = routes[location] || routes["404"];
	// get the html from the template
	if (location == "/profile/") {
		await fetch(route.template)
			.then((response) => {return response.text();})
			.then((data) => {
				document.getElementById("content").innerHTML = data;
				displayProfile();
			})
	}
	else {
		const html = await fetch(route.template).then((response) => response.text());
		document.getElementById("content").innerHTML = html;
	}
	// const html = await fetch(route.template).then((response) => response.text());
	// document.getElementById("content").innerHTML = html;
	addJS(location);
	// set the title of the document to the title of the route
	document.title = route.title;
};

function addJS(location) {
    if (location == "/online/") {
		const scriptContent = `
        document.getElementById("online-box").style.display = "block";
        document.getElementById("online-box").classList.add("shown");
    `;
		const scriptElement = document.createElement('script');
		scriptElement.text = scriptContent;
		document.getElementById("content").appendChild(scriptElement);        }
	else if (location == "/tourney/") {
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

// function findEventListeners(type) {
//     if (type === 'pvp')
//         removeMovementEventListener(game.game_class.stopPlayer, game.game_class.movePlayer);
// }

export function removeMovementEventListener(functionKeyUp, functionKeyDown) {
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
// });
