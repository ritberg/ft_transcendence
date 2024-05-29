import { sleep } from './utils.js';
import { GameMode } from './main.js';
import { drawBrackets, enterNicknames } from './brackets.js';
import { online_game } from '../online/index.js';

document.getElementById("hamburger-icon").addEventListener("click", function() {
	document.getElementById("hamburger-icon").classList.toggle("active");
	document.getElementById("vertical-tab").classList.toggle("active");
});

document.getElementById("chat-button").addEventListener("click", function() {
	document.getElementById("chat-box").classList.toggle("active");
});

document.getElementById("profile-button").addEventListener("click", function() {
	if (window.getComputedStyle(document.getElementById("profile-box_main")).display === "none") {
		document.getElementById("profile-box_main").style.display = "block";
		document.getElementById("main-buttons").style.display = "none";
	} else {
		document.getElementById("profile-box_main").style.display = "none";
		document.getElementById("main-buttons").style.display = "flex";
	}
});

document.addEventListener('DOMContentLoaded', () => {
	const inputElement = document.getElementById('room_name_input');
	const textElement = document.getElementById('empty_room_text');

	textElement.style.opacity = '0';
	inputElement.addEventListener('focus', () => {
		if (inputElement.value.length === 0) {
			textElement.style.opacity = '1';
		}
	});
	inputElement.addEventListener('blur', () => {
		textElement.style.opacity = '0';
	});
	inputElement.addEventListener('input', () => {
		if (inputElement.value.length === 0) {
			textElement.style.transition = 'none';
			textElement.style.opacity = '1';
			setTimeout(() => {
				textElement.style.transition = '.5s';
			}, 1000);
		} else {
			textElement.style.transition = 'none';
			textElement.style.opacity = '0';
			setTimeout(() => {
				textElement.style.transition = '.5s';
			}, 1000);
		}
	});
});

document.getElementById("main-buttons").addEventListener("click", function() {
	var button_id = event.target.id;
	if (event.target.tagName.toLowerCase() === "button") {
		document.getElementById("main-buttons").classList.add("hidden");
		if (button_id === "online-mode") {
			document.getElementById("login-box").style.display = "block";
			document.getElementById("login-box").classList.add("shown");
			document.getElementById("GO_O").addEventListener("click", function() {
				document.getElementById("login-box").style.display = "none";
				const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
				let room_selected = document.querySelector("#room_name_input").value;
				let ws;
				fetch("https://" + window.location.host + "/room/", {
					method: "POST",
					body: JSON.stringify({
						room: room_selected,
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
						ws = new WebSocket("wss://" + window.location.host + "/ws/notification/" + data.room_name + "/");
						online_game(ws);
					}
				})
			});
		}
		else if (button_id === "tournoi-mode") {
			document.getElementById("tournoi").style.display = "block";
			document.getElementById("tournoi").classList.add("shown");
			document.getElementById("OK_T").addEventListener("click", async function() {
				document.getElementById("tournoi").style.opacity = "1";
				document.getElementById("tournoi").classList.remove("shown");
				document.getElementById("tournoi").classList.add("hidden");
				await sleep(700);
				document.getElementById("tournoi").style.display = "none";
				document.getElementById("nickname_setup_box").style.display = "flex";
				enterNicknames(document.getElementById("slider1").value);
				document.getElementById("nicknames_form").addEventListener("submit", function(event) {
					event.preventDefault();
					// if (document.forms["nicknames_form"]["player_1"].value != "" && document.forms["nicknames_form"]["player_1"].value != null) {
					// }
					document.getElementById("nickname_setup_box").style.display = "none";
					document.getElementById("brackets").style.display = "block";
					drawBrackets(document.getElementById("slider1").value);
				});
			});
		}
		else if (button_id === "pvp-mode")
			GameMode(0);
		else if (button_id === "cpu-mode")
			GameMode(1);
		document.getElementById("main-buttons").addEventListener("animationend", function() {
			document.getElementById("main-buttons").style.display = "none";
		});
	}
});

document.getElementById("slider1").addEventListener("mousedown", function() {
	document.getElementById("PLAYERS_T").style.textShadow = `white 0 0 5px`;
	document.getElementById("PLAYERS_T").textContent = `${this.value}`;
});
document.getElementById("slider1").addEventListener("input", function() {
	document.getElementById("PLAYERS_T").textContent = `${this.value}`;
});
document.getElementById("slider1").addEventListener("mouseup", function() {
	document.getElementById("PLAYERS_T").style.textShadow = `none`;
	document.getElementById("PLAYERS_T").textContent = `PLAYERS`;
});

document.getElementById("slider2").addEventListener("mousedown", function() {
	document.getElementById("DIFFICULTY_T").style.textShadow = `white 0 0 5px`;
	if (`${this.value}` === '1') {
		document.getElementById("DIFFICULTY_T").textContent = `EASY`;
	} else if (`${this.value}` === '2') {
		document.getElementById("DIFFICULTY_T").textContent = `MEDIUM`;
	} else {
		document.getElementById("DIFFICULTY_T").textContent = `HARD`;
	}
});
document.getElementById("slider2").addEventListener("input", function() {
	if (`${this.value}` === '1') {
		document.getElementById("DIFFICULTY_T").textContent = `EASY`;
	} else if (`${this.value}` === '2') {
		document.getElementById("DIFFICULTY_T").textContent = `MEDIUM`;
	} else {
		document.getElementById("DIFFICULTY_T").textContent = `HARD`;
	}
});
document.getElementById("slider2").addEventListener("mouseup", function() {
	document.getElementById("DIFFICULTY_T").style.textShadow = `none`;
	document.getElementById("DIFFICULTY_T").textContent = `DIFFICULTY`;
});

document.getElementById("slider3").addEventListener("mousedown", function() {
	document.getElementById("MODE_T").style.textShadow = `white 0 0 5px`;
	if (`${this.value}` === '0') {
		document.getElementById("MODE_T").textContent = `DEFAULT`;
	} else {
		document.getElementById("MODE_T").textContent = `POWER-UPS`;
	}
});
document.getElementById("slider3").addEventListener("input", function() {
	// document.getElementById("MODE_T").style.textShadow = `none`;
	if (`${this.value}` === '0') {
		document.getElementById("MODE_T").textContent = `DEFAULT`;
	} else {
		document.getElementById("MODE_T").textContent = `POWER-UPS`;
	}
});
document.getElementById("slider3").addEventListener("mouseup", function() {
	document.getElementById("MODE_T").style.textShadow = `none`;
	document.getElementById("MODE_T").textContent = `MODE`;
});
