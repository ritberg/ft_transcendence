import { sleep } from './utils.js';
import { stars, starWars, modifyDelta } from './stars.js';
import { loop as loopPvp } from './pong.js';
import { loop as loopTourney, loop_exec } from './pong_tournoi.js';
import { drawBrackets, enterNicknames, createPlayers } from './brackets.js';
import { online_game } from '../online/index.js';
import { gameLoop_bot } from '../bot/pong.js';
import { username_global } from './rita.js';
import { token } from './rita.js';

// import { loop_t } from './pong_tournoi.js';

export let ai_activated = false;

export async function GameMode(n) {
	await starWars();

	if (n == 0) {
		requestAnimationFrame(loopPvp);
	}
	else if (n == 1) {
		let ws = new WebSocket("wss://" + window.location.host + "/ws/bot/");
		gameLoop_bot(ws);
		// ws.close();
	}
	else if (n == 2)
		requestAnimationFrame(loopTourney);
	else if (n == 3) {
		document.getElementById("online-box").style.display = "none";
		let room_selected = document.querySelector("#i-room_name").value;
		let ws;
		fetch("https://" + window.location.host + "/room/", {
			method: "POST",
			body: JSON.stringify({
				room: room_selected,
				username: username_global,
			}),
			headers: {
				"Content-type": "application/json; charset=UTF-8",
				"X-CSRFToken": token,
			}
		})
		.then((response) => {
			return response.json();
		})
		.then((data) => {
			let code = data.status;
			if (code == 500)
				console.log("error: " + data.error);
			else {
				ws = new WebSocket("wss://" + window.location.host + "/ws/online/" + data.room_name + "/" + username_global + "/");
				online_game(ws);
				// ws.close();
			}
		})
	}
}

stars(document.getElementById("game_canvas"));

document.getElementById("profile_tab").addEventListener("click", function() {
	if (window.getComputedStyle(document.getElementById("profile-box_signup")).display === "none") {
		document.getElementById("profile-box_signup").style.display = "block";
		document.getElementById("main-menu").style.display = "none";
	} else {
		document.getElementById("profile-box_signup").style.display = "none";
		document.getElementById("main-menu").style.display = "flex";
	}
});

document.getElementById("main-menu").addEventListener("click", function () {
	var button_id = event.target.id;
	if (event.target.tagName.toLowerCase() === "button") {
		document.getElementById("main-menu").classList.add("hidden");
		if (button_id === "online-mode") {
			document.getElementById("online-box").style.display = "block";
			document.getElementById("online-box").classList.add("shown");
			document.getElementById("b-online-go").addEventListener("click", function () {
				GameMode(3);
			});
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
				document.getElementById("tourney_settings-box").style.opacity = "0";
				document.getElementById("tourney_settings-box").classList.remove("hidden");
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
		//document.getElementById("main-menu").addEventListener("animationend", function () {
		//	document.getElementById("main-menu").style.display = "none";
		//});
	}
});
