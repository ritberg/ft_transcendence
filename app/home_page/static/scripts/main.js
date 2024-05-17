import { sleep } from './utils.js';
import { stars } from './stars.js';
import { loop } from './pong.js';
// import { loop_t } from './pong_tournoi.js';

export let delta = 1.5;
export let loop_exec = 0;
export let ai_activated = false;

export async function GameMode(n) {
	for (let i = 0; i < 40; i++)
	{
		delta /= 1.05;
		await sleep(20);
	}
	for (let i = 0; i < 20; i++)
	{
		delta /= 1.05;
		const brightness = i * 4; //18
		document.getElementById("game").style.background = "rgba(" + brightness + ", " + brightness + ", " + brightness + ", 1)";
		await sleep(20);
	}
	document.getElementById("game").style.background = "black";
	document.getElementById("main-buttons").style.display = "none";

	if (n == 1)
		ai_activated = true;
	console.log("hey");
	loop_exec = true;
	requestAnimationFrame(loop);
}

stars(document.getElementById("game"));
