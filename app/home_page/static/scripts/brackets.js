import { sleep, randomNumber, Player } from './utils.js';

export const players = [];
let game_phase = 0;
let max_game_phase = 0;

export function createPlayers() {
	let pos_list = [];
	for (let i = 0; i < document.getElementById("s-players").value; i++) {
		pos_list.push(i);
	}
	for (let i = 0; i < document.getElementById("s-players").value; i++) {
		const position = randomNumber(pos_list);
		var fighter = false;
		const player = new Player(document.getElementById(`player_${i + 1}`).value, 0, position, fighter);
		players.push(player);
	}
	players.sort((a, b) => a.position - b.position);
	players[0].fighter = true;
	players[1].fighter = true;
	max_game_phase = Math.ceil(players.length / 2);
}

export async function drawBrackets(players) {
	game_phase++;
	// document.querySelector(".brackets").style.left = "0";
	document.getElementById("brackets-container").style.opacity = "0";
	document.getElementById("brackets-container").style.display = "flex";
	document.getElementById("brackets-container").classList.add("shown");
	const divs = [];
	const boxes = [];
	for (let x = 0; x < game_phase; x++) {
		const newDiv = document.createElement("div");
		newDiv.classList.add("brackets");
		document.querySelector("#brackets-container").appendChild(newDiv);
		newDiv.style.left = `${x * 225}px`;

		for (let i = 0; i < players.length; i++) {
			const new_box = document.createElement("div");
			new_box.classList.add("rectangle-div");

			const name_text = document.createElement("span");
			name_text.classList.add("name");
			name_text.innerText = players[i].name;

			const score_text = document.createElement("span");
			score_text.classList.add("score");
			score_text.innerText = "1";

			new_box.appendChild(name_text);
			new_box.appendChild(score_text);
			newDiv.appendChild(new_box);
			boxes.push(new_box);
		}

		divs[x] = newDiv;
	}
	await sleep(1000);
	for (let i = 0; i < players.length; i++)
		if (players[i].fighter == true)
			boxes[i].classList.add("fighter");
	await sleep(1000);
	document.getElementById("brackets-container").style.opacity = "1";
	document.getElementById("brackets-container").classList.remove("shown");
	document.getElementById("brackets-container").classList.add("hidden");
	await sleep(700);
	// for (let i = 0; i < players.length; i++)
	// 	if (players[i].fighter == true)
	// 		boxes[i].classList.remove("fighter");

	for (let x = 0; x < game_phase; x++)
		divs[x].remove();
	document.getElementById("brackets-container").style.display = "none";
}

export function enterNicknames(n) {
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
}

/*

		for (let i = 0; i < players.length; i++) {
			const new_box = document.createElement("div");
			new_box.classList.add("rectangle-div");
			// if (x < game_phase) {
			// new_box.textContent = players[i].name;
			// } else {
			// 	new_box.textContent = "?";
			// 	new_box.style.border = "2px dashed white";
			// }
			newDiv.appendChild(new_box);
			const box_text = document.createElement("h2");
			box_text.classList.add("rectangle-div");
			box_text.textContent = players[i].name;
			box_text.appendChild(newDiv);
			const box_score = document.createElement("h2");
			box_score.classList.add("rectangle-div");
			box_score.textContent = "1";
			box_score.appendChild(newDiv);
			boxes.push(new_box);
		}
		*/
