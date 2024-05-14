import { GameMode } from './main.js';

document.getElementById("hamburger-icon").addEventListener("click", function() {
	document.getElementById("hamburger-icon").classList.toggle("active");
	document.getElementById("vertical-tab").classList.toggle("active");
	// document.getElementById("vertical-tab button").classList.toggle("active");
});

document.getElementById("chat-button").addEventListener("click", function() {
	// if (document.getElementById("chat-box").classList.contains("active"))
	// 	document.getElementById("chat-box").style.display = "none";
	// else
	// 	document.getElementById("chat-box").style.display = "block";
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

// document.getElementById("online-mode").addEventListener("click", function() {
// 	// const login_elements = document.getElementsByClassName("login-box");
// 	// for (let i = 0; i < login_elements.length; i++)
// 	// 	login_elements[i].style.display = "block";
// 	document.getElementById("main-buttons").style.display = "none";
// 	document.getElementById("login-box").style.display = "block";
// });

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

		// setTimeout(function() {
		// 	document.getElementById("main-buttons").classList.remove("animated");
		// 	document.getElementById("main-buttons").style.display = "none";
		// 	if (event.target.id === "online-mode")
		// 		document.getElementById("login-box").style.display = "block";
		// }, 1000);
	// }
	// document.getElementById("main-buttons").classList.add("hidden");


// document.getElementById("main-buttons").addEventListener("click", function() {
// 	var button_id = event.target.id;
// 	if (event.target.tagName.toLowerCase() === "button") {
// 		document.getElementById("main-buttons").classList.add("hidden");
// 		document.getElementById("main-buttons").addEventListener("transitionend", function() {
// 			document.getElementById("main-buttons").style.display = "none";
// 			if (button_id === "online-mode") {
// 				document.getElementById("login-box").style.display = "block";
// 				document.getElementById("login-box").classList.add("shown");
// 			}
// 		});
// 	}
// });
