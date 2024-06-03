export function drawBrackets(n) {
	var left_pos = 0;
	var j = 0;
	var x = n / 2;
	var acc = n;
	while (j < n / 2) {
		for (let i = 0; i < acc; i++) {
			const newDiv = document.createElement("div");
			const winHeight = parseInt(window.getComputedStyle(document.getElementById("brackets")).height);
			const blockHeight = winHeight / acc;
			const offset = winHeight / 2 - (blockHeight * (acc / 2 - 1) + 8 * winHeight / 100);
			newDiv.classList.add("rectangle-div");
			newDiv.style.left = `${left_pos}px`;
			if (i < 2) {
				newDiv.style.background = `rgba(255, 255, 255, .15)`;
				newDiv.style.boxShadow = `white 0 0 20px`;
			}
			if (i % 2 == 0)
				newDiv.style.top = `${i * blockHeight + offset}px`;
			else
				newDiv.style.top = `${(i - 1) * blockHeight + 70 + offset}px`;
			newDiv.textContent = document.getElementById(`player_${i + 1}`).value;
			document.querySelector("#brackets").appendChild(newDiv);
		}
		j++;
		console.log(acc);
		acc /= 2;
		if (acc == 1)
			break;
		left_pos += 250;
	}
	// for (let i = 0; i < n - 2; i++) {
	// 	const newDiv = document.createElement("div");
	// 	const winHeight = parseInt(window.getComputedStyle(document.getElementById("brackets")).height);
	// 	const blockHeight = winHeight / parseInt(document.getElementById("slider1").value);
	// 	const offset = winHeight / 2 - (blockHeight * (parseInt(document.getElementById("slider1").value) / 2 - 1) + 8 * winHeight / 100);
	// 	newDiv.classList.add("rectangle-div");
	// 	newDiv.style.left = `300px`;
	// 	newDiv.style.border = `dashed`;
	// 	if (i % 2 == 0)
	// 		newDiv.style.top = `${(i + 1) * blockHeight + offset}px`;
	// 	else
	// 		newDiv.style.top = `${i * blockHeight + 70 + offset}px`;
	// 	newDiv.textContent = "?";
	// 	document.querySelector("#brackets").appendChild(newDiv);
	// }
}

export function enterNicknames(n) {
	// n = 1;
	const form = document.createElement("form");
	form.id = "nicknames_form";
	for (let i = 0; i < n; i++) {
		const userBox = document.createElement("div");
		userBox.classList.add("user-box");
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
	button.id = "GO_N";
	form.appendChild(button);
	document.querySelector("#nickname_setup_box").appendChild(form);
}
