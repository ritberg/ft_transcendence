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

document.getElementById("online-mode").addEventListener("click", function() {
	// const login_elements = document.getElementsByClassName("login-box");
	// for (let i = 0; i < login_elements.length; i++)
	// 	login_elements[i].style.display = "block";
	document.getElementById("main-buttons").style.display = "none";
	document.getElementById("login-box").style.display = "block";
});
