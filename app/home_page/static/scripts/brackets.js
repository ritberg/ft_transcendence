import { sleep } from './utils.js';

export async function drawBrackets(n) {
	const newDiv = document.createElement("div");
	newDiv.classList.add("brackets");
	document.querySelector("#brackets-container").appendChild(newDiv);

	const boxes = [];

	for (let i = 0; i < n; i++) {
		const new_box = document.createElement("div");
		new_box.classList.add("rectangle-div");
		new_box.textContent = document.getElementById(`player_${i + 1}`).value;
		newDiv.appendChild(new_box);
		boxes.push(new_box);
	}

	await sleep(500);
	for (let i = 0; i < 2; i++) {
		boxes[i].style.background = `rgba(255, 255, 255, .15)`;
		boxes[i].style.boxShadow = `white 0 0 10px`;
	}
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
