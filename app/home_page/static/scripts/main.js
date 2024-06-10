import { sleep } from './utils.js';
import { stars, starWars, modifyDelta } from './stars.js';
import { loop as loopPvp } from './pvp_pong.js';
import { loop as loopTourney, loop_exec } from './tourney_pong.js';
import { drawBrackets, enterNicknames, createPlayers } from './brackets.js';

// export var loop_exec = false;
export let ai_activated = false;

export async function GameMode(n) {
	await starWars();

	if (n <= 1) {
		if (n == 1)
			ai_activated = true;
		// loop_exec = true;
		requestAnimationFrame(loopPvp);
	}
	else if (n == 2) {
		// loop_exec = true;
		requestAnimationFrame(loopTourney);
		// modifyDelta(1.5);
		// stars(document.getElementById("game_canvas"));
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
					await sleep(300);
					await drawBrackets();
					document.getElementById("nickname_setup-box").style.display = "none";
					GameMode(2);
				});
			});
		}
		else if (button_id === "pvp-mode")
			GameMode(0);
		else if (button_id === "cpu-mode")
			GameMode(1);
		//document.getElementById("main-menu").addEventListener("animationend", function() {
		//	document.getElementById("main-menu").style.display = "none";
		//});
	}
});
