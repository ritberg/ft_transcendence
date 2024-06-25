import { modifyDelta, stars } from './stars.js';
import { sleep, randomNumber, tourneyGame, resetTourneyGame, escapeHtml } from './utils.js';
import { change_loop_exec } from './pong_tourney.js';
import { tournamentMessages } from './animations.js';

export const tourney_game = new tourneyGame();

export function createPlayers() {
	resetTourneyGame(tourney_game);
	for (let i = 0; i < document.getElementById("s-players").value; i++) {
		//var fighter = false;
		let player_push = document.getElementById(`player_${i + 1}`).value;
		player_push = escapeHtml(player_push);
		tourney_game.player.push(player_push);
	}
	tourney_game.player.sort(() => Math.random() - 0.5);
	//tourney_game.player[0].fighter = true;
	//tourney_game.player[1].fighter = true;
	for (let i = 0; i < tourney_game.player.length; i++)
		tourney_game.score.push([tourney_game.player[i], 172]);
	tourney_game.index = 0;
	tourney_game.max_points = document.getElementById("s-points").value;
	tourney_game.max_phases = 0;
	if (tourney_game.player.length == 4)
		tourney_game.max_phases = 3;
	else
		tourney_game.max_phases = 4;
}

export async function drawBrackets() {
	//console.log(tourney_game.score);
	//let tourney_game.max_phases = Math.ceil(players.length / 2);
	// document.querySelector(".brackets").style.left = "0";
	document.getElementById("brackets-container").style.opacity = "0";
	document.getElementById("brackets-container").style.display = "flex";
	document.getElementById("brackets-container").classList.add("shown");
	const divs = [];
	const boxes = [];
	let acc = tourney_game.player.length;
	let cur_pos = 0;
	for (let i = 0; i < tourney_game.max_phases; i++) {
		const newDiv = document.createElement("div");
		newDiv.classList.add("brackets");
		document.querySelector("#brackets-container").appendChild(newDiv);
		newDiv.style.left = `${i * 225}px`;

		for (let j = 0; j < acc; j++) {
			//if (i != 0)
			//	cur_pos = tourney_game.player.length / i + j;
			const new_box = document.createElement("div");
			new_box.classList.add("rectangle-div");

			const name_text = document.createElement("span");
			name_text.classList.add("name");
			//console.log(cur_pos, tourney_game.index);
			//if (i > 0 && cur_pos > tourney_game.index * 2)
			//console.log(tourney_game.index, tourney_game.index * 2);
			if (i > 0 && tourney_game.score[cur_pos] === undefined) {
				name_text.innerText = "?";
				new_box.style.border = "2px dashed white";
			} else
				name_text.innerText = tourney_game.score[cur_pos][0];
			const score_text = document.createElement("span");
			score_text.classList.add("score");
			if (tourney_game.score[cur_pos] && tourney_game.score[cur_pos][1] != 172)
				score_text.innerText = tourney_game.score[cur_pos][1];
			new_box.appendChild(name_text);
			new_box.appendChild(score_text);
			newDiv.appendChild(new_box);
			boxes.push(new_box);
			cur_pos++;
		}
		acc /= 2;
		divs.push(newDiv);
	}
	let last_player = 0;
	for (let z = tourney_game.player.length; z > 1; z /= 2)
		last_player += z;
	if (tourney_game.index != last_player) {
		await sleep(1000);
		if (window.location.pathname !== "/tourney/") {
			change_loop_exec(false);
			modifyDelta(1.5);
			stars(document.getElementById("main_canvas"));
			return;
		}
		let message = `${ tourney_game.score[tourney_game.index][0]} will face off against \
						${tourney_game.score[tourney_game.index + 1][0]} !`;
		tournamentMessages("tournament", message);
		boxes[tourney_game.index].classList.add("fighter");
		boxes[tourney_game.index + 1].classList.add("fighter");
	} else {
		await sleep(1000);
		if (window.location.pathname !== "/tourney/") {
			change_loop_exec(false);
			modifyDelta(1.5);
			stars(document.getElementById("main_canvas"));
			return;
		}
		tournamentMessages("tournament", `the winner of the tournament is ${tourney_game.score[tourney_game.index][0]} !`);
		boxes[tourney_game.index].classList.add("winner");
		//const crown = document.createElement("i");
		//crown.classList.add("bi", "bi-trophy");
		//document.querySelector("#brackets-container").appendChild(crown);
		await sleep(1000);
	}
	await sleep(1000);
	if (window.location.pathname !== "/tourney/") {
		change_loop_exec(false);
		modifyDelta(1.5);
		stars(document.getElementById("main_canvas"));
		return;
	}
	document.getElementById("brackets-container").style.opacity = "1";
	document.getElementById("brackets-container").classList.remove("shown");
	document.getElementById("brackets-container").classList.add("hidden");
	await sleep(700);
	if (window.location.pathname !== "/tourney/") {
		change_loop_exec(false);
		modifyDelta(1.5);
		stars(document.getElementById("main_canvas"));
		return;
	}
	for (let x = 0; x < divs.length; x++)
		divs[x].remove();
	document.getElementById("brackets-container").style.display = "none";
}

//const isWhitespaceString = str => !str.replace(/\s/g, '').length

export function enterNicknames(n) {
	//console.log(1);
	const form = document.createElement("form");
	form.id = "nicknames_form";
	for (let i = 0; i < n; i++) {
		const userBox = document.createElement("div");
		userBox.classList.add("input-div");
		const userNameInput = document.createElement("input");
		userNameInput.type = "text";
		userNameInput.id = `player_${i + 1}`;
		userNameInput.required = true;
		userNameInput.maxLength = "3";

		const userNameLabel = document.createElement("label");
		userNameLabel.textContent = `PLAYER ${i + 1}`;
		userBox.appendChild(userNameInput);
		userBox.appendChild(userNameLabel);
		form.appendChild(userBox);
	}
	const button = document.createElement("button");
	button.textContent = "GO";
	// button.id = "GO_N";
	form.appendChild(button);
	document.querySelector("#nickname_setup-box").appendChild(form);
	//if (isWhitespaceString(document.getElementById("player_1").value))
	//	console.log(100);
}
