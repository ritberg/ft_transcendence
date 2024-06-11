import { sleep } from './utils.js';
import { GameMode } from './main.js';
import { drawBrackets, enterNicknames } from './brackets.js';
import { online_game } from '../online/index.js';

document.getElementById("tabs-icon").addEventListener("hover", function() {
	// document.getElementById("tabs-icon").classList.toggle("active");
	console.log(4);
	document.getElementById("tabs-list").classList.toggle("active");
});

//document.getElementById("tl-profile").addEventListener("click", function () {
//	if (window.getComputedStyle(document.getElementById("profile-box_main")).display === "none") {
//		document.getElementById("profile-box_main").style.display = "block";
//		document.getElementById("profile-box_signin").style.display = "none";
//		document.getElementById("main-menu").style.display = "none";
//		//usersListBox.classList.remove('show');
//	} else {
//		document.getElementById("profile-box_main").style.display = "none";
//		document.getElementById("profile-box_signin").style.display = "none";
//		document.getElementById("main-menu").style.display = "flex";
//		//usersListBox.classList.remove('show');
//	}
//});

document.addEventListener('DOMContentLoaded', () => {
	const inputElement = document.getElementById('i-room_name');
	const textElement = document.getElementById('t-empty_room');

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

document.getElementById("main-menu").addEventListener("click", function () {
	var button_id = event.target.id;
	if (event.target.tagName.toLowerCase() === "button") {
		document.getElementById("main-menu").classList.add("hidden");
		if (button_id === "online-mode") {
			document.getElementById("online-box").style.display = "block";
			document.getElementById("online-box").classList.add("shown");
			document.getElementById("b-online-go").addEventListener("click", function () {
				GameMode(3);
			});
		}
		else if (button_id === "tourney-mode") {
			document.getElementById("tourney_settings-box").style.display = "block";
			document.getElementById("tourney_settings-box").classList.add("shown");
			document.getElementById("b-tourney_settings").addEventListener("click", async function() {
				document.getElementById("tourney_settings-box").style.opacity = "1";
				document.getElementById("tourney_settings-box").classList.remove("shown");
				document.getElementById("tourney_settings-box").classList.add("hidden");
				document.getElementById("nickname_setup-box").style.display = "flex";
				document.getElementById("nickname_setup-box").classList.add("shown");
				enterNicknames(document.getElementById("s-players").value);
				await sleep(500);
				document.getElementById("tourney_settings-box").style.display = "none";
				document.getElementById("nicknames_form").addEventListener("submit", async function(event) {
					event.preventDefault();
					createPlayers();
					document.getElementById("nickname_setup-box").style.opacity = "1";
					document.getElementById("nickname_setup-box").classList.remove("shown");
					document.getElementById("nickname_setup-box").classList.add("hidden");
					await sleep(300);
					await drawBrackets();
					document.getElementById("nickname_setup-box").style.display = "none";
					GameMode(2);
				});
			});
		}
		else if (button_id === "pvp-mode")
			GameMode(0);
		else if (button_id === "cpu-mode")
			GameMode(1);
		document.getElementById("main-menu").addEventListener("animationend", function () {
			document.getElementById("main-menu").style.display = "none";
		});
	}
});

document.getElementById("s-players").addEventListener("mousedown", function() {
	document.getElementById("t-players").style.textShadow = `white 0 0 5px`;
	document.getElementById("t-players").textContent = `${this.value}`;
});
document.getElementById("s-players").addEventListener("input", function() {
	document.getElementById("t-players").textContent = `${this.value}`;
});
document.getElementById("s-players").addEventListener("mouseup", function() {
	document.getElementById("t-players").style.textShadow = `none`;
	document.getElementById("t-players").textContent = `PLAYERS`;
});

document.getElementById("s-points").addEventListener("mousedown", function() {
	document.getElementById("t-points").style.textShadow = `white 0 0 5px`;
	document.getElementById("t-points").textContent = `${this.value}`;
});
document.getElementById("s-points").addEventListener("input", function() {
	document.getElementById("t-points").textContent = `${this.value}`;
});
document.getElementById("s-points").addEventListener("mouseup", function() {
	document.getElementById("t-points").style.textShadow = `none`;
	document.getElementById("t-points").textContent = `POINTS`;
});
