import { sleep } from './utils.js';
import { stars, starWars, modifyDelta } from './stars.js';
import { loop as loopPvp } from './pong_pvp.js';
import { loop as loopTourney, loop_exec } from './pong_tourney.js';
import { drawBrackets, enterNicknames, createPlayers } from './brackets.js';
import { online_game } from '../online/pong_online.js';
import { gameLoop_bot } from '../bot/pong_bot.js';
import { username_global, token } from './users.js';

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
