import { GameMode } from './main.js';
import { drawBrackets } from './brackets.js';

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
		document.getElementById("main-buttons").style.display = "block";
	}
});

document.getElementById("main-buttons").addEventListener("click", function() {
	var button_id = event.target.id;
	if (event.target.tagName.toLowerCase() === "button") {
		document.getElementById("main-buttons").classList.add("hidden");
		if (button_id === "online-mode") {
			document.getElementById("login-box").style.display = "block";
			document.getElementById("login-box").classList.add("shown");
		}
		else if (button_id === "tournoi-mode") {
			document.getElementById("tournoi").style.display = "block";
			document.getElementById("tournoi").classList.add("shown");
			document.getElementById("OK_T").addEventListener("click", function() {
				document.getElementById("tournoi").style.opacity = "1";
				document.getElementById("tournoi").classList.remove("shown");
				document.getElementById("tournoi").classList.add("hidden");
				setTimeout(function() {
					document.getElementById("brackets").style.display = "block";
					drawBrackets(document.getElementById("slider1").value);
				}, 500);
				// GameMode(2);
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
	document.getElementById("PLAYERS_T").textContent = `${this.value}`;
});
document.getElementById("slider1").addEventListener("input", function() {
	document.getElementById("PLAYERS_T").textContent = `${this.value}`;
});
document.getElementById("slider1").addEventListener("mouseup", function() {
	document.getElementById("PLAYERS_T").textContent = `PLAYERS`;
});

document.getElementById("slider2").addEventListener("mousedown", function() {
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
	document.getElementById("DIFFICULTY_T").textContent = `DIFFICULTY`;
});

document.getElementById("slider3").addEventListener("mousedown", function() {
	if (`${this.value}` === '0') {
		document.getElementById("MODE_T").textContent = `DEFAULT`;
	} else {
		document.getElementById("MODE_T").textContent = `POWER-UPS`;
	}
});
document.getElementById("slider3").addEventListener("input", function() {
	if (`${this.value}` === '0') {
		document.getElementById("MODE_T").textContent = `DEFAULT`;
	} else {
		document.getElementById("MODE_T").textContent = `POWER-UPS`;
	}
});
document.getElementById("slider3").addEventListener("mouseup", function() {
	document.getElementById("MODE_T").textContent = `MODE`;
});
