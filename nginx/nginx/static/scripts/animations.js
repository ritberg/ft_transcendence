import { sleep } from './utils.js';
import { GameMode } from './main.js';
import { drawBrackets, enterNicknames } from './brackets.js';
import { online_game } from '../online/index.js';

export var username_global = "guest";

document.addEventListener("DOMContentLoaded", function () {
	
	//////// CSRF token ////////

	let csrfMetaTag = document.querySelector('meta[name="csrf-token"]');
	let token = csrfMetaTag ? csrfMetaTag.getAttribute("content") : null;

	if (!token) {
		console.error("CSRF token not found!");
		return;
	}

	const updateCSRFToken = (newToken) => {
		console.log("old token : ", token);
		token = newToken;
		console.log("new token : ", token);
		document.querySelector('meta[name="csrf-token"]').setAttribute("content", newToken);
	};

	/////////// frontend ////////////
	
	let usernameLabel = document.getElementById("user-name");

	const displayProfile = (user) => {
		usernameLabel.textContent = user.username;
		username_global = user.username;
		localStorage.setItem("user", JSON.stringify(user));
	};
	let storedUser = localStorage.getItem("user");
	if (storedUser) {
		let user = JSON.parse(storedUser);
		displayProfile(user);
	}

	document.getElementById("hamburger-icon").addEventListener("click", function () {
		document.getElementById("hamburger-icon").classList.toggle("active");
		document.getElementById("vertical-tab").classList.toggle("active");
	});

	document.getElementById("profile-button").addEventListener("click", function () {
		if (window.getComputedStyle(document.getElementById("profile-box_main")).display === "none") {
			document.getElementById("profile-box_main").style.display = "block";
			document.getElementById("profile-box_main1").style.display = "none";
			document.getElementById("main-buttons").style.display = "none";
			usersListBox.classList.remove('show');
		} else {
			document.getElementById("profile-box_main").style.display = "none";
			document.getElementById("profile-box_main1").style.display = "none";
			document.getElementById("main-buttons").style.display = "flex";
			usersListBox.classList.remove('show');
		}
	});


	////////////////////// SIGNUP ////////////////////////////

	let signupUrl = "https://" + window.location.host + "/auth/register/";
	let signupForm = document.getElementById("go");

	signupForm.addEventListener("click", function (event) {
		event.preventDefault();
		let username = document.getElementById("username").value;
		let email = document.getElementById("email").value;
		let password = document.getElementById("password").value;

		console.log({ username, email, password });

		fetch(signupUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-CSRFToken": token,
			},
			body: JSON.stringify({ username, email, password }),
		})
			.then((response) => {
				if (!response.ok) {
					console.log(response);
					throw new Error("Network response was not ok");
				}
				return response.json();
			})
			.then((data) => {
				console.log(data);
				console.log("token received : ", data.crsfToken);
				updateCSRFToken(data.crsfToken);
				// localStorage.setItem("user", JSON.stringify(data.data));
				// displayProfile(data.data);
			})
			.catch((error) => {
				console.error("Fetch error: ", error);
			});
	});


	////////////////////// LOGIN ////////////////////////////

	let loginForm = document.getElementById("go1");
	let loginUrl = "https://" + window.location.host + "/auth/login/";

	loginForm.addEventListener("click", function (event) {
		event.preventDefault();

		let username = document.getElementById("username1").value;
		let password = document.getElementById("password1").value;

		console.log("Sending login request...");
		console.log("username : ", username);

		fetch(loginUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-CSRFToken": token,
			},
			body: JSON.stringify({ username, password }),
			credentials: "include",
		})
			.then((response) => {
				console.log("Response Headers:", [...response.headers.entries()]);

				if (!response.ok) {
					console.log("Full response:", response);
					throw new Error("Network response was not ok");
				}

				return response.json();
			})
			.then((data) => {
				console.log("Cookies after login response:", document.cookie);
				console.log("Login successful. Server response data:", data);
				console.log("data : ", data.data);
				console.log("token received : ", data.crsfToken);
				updateCSRFToken(data.crsfToken);
				localStorage.setItem("user", JSON.stringify(data.data));
				username_global = data.data.username;
				displayProfile(data.data);
			})
			.catch((error) => {
				console.error("Fetch error:", error);
			});
	});


	/////////// frontend ////////////

	let btnLogin = document.getElementById("login");
	let btnSignup = document.getElementById("signup");

	btnSignup.addEventListener("click", function () {
		document.getElementById("profile-box_main").style.display = "block";
		document.getElementById("profile-box_main1").style.display = "none";
	});

	btnLogin.addEventListener("click", function () {
		document.getElementById("profile-box_main").style.display = "none";
		document.getElementById("profile-box_main1").style.display = "block";
	});




	////////////////////// UPDATE THE BLOCKED USERS LIST ////////////////////////////

	var blocked_users;
	let blockUserUrl = "https://" + window.location.host + "/auth/block-user/";
	let unblockUserUrl = "https://" + window.location.host + "/auth/unblock-user/";
	let ListBlockedUsersUrl = "https://"  + window.location.host + "/auth/list-blocked-users/";

	const fetchBlockedUsers = async () => {
		try {
			const response = await fetch(ListBlockedUsersUrl, {
				method: 'GET',
				headers: {
					"X-CSRFToken": token,
					"Content-Type": "application/json",
				}
			});
			if (!response.ok) {
				throw new Error('Failed to fetch blocked users');
			}
			const data = await response.json();
			console.log('Blocked users:', data);
			blocked_users = data.blocked_users;
		} catch (error) {
			console.error('Error fetching blocked users:', error);
		}
	};


	////////////////////// BLOCK A USER (not used yet) ////////////////////////////

	const blockUser = async () => {
		const username = document.getElementById("user-username-to-block").value;
		console.log("user username: ", username);
		const messageContainer = document.getElementById("block-user-message");
		if (!username) {
			messageContainer.textContent = "Please enter a username";
			return;
		}

		try {
			const userId = await getUserId(username);
			console.log("user id: ", userId);
			const response = await fetch(blockUserUrl, {
				method: "POST",
				headers: {
					"X-CSRFToken": token,
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({ to_user: userId }),
			});
			const data = await response.json();
			messageContainer.textContent = data.message;
			if (response.ok) {
				document.getElementById("user-username-to-block").value = "";
				fetchBlockedUsers();
			}
		} catch (error) {
			console.error("Error blocking user:", error);
			messageContainer.textContent = "Error blocking user";
		}
	};


	////////////////////// UNBLOCK A USER (not used yet) ////////////////////////////

	const unblockUser = async () => {
		const username = document.getElementById("user-username-to-unblock").value;
		console.log("User username: ", username);
		const messageContainer = document.getElementById("unblock-user-message");
		if (!username) {
			messageContainer.textContent = "Please enter a username";
			return;
		}
		try {
			const userId = await getUserId(username);
			console.log("User id: ", userId);
			const response = await fetch(unblockUserUrl, {
				method: "POST",
				headers: {
					"X-CSRFToken": token,
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({ user_to_unblock_id: userId }),
			});
			const data = await response.json();
			messageContainer.textContent = data.message;
			if (response.ok) {
				document.getElementById("user-username-to-unblock").value = "";
				fetchBlockedUsers();
			}
		} catch (error) {
			console.error("Error unblocking user:", error);
			messageContainer.textContent = "Error unblocking user";
		}
	};


	////////////////////// USERS LIST + BUTTON "START CHAT" ////////////////////////////

	let usrsLst = document.getElementById("users-full-list-button");
	let usersListBox = document.getElementById("users-list-box");
	var chat_room_name;

	usrsLst.addEventListener("click", function (event) {					//// frontend
		document.getElementById("profile-box_main").style.display = "none";
		document.getElementById("profile-box_main1").style.display = "none";
		if (window.getComputedStyle(document.getElementById("users-list-box")).display === "none") {
			usersListBox.classList.add('show');
			document.getElementById("main-buttons").style.display = "none";
		}
		else {
			usersListBox.classList.remove('show');
			document.getElementById("main-buttons").style.display = "block";
		}

		let usersUrl = "https://" + window.location.host + "/users/";

		fetch(usersUrl, {
			method: "POST",
			headers: {
				"X-CSRFToken": token,
				"Content-Type": "application/json",
			},
			credentials: "include",
		})
			.then(response => response.json())
			.then(data => {
				const usersList = document.getElementById('users-list-container');
				usersList.innerHTML = '';

				if (data.users.length != 0) {
					data.users.forEach(user => {
						const li = document.createElement('li');     		////
						li.textContent = user.username + ' ';        		//// dinamically creating users list with
																			//// buttons "start chat" 
						const button = document.createElement('button');	////
						button.textContent = 'Start Chat';					////

						button.addEventListener('click', (e) => {
							e.preventDefault();
							if (!(document.getElementById("chat-box").classList.item("active")))
								document.getElementById("chat-box").classList.toggle("active");
							handleChatLinkClick(user.username);				//// opening chat
						});

						li.appendChild(button);
						usersList.appendChild(li);
					});
				}
			})
			.catch(error => console.error('Error fetching user data:', error));
	});


	////////////////////// ACCEPT INVITATION TO PLAY PONG ////////////////////////////

	function invite_accept() {
		let ws
		fetch("https://" + window.location.host + "/room/invite", {
			method: "POST",
			body: JSON.stringify({
				chat_name: chat_room_name,
				username: username_global,
			}),
			headers: {
				"Content-type": "application/json; charset=UTF-8",
				"X-CSRFToken": token,
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
					usersListBox.classList.remove('show');
					ws = new WebSocket("wss://" + window.location.host + "/ws/online/" + data.room_name + "/");
					online_game(ws);			//// launching the online pong game
					close(ws);
				}
			})
	}

	const chatContainer = document.getElementById("chat-container");

	chatContainer.addEventListener("click", function (event) {			//// invitation to play pong online
		if (event.target && event.target.id === "invite-link") {		//// clicking on a dynamically added button
			invite_accept(event);
		}
	});


	////////////////////// CHAT ////////////////////////////

	var active_connections = [];
	var active_connections_num = 0;
	var chatSocket = null;

	function handleChatLinkClick(username) {
		// for (let j = 0; j < active_connections.length; j++) {			//// prevent starting the same chat
		// 	if (active_connections[j] == username)						//// several times
		// 		return;
		// }
		// active_connections[active_connections_num++] = username;

		const chatUrl = "https://" + window.location.host + "/chat/" + username + "/";

		fetch(chatUrl, {
			method: "POST",
			headers: {
				"X-CSRFToken": token,
				"Content-Type": "application/json",
			},
			credentials: "include",
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error("Network response was not ok");
				}
				return response.json();
			})
			.then((data) => {
				console.log("++ room_name : ", data.room_name);
				console.log("++ other_user : ", data.other_user);
				console.log("++ username : ", data.username);
				console.log("++ messages : ", data.messages);

				chat_room_name = data.room_name;

				const chatContainer = document.createElement('div');
				chatContainer.classList.add('chat__container');
				document.getElementById("chat-container").innerHTML = "";
				if (data && data.other_user && Array.isArray(data.messages)) {		//// adding messages into the chat container dinamically
					chatContainer.innerHTML = `
          <center><h1>Chat with ${data.other_user}</h1></center>
          <div class="chat__item__container" id="id_chat_item_container">
            ${data.messages.map(message => `
              <div class="chat__message ${message.fields.username === data.username ? 'chat__message--self' : 'chat__message--other'}">
                <img src="https://via.placeholder.com/40" alt="User Photo">
                <div class="chat__message__content">
                  <div class="chat__message__username">${message.fields.username}</div>
                  <div class="chat__message__text">${message.fields.message}</div>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="chat__input__container">
            <input type="text" id="id_message_send_input" placeholder="Type a message..." />
            <button type="submit" id="id_message_send_button">Send Message</button>
			<button type="submit" id="id_invit_button">Invite to Pong</button>
          </div>
        `;
				}
				else {
					console.error('data is missing or is not an array', data);
				}

				const listItemElement = document.getElementById('chat-container');
				listItemElement.appendChild(chatContainer);

				const roomName = data.room_name;
				if (chatSocket !== null) {
					chatSocket.close();
				}
				chatSocket = new WebSocket("wss://" + window.location.host + "/chat/" + roomName + "/");

				chatSocket.onopen = function (e) {
					console.log("The connection was set up successfully!");
				};

				chatSocket.onclose = function (e) {
					console.log("The connection was closed successfully!");
				};

				document.querySelector("#id_message_send_input").focus();
				document.querySelector("#id_message_send_input").onkeyup = function (e) {
					if (e.keyCode === 13) {
						document.querySelector("#id_message_send_button").click();
					}
				};

				document.querySelector("#id_message_send_button").onclick = async function (e) {
					await fetchBlockedUsers();
					let ok = 0;
					console.log("blocking situation ", blocked_users.length);
					for (let i = 0; i < blocked_users.length; i++) {
						if (blocked_users[i] == data.other_user)
							ok = 1;
					}
					if (ok == 0) {
						const messageInput = document.querySelector("#id_message_send_input").value;
						chatSocket.send(JSON.stringify({ message: messageInput, username: data.username}));
					}
				};

				document.querySelector("#id_invit_button").onclick = async function (e) {
					let ws;
					fetch("https://" + window.location.host + "/room/invite", {
						method: "POST",
						body: JSON.stringify({
							chat_name: data.room_name,
							username: username_global,
						}),
						headers: {
							"Content-type": "application/json; charset=UTF-8",
							"X-CSRFToken": token,
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
								usersListBox.classList.remove('show');
								chatSocket.send(JSON.stringify({ message: "A pong game has been requested <button type=\"submit\" id=\"invite-link\">accept</button>", username: username_global}));
								ws = new WebSocket("wss://" + window.location.host + "/ws/online/" + data.room_name + "/");
								online_game(ws);
								close(ws);
							}
						})
				};

				chatSocket.onmessage = async function (e) {
					await fetchBlockedUsers();
					const data = JSON.parse(e.data);
					let ok = 0;
					console.log("blocking situation ", blocked_users.length);
					for (let i = 0; i < blocked_users.length; i++) {
						if (blocked_users[i] == data.username)
							ok = 1;
					}
					if (ok == 1)
						return;

					const currentUser = data.username;
					const div = document.createElement("div");
					div.classList.add("chat__message");
					if (data.username === currentUser) {
						div.classList.add("chat__message--self");
					} else {
						div.classList.add("chat__message--other");
					}
					
					div.innerHTML = `
            <img src="https://via.placeholder.com/40" alt="User Photo">
            <div class="chat__message__content">
              <div class="chat__message__username">${data.username}</div>
              <div class="chat__message__text">${data.message}</div>
            </div>
          `;
					document.querySelector("#id_message_send_input").value = "";
					document.querySelector("#id_chat_item_container").appendChild(div);
					document.querySelector("#id_chat_item_container").scrollTop = document.querySelector("#id_chat_item_container").scrollHeight;
				}
			})
			.catch(error => console.error('Error fetching chat data:', error));
	}







	/////////////////////////// frontend ////////////////////////////////

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

	document.getElementById("main-buttons").addEventListener("click", function () {
		var button_id = event.target.id;
		if (event.target.tagName.toLowerCase() === "button") {
			document.getElementById("main-buttons").classList.add("hidden");
			if (button_id === "online-mode") {
				document.getElementById("login-box").style.display = "block";
				document.getElementById("login-box").classList.add("shown");
				document.getElementById("GO_O").addEventListener("click", function () {
					GameMode(3);
				});
			}
			else if (button_id === "tournoi-mode") {
				document.getElementById("tournoi").style.display = "block";
				document.getElementById("tournoi").classList.add("shown");
				document.getElementById("OK_T").addEventListener("click", async function () {
					document.getElementById("tournoi").style.opacity = "1";
					document.getElementById("tournoi").classList.remove("shown");
					document.getElementById("tournoi").classList.add("hidden");
					await sleep(700);
					document.getElementById("tournoi").style.display = "none";
					document.getElementById("nickname_setup_box").style.display = "flex";
					enterNicknames(document.getElementById("slider1").value);
					document.getElementById("nicknames_form").addEventListener("submit", function (event) {
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
			document.getElementById("main-buttons").addEventListener("animationend", function () {
				document.getElementById("main-buttons").style.display = "none";
			});
		}
	});

	document.getElementById("slider1").addEventListener("mousedown", function () {
		document.getElementById("PLAYERS_T").style.textShadow = `white 0 0 5px`;
		document.getElementById("PLAYERS_T").textContent = `${this.value}`;
	});
	document.getElementById("slider1").addEventListener("input", function () {
		document.getElementById("PLAYERS_T").textContent = `${this.value}`;
	});
	document.getElementById("slider1").addEventListener("mouseup", function () {
		document.getElementById("PLAYERS_T").style.textShadow = `none`;
		document.getElementById("PLAYERS_T").textContent = `PLAYERS`;
	});

	document.getElementById("slider2").addEventListener("mousedown", function () {
		document.getElementById("DIFFICULTY_T").style.textShadow = `white 0 0 5px`;
		if (`${this.value}` === '1') {
			document.getElementById("DIFFICULTY_T").textContent = `EASY`;
		} else if (`${this.value}` === '2') {
			document.getElementById("DIFFICULTY_T").textContent = `MEDIUM`;
		} else {
			document.getElementById("DIFFICULTY_T").textContent = `HARD`;
		}
	});
	document.getElementById("slider2").addEventListener("input", function () {
		if (`${this.value}` === '1') {
			document.getElementById("DIFFICULTY_T").textContent = `EASY`;
		} else if (`${this.value}` === '2') {
			document.getElementById("DIFFICULTY_T").textContent = `MEDIUM`;
		} else {
			document.getElementById("DIFFICULTY_T").textContent = `HARD`;
		}
	});
	document.getElementById("slider2").addEventListener("mouseup", function () {
		document.getElementById("DIFFICULTY_T").style.textShadow = `none`;
		document.getElementById("DIFFICULTY_T").textContent = `DIFFICULTY`;
	});

	document.getElementById("slider3").addEventListener("mousedown", function () {
		document.getElementById("MODE_T").style.textShadow = `white 0 0 5px`;
		if (`${this.value}` === '0') {
			document.getElementById("MODE_T").textContent = `DEFAULT`;
		} else {
			document.getElementById("MODE_T").textContent = `POWER-UPS`;
		}
	});
	document.getElementById("slider3").addEventListener("input", function () {
		// document.getElementById("MODE_T").style.textShadow = `none`;
		if (`${this.value}` === '0') {
			document.getElementById("MODE_T").textContent = `DEFAULT`;
		} else {
			document.getElementById("MODE_T").textContent = `POWER-UPS`;
		}
	});
	document.getElementById("slider3").addEventListener("mouseup", function () {
		document.getElementById("MODE_T").style.textShadow = `none`;
		document.getElementById("MODE_T").textContent = `MODE`;
	});

});