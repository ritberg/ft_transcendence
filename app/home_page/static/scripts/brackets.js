import { sleep, randomNumber, Player } from './utils.js';

export const players = [];

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
}

export async function drawBrackets(players) {
	const newDiv = document.createElement("div");
	newDiv.classList.add("brackets");
	document.querySelector("#brackets-container").appendChild(newDiv);

	const boxes = [];

	for (let i = 0; i < players.length; i++) {
		const new_box = document.createElement("div");
		new_box.classList.add("rectangle-div");
		new_box.textContent = players[i].name;
		newDiv.appendChild(new_box);
		boxes.push(new_box);
	}

	await sleep(1000);
	for (let i = 0; i < players.length; i++)
		if (players[i].fighter == true)
			boxes[i].classList.add("fighter");
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
