document.querySelector(".hamburger-icon").addEventListener("click", function() {
	document.querySelector(".hamburger-icon").classList.toggle("active");
	document.querySelector(".vertical-tab").classList.toggle("active");
	document.querySelector(".vertical-tab button").classList.toggle("active");
});

document.getElementById("chat-button").addEventListener("click", function() {
	document.querySelector(".chat-box").classList.toggle("active");
});

export function loginBox() {
	const login_elements = document.getElementsByClassName("login-box");
	for (let i = 0; i < login_elements.length; i++)
		login_elements[i].style.display = "block";
}
