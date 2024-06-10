import { sleep } from './utils.js';
import { stars } from './stars.js';
import { loop } from './pong.js';
import { online_game } from '../online/index.js';
import { gameLoop_bot } from '../bot/pong.js';
import { username_global } from './animations.js';

// import { loop_t } from './pong_tournoi.js';

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
		document.getElementById("game").style.background = "rgba(" + brightness + ", " + brightness + ", " + brightness + ", 1)";
		await sleep(20);
	}
	document.getElementById("game").style.background = "black";
	document.getElementById("main-buttons").style.display = "none";

	if (n == 0)
	{
		loop_exec = true;
		requestAnimationFrame(loop);
	}
	else if (n == 1)
	{
		let ws = new WebSocket("wss://" + window.location.host + "/ws/bot/");
		await gameLoop_bot(ws);
		// ws.close();
	}
	else if (n == 3)
	{
		document.getElementById("login-box").style.display = "none";
		const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
		let room_selected = document.querySelector("#room_name_input").value;
		let ws;
		fetch("https://" + window.location.host + "/room/", {
			method: "POST",
			body: JSON.stringify({
				room: room_selected,
				username: username_global,
			}),
			headers: {
				"Content-type": "application/json; charset=UTF-8",
				"X-CSRFToken": csrftoken,
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
				ws = new WebSocket("wss://" + window.location.host + "/ws/online/" + data.room_name + "/");
				online_game(ws);
				// ws.close();
			}
		})
	}
	
}

stars(document.getElementById("game"));
