import { sleep, randomNumber, Game } from './utils.js';

export const game = new Game(0);

export function createPlayers() {
	for (let i = 0; i < document.getElementById("s-players").value; i++) {
		//var fighter = false;
		game.player.push(document.getElementById(`player_${i + 1}`).value);
	}
	game.player.sort(() => Math.random() - 0.5);
	//game.player[0].fighter = true;
	//game.player[1].fighter = true;
	for (let i = 0; i < game.player.length; i++)
		game.score.push([game.player[i], 172]);
	game.index = 0;
	game.max_points = document.getElementById("s-points").value;
	game.max_phases = 0;
	if (game.player.length == 4)
		game.max_phases = 3;
	else
		game.max_phases = 4;
}

export async function drawBrackets() {
	//console.log(game.score);
	//let game.max_phases = Math.ceil(players.length / 2);
	// document.querySelector(".brackets").style.left = "0";
	document.getElementById("brackets-container").style.opacity = "0";
	document.getElementById("brackets-container").style.display = "flex";
	document.getElementById("brackets-container").classList.add("shown");
	const divs = [];
	const boxes = [];
	let acc = game.player.length;
	let cur_pos = 0;
	for (let i = 0; i < game.max_phases; i++) {
		const newDiv = document.createElement("div");
		newDiv.classList.add("brackets");
		document.querySelector("#brackets-container").appendChild(newDiv);
		newDiv.style.left = `${i * 225}px`;

		for (let j = 0; j < acc; j++) {
			//if (i != 0)
			//	cur_pos = game.player.length / i + j;
			const new_box = document.createElement("div");
			new_box.classList.add("rectangle-div");

			const name_text = document.createElement("span");
			name_text.classList.add("name");
			//console.log(cur_pos, game.index);
			//if (i > 0 && cur_pos > game.index * 2)
			//console.log(game.index, game.index * 2);
			if (i > 0 && game.score[cur_pos] === undefined) {
				name_text.innerText = "?";
				new_box.style.border = "2px dashed white";
			} else
				name_text.innerText = game.score[cur_pos][0];
			const score_text = document.createElement("span");
			score_text.classList.add("score");
			if (game.score[cur_pos] && game.score[cur_pos][1] != 172)
				score_text.innerText = game.score[cur_pos][1];
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
	for (let z = game.player.length; z > 1; z /= 2)
		last_player += z;
	if (game.index != last_player) {
		await sleep(1000);
		boxes[game.index].classList.add("fighter");
		boxes[game.index + 1].classList.add("fighter");
	} else {
		await sleep(1000);
		boxes[game.index].classList.add("winner");
		//const crown = document.createElement("i");
		//crown.classList.add("bi", "bi-trophy");
		//document.querySelector("#brackets-container").appendChild(crown);
		await sleep(1000);
	}
	await sleep(1000);
	document.getElementById("brackets-container").style.opacity = "1";
	document.getElementById("brackets-container").classList.remove("shown");
	document.getElementById("brackets-container").classList.add("hidden");
	await sleep(700);
	for (let x = 0; x < divs.length; x++)
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


/*export async function drawBrackets(players) {
	// document.querySelector(".brackets").style.left = "0";
	document.getElementById("brackets-container").style.opacity = "0";
	document.getElementById("brackets-container").style.display = "flex";
	document.getElementById("brackets-container").classList.add("shown");
	const divs = [];
	const boxes = [];
	for (let x = 0; x <= game.index; x++) {
		const newDiv = document.createElement("div");
		if (game.max_phases % (game.index / 2) == 0 || game.index == 0) {
			newDiv.classList.add("brackets");
			document.querySelector("#brackets-container").appendChild(newDiv);
			newDiv.style.left = `${game_phase * 225}px`;
			game_phase++;
		}

		for (let i = 0; i < 2; i++) {
			const new_box = document.createElement("div");
			new_box.classList.add("rectangle-div");

			const name_text = document.createElement("span");
			name_text.classList.add("name");
			name_text.innerText = players[i % 2].name;

			const score_text = document.createElement("span");
			score_text.classList.add("score");
			if (game.score[x] && game.score[x][i % 2])
				score_text.innerText = game.score[x][i % 2];

			new_box.appendChild(name_text);
			new_box.appendChild(score_text);
			newDiv.appendChild(new_box);
			boxes.push(new_box);
		}

		if (game.max_phases % (game.index / 2) == 0 || game.index == 0)
			divs[x] = newDiv;
	}*/
