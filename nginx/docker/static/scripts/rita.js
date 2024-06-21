import { sleep } from './utils.js';
import { GameMode } from './main.js';
import { drawBrackets, enterNicknames } from './brackets.js';
import { online_game } from '../online/index.js';

export var username_global = "guest";
export var token;

document.addEventListener("DOMContentLoaded", function () {
	
	//////// CSRF token ////////

	let csrfMetaTag = document.querySelector('meta[name="csrf-token"]');
	token = csrfMetaTag ? csrfMetaTag.getAttribute("content") : null;

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

	////////////////////// SIGNUP ////////////////////////////

	let signupUrl = "https://" + window.location.host + "/auth/register/";
	let signupForm = document.getElementById("b-signup-ok");

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
	let loginUrl = "https://" + window.location.host + "/auth/signin/";

	loginForm.addEventListener("click", function (event) {
		event.preventDefault();

		let username = document.getElementById("username1").value;
		let password = document.getElementById("password1").value;

		console.log("Sending signin request...");
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
				console.log("Cookies after signin response:", document.cookie);
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

	let btnLogin = document.getElementById("b-to_signin");
	let btnSignup = document.getElementById("b-to_signup");

	btnSignup.addEventListener("click", function () {
		document.getElementById("profile-box_signup").style.display = "block";
		document.getElementById("profile-box_signin").style.display = "none";
	});

	btnLogin.addEventListener("click", function () {
		document.getElementById("profile-box_signup").style.display = "none";
		document.getElementById("profile-box_signin").style.display = "block";
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
		document.getElementById("profile-box_signup").style.display = "none";
		document.getElementById("profile-box_signin").style.display = "none";
		if (window.getComputedStyle(document.getElementById("users-list-box")).display === "none") {
			usersListBox.classList.add('show');
			document.getElementById("main-menu").style.display = "none";
		}
		else {
			usersListBox.classList.remove('show');
			document.getElementById("main-menu").style.display = "flex";
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
					ws = new WebSocket("wss://" + window.location.host + "/ws/online/" + data.room_name + "/" + username_global + "/");
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
								ws = new WebSocket("wss://" + window.location.host + "/ws/online/" + data.room_name + "/" + username_global + "/");
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
});






