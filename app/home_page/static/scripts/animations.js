import { sleep } from './utils.js';
import { GameMode } from './main.js';

document.getElementById("tabs-icon").addEventListener("hover", function() {
	// document.getElementById("tabs-icon").classList.toggle("active");
	console.log(4);
	document.getElementById("tabs-list").classList.toggle("active");
});

document.getElementById("tl-chat").addEventListener("click", function() {
	document.getElementById("chat-window").classList.toggle("active");
});

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

//document.getElementById("s-difficulty").addEventListener("mousedown", function() {
//	document.getElementById("t-difficulty").style.textShadow = `white 0 0 5px`;
//	if (`${this.value}` === '0') {
//		document.getElementById("t-difficulty").textContent = `EASY`;
//	} else if (`${this.value}` === '1') {
//		document.getElementById("t-difficulty").textContent = `MEDIUM`;
//	} else {
//		document.getElementById("t-difficulty").textContent = `HARD`;
//	}
//});
//document.getElementById("s-difficulty").addEventListener("input", function() {
//	if (`${this.value}` === '0') {
//		document.getElementById("t-difficulty").textContent = `EASY`;
//	} else if (`${this.value}` === '1') {
//		document.getElementById("t-difficulty").textContent = `MEDIUM`;
//	} else {
//		document.getElementById("t-difficulty").textContent = `HARD`;
//	}
//});
//document.getElementById("s-difficulty").addEventListener("mouseup", function() {
//	document.getElementById("t-difficulty").style.textShadow = `none`;
//	document.getElementById("t-difficulty").textContent = `DIFFICULTY`;
//});
//
//document.getElementById("s-mode").addEventListener("mousedown", function() {
//	document.getElementById("t-mode").style.textShadow = `white 0 0 5px`;
//	if (`${this.value}` === '0') {
//		document.getElementById("t-mode").textContent = `NONE`;
//	} else if (`${this.value}` === '1') {
//		document.getElementById("t-mode").textContent = `ALL`;
//	} else {
//		document.getElementById("t-mode").textContent = `REVERSED`;
//	}
//});
//document.getElementById("s-mode").addEventListener("input", function() {
//	if (`${this.value}` === '0') {
//		document.getElementById("t-mode").textContent = `DEFAULT`;
//	} else if (`${this.value}` === '1') {
//		document.getElementById("t-mode").textContent = `ALL`;
//	} else {
//		document.getElementById("t-mode").textContent = `REVERSED`;
//	}
//});
//document.getElementById("s-mode").addEventListener("mouseup", function() {
//	document.getElementById("t-mode").style.textShadow = `none`;
//	document.getElementById("t-mode").textContent = `POWER-UPS	`;
//});
