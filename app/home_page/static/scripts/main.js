import { sleep } from './utils.js';
import { stars } from './stars.js';
import { loop } from './pong.js';

export let delta = 1.5;
export let loop_exec = 0;
export let ai_activated = false;

async function GameMode(n) {
	//
	if (n >= 2)
		return;
	//
	document.getElementById("title").style.animationName = "none";
	const button_elements = document.getElementsByClassName("gamemode-button");
	for (let i = 0; i < 40; i++)
	{
		delta /= 1.05;
		const opacity = 0.5 - i / 40;
		document.getElementById("main-buttons").style.opacity = opacity;
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
	if (n <= 1) {
		loop_exec = true;
		requestAnimationFrame(loop);
	}
}

document.getElementById("pvp-mode").addEventListener("click", function() { GameMode(0); });
document.getElementById("cpu-mode").addEventListener("click", function() { GameMode(1); });
document.getElementById("tournoi-mode").addEventListener("click", function() { GameMode(2); });
document.getElementById("online-mode").addEventListener("click", function() { GameMode(3); });

stars(document.getElementById("game"));
