import { sleep } from './utils.js';
import { stars } from './stars.js';
import { loop as loopPvp } from './pvp_pong.js';
import { loop as loopTourney} from './tourney_pong.js';
import { drawBrackets, enterNicknames, createPlayers, players } from './brackets.js';

export let delta = 1.5;
export let loop_exec = 0;
export let ai_activated = false;

export async function GameMode(n) {
	for (let i = 0; i < 40; i++) {
		delta /= 1.05;
		await sleep(20);
	}
	for (let i = 0; i < 20; i++) {
		delta /= 1.05;
		const brightness = i * 4; //18
		document.getElementById("game_canvas").style.background = "rgba(" + brightness + ", " + brightness + ", " + brightness + ", 1)";
		await sleep(20);
	}
	document.getElementById("game_canvas").style.background = "black";
	document.getElementById("main-menu").style.display = "none";

	if (n <= 1) {
		if (n == 1)
			ai_activated = true;
		loop_exec = true;
		requestAnimationFrame(loopPvp);
	}
	else if (n == 2) {
		loop_exec = true;
		requestAnimationFrame(loopTourney);
	}
}

stars(document.getElementById("game_canvas"));

document.getElementById("tl-profile").addEventListener("click", function() {
	if (window.getComputedStyle(document.getElementById("profile-box")).display === "none") {
		document.getElementById("profile-box").style.display = "block";
		document.getElementById("main-menu").style.display = "none";
	} else {
		document.getElementById("profile-box").style.display = "none";
		document.getElementById("main-menu").style.display = "flex";
	}
});

document.getElementById("main-menu").addEventListener("click", function() {
	var button_id = event.target.id;
	if (event.target.tagName.toLowerCase() === "button") {
		document.getElementById("main-menu").classList.add("hidden");
		if (button_id === "online-mode") {
			document.getElementById("online-box").style.display = "block";
			document.getElementById("online-box").classList.add("shown");
		}
		else if (button_id === "tourney-mode") {
			document.getElementById("tourney_settings-box").style.display = "block";
			document.getElementById("tourney_settings-box").classList.add("shown");
			document.getElementById("b-tourney_settings").addEventListener("click", async function() {
				document.getElementById("tourney_settings-box").style.opacity = "1";
				document.getElementById("tourney_settings-box").classList.remove("shown");
				document.getElementById("tourney_settings-box").classList.add("hidden");
				document.getElementById("nickname_setup-box").style.display = "flex";
				document.getElementById("nickname_setup-box").classList.add("shown");
				enterNicknames(document.getElementById("s-players").value);
				await sleep(500);
				document.getElementById("tourney_settings-box").style.display = "none";
				document.getElementById("nicknames_form").addEventListener("submit", async function(event) {
					event.preventDefault();
					createPlayers();
					document.getElementById("nickname_setup-box").style.opacity = "1";
					document.getElementById("nickname_setup-box").classList.remove("shown");
					document.getElementById("nickname_setup-box").classList.add("hidden");
					// document.getElementById("nickname_setup-box").style.display = "none";
					await sleep(300);
					document.getElementById("brackets-container").style.display = "flex";
					document.getElementById("brackets-container").classList.add("shown");
					drawBrackets(players);
					await sleep(500);
					document.getElementById("nickname_setup-box").style.display = "none";
					await sleep(1000);
					document.getElementById("brackets-container").style.opacity = "1";
					document.getElementById("brackets-container").classList.remove("shown");
					document.getElementById("brackets-container").classList.add("hidden");
					GameMode(2);
					await sleep(1000);
					document.getElementById("brackets-container").style.display = "none";
				});
			});
		}
		else if (button_id === "pvp-mode")
			GameMode(0);
		else if (button_id === "cpu-mode")
			GameMode(1);
		document.getElementById("main-menu").addEventListener("animationend", function() {
			document.getElementById("main-menu").style.display = "none";
		});
	}
});
