import { sleep } from './utils.js';
import { GameMode } from './main.js';
import { drawBrackets, enterNicknames } from './brackets.js';
import { online_game } from '../online/pong_online.js';
import { tournamentSettings } from './animations.js';
import { route } from './router.js';

export var username_global = "guest";
export var token = localStorage.getItem("token") || null;
export var userIsConnected = JSON.parse(localStorage.getItem("userIsConnected")) || false;

export const getUserId = async (username) => {
	let getIdUrl = "https://" + window.location.host + `/auth/get-user-id/?username=${username}`;
	const response = await fetch(getIdUrl,
		{
			method: "GET",
			headers: {
				"X-CSRFToken": token,
				"Content-Type": "application/json",
			},
			credentials: "include",
		}
	);
	const data = await response.json();
	if (!response.ok) {
		throw new Error(data.error || "Error getting user ID");
	}
	console.log("data : ", data);
	return data.id;
};

const updateProfile = (user, isConnected, token) => {
	console.log("updateProfile called with =", user, isConnected, token);

	if (user !== null) {
		console.log("user is not null")
		username_global = user.username;
		localStorage.setItem("user", JSON.stringify(user));
		document.getElementById("user-name").textContent = user.username;
	}
	else {
		console.log("user is null")
		username_global = "guest";
		localStorage.removeItem("user");
		document.getElementById("user-name").textContent = "guest";
	}
	localStorage.setItem("userIsConnected", isConnected);
	userIsConnected = isConnected;
	console.log("userIsConnected : ", localStorage.getItem("userIsConnected"));
	if (token !== null) {
		updateCSRFToken(token);
	} else {
		localStorage.removeItem("token");
	}
};

const updateCSRFToken = (newToken) => {
	console.log("old token : ", token);
	token = newToken;
	localStorage.setItem("token", token);
	console.log("new token : ", token);
	document.querySelector('meta[name="csrf-token"]').setAttribute("content", newToken);
};

let usersClick, signupButton, logoutButton, loginButton;
document.addEventListener("DOMContentLoaded", function () {

	let storedUser = localStorage.getItem("user");
	if (storedUser) {
		let user = JSON.parse(storedUser);
		username_global = user.username;
		document.getElementById("user-name").textContent = user.username;
	}

	if (token == null) {
		let csrfMetaTag = document.querySelector('meta[name="csrf-token"]');
		token = csrfMetaTag ? csrfMetaTag.getAttribute("content") : null;
	}

	if (!token) {
		console.error("CSRF token not found!");
		return;
	}

	////////////////////// SIGNUP ////////////////////////////

	let signupUrl = "https://" + window.location.host + "/auth/register/";

	signupButton = async function (event) {
		event.preventDefault();
		let username = document.getElementById("username").value;
		let email = document.getElementById("email").value;
		let password = document.getElementById("password").value;

		console.log({ username, email, password });

		await fetch(signupUrl, {
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
				route("/signin/");
			})
			.catch((error) => {
				console.error("Fetch error: ", error);
			});
	}


	////////////////////// LOGIN ////////////////////////////

	//let loginForm = document.getElementById("b-signin-ok");
	let loginUrl = "https://" + window.location.host + "/auth/signin/";

	loginButton = async function (event) {
		event.preventDefault();

		let username = document.getElementById("username1").value;
		let password = document.getElementById("password1").value;

		console.log("Sending signin request...");
		console.log("username : ", username);

		return await fetch(loginUrl, {
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
			.then(async (data) => {
				console.log("Cookies after signin response:", document.cookie);
				console.log("Login successful. Server response data:", data);
				let user = data.data;
				console.log("data : ", user);
				console.log("token received : ", data.crsfToken);
				updateProfile(user, true, data.crsfToken);
				// await addGame(); // à supprimer
				return user;
			})
			.catch((error) => {
				console.error("Fetch error:", error);
			});
	}

	////////////////////// LOGOUT ////////////////////////////

	let logoutUrl = "https://" + window.location.host + "/auth/logout/";

	logoutButton = async function () {
		await fetch(logoutUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-CSRFToken": token,
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
				console.log("data: ", data);
				updateProfile(null, false, null);
			})
			.catch((error) => {
				console.error("Fetch error:", error);
			});
	}


	////////////////////// ADD FRIENDS ////////////////////////////

	let friendRequestUrl = "https://" + window.location.host + "/auth/send-friend-request/";
	let delFriendUrl = "https://" + window.location.host + "/auth/delete-friend/";

	const addFriend = async (username) => {
		// const username = document.getElementById("friend-username-to-add").value;
		console.log("friend username : ", username);
		// const messageContainer = document.getElementById("add-friend-message");
		if (!username) {
			return;
		}

		try {
			const userId = await getUserId(username);
			console.log("user id : ", userId);
			const response = await fetch(friendRequestUrl, {
				method: "POST",
				headers: {
					"X-CSRFToken": token,
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({ to_user: userId }),
			});
			const data = await response.json();
			// messageContainer.textContent = data.message;
			if (response.ok) {
				console.log("ok");
				// document.getElementById("friend-username-to-add").value = "";
			}
		} catch (error) {
			console.error("Error sending friend request:", error);
			// messageContainer.textContent = "Error sending friend request";
		}
	};

	////////////////////// DELETE FRIENDS ////////////////////////////

	const delFriend = async (username) => {
		// const username = document.getElementById("friend-username-to-del").value;
		console.log("friend username : ", username);
		// const messageContainer = document.getElementById("del-friend-message");
		if (!username) {
			return;
		}
		try {
			const userId = await getUserId(username);
			console.log("user id : ", userId);
			const response = await fetch(delFriendUrl, {
				method: "DELETE",
				headers: {
					"X-CSRFToken": token,
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({ to_user: userId }),
			});
			const data = await response.json();
			// messageContainer.textContent = data.message;
			if (response.ok) {
				// document.getElementById("friend-username-to-del").value = "";
				fetchFriends();
			}
		} catch (error) {
			console.error("Error sending friend request:", error);
			// messageContainer.textContent = "Error sending friend request";
		}
	};

	/////////// FRIENDS - OTHER /////////

	let friendRequestListUrl = "https://" + window.location.host + "/auth/list-friend-requests/";
	let acceptFriendRequestUrl = "https://" + window.location.host + "/auth/accept-friend-request/";
	let rejectFriendRequestUrl = "https://" + window.location.host + "/auth/reject-friend-request/";
	var friends;

	const fetchFriendRequests = async () => {
		try {
			const response = await fetch(friendRequestListUrl, {
				method: "GET",
				headers: {
					"X-CSRFToken": token,
					"Content-Type": "application/json",
				},
				credentials: "include",
			});
			const data = await response.json();
			console.log(data.friends);
			friends = data.friends;
			console.log("Friend requests data:", data); // Debug: log data
			if (data && Array.isArray(data.data)) {
				displayFriendRequests(data.data);
			} else {
				console.error("Expected an array but got:", data);
			}
		} catch (error) {
			console.error("Error fetching friend requests:", error);
		}
	};

	const displayFriendRequests = (requests) => {
		const friendRequestsContainer = document.getElementById("friend-requests");
		friendRequestsContainer.innerHTML = "";
		requests.forEach((request) => {
			const requestElement = document.createElement("div");
			requestElement.classList.add("friend-request");
			requestElement.innerHTML = `
			<span>${request.from_user.username}</span>
			<div class="buttons">
			  <button onclick="handleFriendRequest(${request.id}, true)">Accept</button>
			  <button onclick="handleFriendRequest(${request.id}, false)">Reject</button>
			</div>
		  `;
			friendRequestsContainer.appendChild(requestElement);
		});
	};

	window.handleFriendRequest = async (requestId, accept) => {
		const url = accept ? acceptFriendRequestUrl : rejectFriendRequestUrl;
		try {
			const response = await fetch(url, {
				method: "POST",
				headers: {
					"X-CSRFToken": token,
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({ friend_request_id: requestId }),
			});
			const data = await response.json();
			fetchFriendRequests(); // Reload the list of friend requests
			fetchFriends(); // Reload the list of friends
		} catch (error) {
			console.error("Error handling friend request:", error);
		}
	};

	// Function to fetch and display friends

	let friendListUrl = "https://" + window.location.host + "/auth/list-friends/";

	const fetchFriends = async () => {
		try {
			const response = await fetch(friendListUrl, {
				method: "GET",
				headers: {
					"X-CSRFToken": token,
					"Content-Type": "application/json",
				},
				credentials: "include",
			});
			const data = await response.json();
			console.log("Friends data:", data); // Debug: log data
			if (data && Array.isArray(data.data)) {
				displayFriends(data.data);
			} else {
				console.error("Expected an array but got:", data);
			}
		} catch (error) {
			console.error("Error fetching friends:", error);
		}
	};

	const displayFriends = (friends) => {
		const friendsContainer = document.getElementById("friends_list-container");
		friendsContainer.innerHTML = "";

		friends.forEach((friend) => {
			const li = document.createElement('li');
			//li.textContent = user.username;  
			const user_button = document.createElement('span');
			user_button.style.flexGrow = "1";
			user_button.style.cursor = "pointer";
			user_button.textContent = friend.username;
			li.appendChild(user_button);

			// const add_button = document.createElement('button');
			// add_button.classList.add("bi", "bi-person-plus");
			// add_button.addEventListener('click', (e) => {
			// 	e.preventDefault();
			// 	addFriend(friend.username);
			// });
			// li.appendChild(add_button);
			const del_button = document.createElement('button');
			del_button.classList.add("bi", "bi-person-plus"); // TODO
			del_button.addEventListener('click', (e) => {
				e.preventDefault();
				delFriend(friend.username);
			});
			li.appendChild(del_button);
			//// buttons "start chat" 
			const chat_button = document.createElement('button');
			chat_button.classList.add("bi", "bi-chat-left-text");

			chat_button.addEventListener('click', (e) => {
				e.preventDefault();
				if (!(document.getElementById("chat-box").classList.item("active")))
					document.getElementById("chat-box").classList.toggle("active");
				handleChatLinkClick(friend.username);
			});

			li.appendChild(chat_button);
			const block_button = document.createElement('button');
			block_button.classList.add("bi", "bi-slash-circle");
			block_button.addEventListener('click', (e) => {
				e.preventDefault();
				console.log(blocked_users);
				console.log(friend.username);
				if (blocked_users.includes(friend.username))
					unblockUser(friend.username);
				else
					blockUser(friend.username);
			});
			li.appendChild(block_button);
			friendsContainer.appendChild(li);
		});
	};




	////////////////////// UPDATE THE BLOCKED USERS LIST ////////////////////////////

	var blocked_users;
	let blockUserUrl = "https://" + window.location.host + "/auth/block-user/";
	let unblockUserUrl = "https://" + window.location.host + "/auth/unblock-user/";
	let ListBlockedUsersUrl = "https://" + window.location.host + "/auth/list-blocked-users/";

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

	const blockUser = async (username) => {
		// const username = document.getElementById("user-username-to-block").value;
		console.log("user username: ", username);
		// const messageContainer = document.getElementById("block-user-message");
		if (!username) {
			// messageContainer.textContent = "Please enter a username";
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
			// messageContainer.textContent = data.message;
			if (response.ok) {
				// document.getElementById("user-username-to-block").value = "";
				fetchBlockedUsers();
			}
		} catch (error) {
			console.error("Error blocking user:", error);
			// messageContainer.textContent = "Error blocking user";
		}
	};


	////////////////////// UNBLOCK A USER (not used yet) ////////////////////////////

	const unblockUser = async (username) => {
		// const username = document.getElementById("user-username-to-unblock").value;
		console.log("User username: ", username);
		// const messageContainer = document.getElementById("unblock-user-message");
		if (!username) {
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
			// messageContainer.textContent = data.message;
			if (response.ok) {
				// document.getElementById("user-username-to-unblock").value = "";
				fetchBlockedUsers();
			}
		} catch (error) {
			console.error("Error unblocking user:", error);
			// messageContainer.textContent = "Error unblocking user";
		}
	};

	////////////////////// USERS LIST + BUTTON "START CHAT" ////////////////////////////

	usersClick = async function () {
		let usersUrl = "https://" + window.location.host + "/users_list/";

		await fetch(usersUrl, {
			method: "POST",
			headers: {
				"X-CSRFToken": token,
				"Content-Type": "application/json",
			},
			credentials: "include",
		})
			.then(response => response.json())
			.then(async data => {
				await fetchBlockedUsers();
				await fetchFriendRequests();
				await fetchFriends();
				const usersList = document.getElementById('users_list-container');
				usersList.innerHTML = '';
				console.log("data: ", data);

				if (data.users.length !== 0) {
					data.users.forEach((user) => {
						const li = document.createElement('li');     		////
						//li.textContent = user.username;        		//// dinamically creating users list with
						const user_button = document.createElement('span');	////
						user_button.style.flexGrow = "1";
						user_button.style.cursor = "pointer";
						user_button.textContent = user.username;
						li.appendChild(user_button);

						const add_button = document.createElement('button');	////
						add_button.classList.add("bi", "bi-person-plus");
						add_button.addEventListener('click', (e) => {
							e.preventDefault();
							addFriend(user.username);
						});
						li.appendChild(add_button);
						//// buttons "start chat" 
						const chat_button = document.createElement('button');	////
						chat_button.classList.add("bi", "bi-chat-left-text");

						chat_button.addEventListener('click', (e) => {
							e.preventDefault();
							if (!(document.getElementById("chat-box").classList.item("active")))
								document.getElementById("chat-box").classList.toggle("active");
							handleChatLinkClick(user.username);				//// opening chat
						});

						li.appendChild(chat_button);
						const block_button = document.createElement('button');	////
						block_button.classList.add("bi", "bi-slash-circle");
						block_button.addEventListener('click', (e) => {
							e.preventDefault();
							console.log(blocked_users);
							console.log(user.username);
							if (blocked_users.includes(user.username))
								unblockUser(user.username);
							else
								blockUser(user.username);
						});
						li.appendChild(block_button);
						usersList.appendChild(li);
					});
				}
			})
			.catch(error => {
				const error_msg = document.createElement("h3");
				error_msg.classList.add("ulist-error");
				error_msg.textContent = "login to access";
				document.getElementById("users_list-box").appendChild(error_msg);
			});
		//.catch((error) => console.error("Error fetching user data:", error));
	}


	////////////////////// ACCEPT INVITATION TO PLAY PONG ////////////////////////////

	async function invite_accept() {
		let ws
		await fetch("https://" + window.location.host + "/room/invite", {
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
					//usersListBox.classList.remove('show');
					usersListBox.style.display = "none";
					ws = new WebSocket("wss://" + window.location.host + "/ws/online/" + data.room_name + "/" + username_global + "/");
					online_game(ws);			//// launching the online pong game
					close(ws);
				}
			})
	}

	const chatContainer = document.getElementById("chat-box");

	chatContainer.addEventListener("click", function (event) {			//// invitation to play pong online
		if (event.target && event.target.id === "invite-link") {		//// clicking on a dynamically added button
			invite_accept(event);
		}
	});


	////////////////////// CHAT ////////////////////////////

	var chatSocket = null;
	var chat_room_name;

	async function handleChatLinkClick(username) {
		const chatUrl = "https://" + window.location.host + "/chat/" + username + "/";

		await fetch(chatUrl, {
			method: "POST",
			headers: {
				"X-CSRFToken": token,
				"Content-Type": "application/json",
			},
			credentials: "include",
		})
			.then((response) => {
				if (!response.ok) {
					document.getElementById("chat-box").innerHTML = `<div><center><h1>USER IS BLOCKED</h1></center></div>`;
				}
				return response.json();
			})
			.then((data) => {
				//const chatContainer = document.createElement('div');
				//chatContainer.classList.add('chat__container');
				//document.getElementById("chat-container").innerHTML = "";
				if (data && data.other_user && Array.isArray(data.messages)) {		//// adding messages into the chat container dinamically
					document.getElementById("chat-box").innerHTML = `
          <div id="msg_container">
            ${data.messages.map(message => `
              <p class="msg_text"><span class="msg_username">${message.fields.username}</span>: ${message.fields.message}</p>
            `).join('')}
          </div>
          <div id="input_container">
            <input type="text" id="i-msg" placeholder="Type a message to @${data.other_user}" />
            <button type="submit" id="b-msg" class=" bi bi-arrow-right-circle"></button>
						<button type="submit" id="id_invit_button" class="bi bi-joystick"></button>
          </div>
        `;
				}
				else {
					return;
				}

				console.log("++ room_name : ", data.room_name);
				console.log("++ other_user : ", data.other_user);
				console.log("++ username : ", data.username);
				console.log("++ messages : ", data.messages);

				chat_room_name = data.room_name;

				//const listItemElement = document.getElementById('chat-container');
				//listItemElement.appendChild(chatContainer);

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

				document.querySelector("#i-msg").focus();
				document.querySelector("#i-msg").onkeyup = function (e) {
					if (e.keyCode === 13) {
						document.querySelector("#b-msg").click();
					}
				};

				document.querySelector("#b-msg").onclick = async function (e) {
					await fetchBlockedUsers();
					console.log("blocking situation ", blocked_users.length);
					if (!(blocked_users.includes(data.other_user))) {
						const messageInput = document.querySelector("#i-msg").value;
						chatSocket.send(JSON.stringify({ message: messageInput, username: data.username }));
					}
				};

				document.querySelector("#id_invit_button").onclick = async function (e) {
					await fetchBlockedUsers();
					if (blocked_users.includes(data.other_user)) {
						return;
					}
					let ws;
					await fetch("https://" + window.location.host + "/room/invite", {
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
								// usersListBox.style.display = "none";
								chatSocket.send(JSON.stringify({ message: `Game invitation: <button type=\"submit\" id=\"invite-link\">ACCEPT</button>`, username: username_global }));
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
					div.classList.add("msg_text");
					//if (data.username === currentUser) {
					//	div.classList.add("chat__message--self");
					//} else {
					//	div.classList.add("chat__message--other");
					//}

					div.innerHTML = `
            <div class="msg_content">
              <div class="msg_username">${data.username}</div>
              <div class="msg_text">: ${data.message}</div>
            </div>
          `;
					document.querySelector("#i-msg").value = "";
					document.querySelector("#msg_container").appendChild(div);
					document.querySelector("#msg_container").scrollTop = document.querySelector("#msg_container").scrollHeight;
				}
			})
			.catch(error => console.error('Error fetching chat data:', error));
		document.getElementById("chat-box").classList.add("chat-active");
		document.getElementById("b-close-chat").classList.add("chat-active");
	}


	////////////////////// A SUPPRIMER (DEMANDER A ALESS SI C'EST OK) ////////////////////////////

	async function addGame() {
		console.log("add game clicked");

		try {
			const player_1_id = await getUserId("aless");
			const player_2_id = await getUserId("rita");

			const game = {
				player_1_id: player_1_id,
				player_2_id: player_2_id,
				player_1_score: 10,
				player_2_score: 5,
				winner_id: player_1_id,
				date_played: new Date().toISOString(),
				duration: 300,
			};

			console.log("game : ", JSON.stringify(game));

			let setGameUrl = "https://" + window.location.host + "/stat/game-history/";

			const response = await fetch(setGameUrl, {
				method: "POST",
				headers: {
					"X-CSRFToken": token,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(game),
				credentials: "include",
			});

			if (!response.ok) {
				const errorData = await response.json();
				console.log(response);
				throw new Error(`Network response was not ok: ${JSON.stringify(errorData)}`);
			}

			const data = await response.json();
			console.log(data);
		} catch (error) {
			console.error("Fetch error: ", error);
		}
	}

});

export { usersClick, signupButton, loginButton, logoutButton, }
