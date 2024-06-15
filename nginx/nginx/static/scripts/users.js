import { sleep } from './utils.js';
import { GameMode } from './main.js';
import { drawBrackets, enterNicknames } from './brackets.js';
import { online_game } from '../online/pong_online.js';
import { tournamentSettings } from './animations.js';
import { route } from './router.js';

export var username_global = "guest";
export var token = localStorage.getItem("token") || null;
export var userIsConnected = localStorage.getItem("userIsConnected") || false;

export const getUserId = async (username) => {
	let getIdUrl = "https://" + window.location.host + `/auth/get-user-id/?username=${username}`;
	const response = await fetch( getIdUrl,
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

function updateUserStats(stats) {
	if (stats) {
		document.getElementById("stat-wins").textContent = `Wins: ${stats.wins}`;
		document.getElementById("stat-losses").textContent = `Losses: ${stats.losses}`;
		document.getElementById("stat-win-rate").textContent = `Win Rate: ${stats.win_rate.toFixed(2)}%`;
		document.getElementById("stat-total-games").textContent = `Total Games Played: ${stats.total_games_played}`;
		document.getElementById("stat-total-hours").textContent = `Total Hours Played: ${stats.total_hours_played.toFixed(2)}`;
		document.getElementById("stat-goals-scored").textContent = `Goals Scored: ${stats.goal_scored}`;
		document.getElementById("stat-goals-conceded").textContent = `Goals Conceded: ${stats.goal_conceded}`;
	}
}

function updateMatchHistory(matchHistory) {
	if (matchHistory) {
		const historyList = document.getElementById("history-list");
		historyList.innerHTML = ""; // Clear previous history
		matchHistory.forEach((match) => {
			const listItem = document.createElement("li");
			let data_played = new Date(match.date_played).toLocaleDateString('fr-FR');
			let opponent = (username_global === match.player_1.username) ? match.player_2.username : match.player_1.username;
			const winStatus = "WIN"
			let status = (username_global === match.winner.username) ? winStatus : "LOSS";
			let player_1_score = match.player_1.score;
			let player_2_score = match.player_2.score;
			let time = (match.duration / 60).toFixed(2);

			listItem.textContent = `${data_played}: ${opponent} - ${status} (${player_1_score} - ${player_2_score}) - ${time}min`;
			listItem.classList.add(status === winStatus ? "win" : "loss");
			historyList.appendChild(listItem);
		});
	}
}

export async function displayProfile() {
	let user = JSON.parse(localStorage.getItem("user")) || null;

	if (user === null) {
		console.log("No user found for displayUserInfo");
		return;
	}

	user.stats = await getStats();
	user.match_history = await getMatchHistory();
	localStorage.setItem("user", JSON.stringify(user));

	console.log("updateUserInfo called with userInfo =", user);
	if (user) {
		const username = user.username;
		if (username) {
			console.log("PUT USERNAME IN USERINFO DISPLAY: ", username);
			document.getElementById("info-username").textContent = `${username}`;
			document.getElementById("user-name").textContent = `${username}`;
		}
		if (user.stats) {
			console.log("PUT STAT IN USERINFO DISPLAY: ", user.stats);
			updateUserStats(user.stats);
			createChartGames(user.stats);
			createGoalsChart(user.stats);
		}
		if (user.match_history) {
			console.log("PUT MATCH HISTORY IN USERINFO DISPLAY: ", user.match_history);
			updateMatchHistory(user.match_history);
		}
	}
}

function createChartGames(stats) {
	const canvas = document.getElementById('playerGamesChart');
	const ctx = canvas.getContext('2d');

	const existingChart = Chart.getChart(canvas);
	if (existingChart) {
		existingChart.destroy();
	}

	new Chart(ctx, {
		type: 'doughnut',
		data: {
			labels: ['Wins', 'Losses'],
			datasets: [
				{
					label: 'Win Rate',
					data: [stats.wins, stats.losses],
					backgroundColor: ['#008000', '#FF0000'],
					borderColor: ['#388e3c', '#d32f2f'],
					borderWidth: 1,
				},
			],
		},
		options: {
			responsive: true,
			plugins: {
				legend: {
					position: 'top',
				},
				title: {
					display: true,
					text: 'Win Rate',
					font: {
						size: 18
					},
					color: '#FFFFFF',
				},
				tooltip: {
					callbacks: {
						label: function(tooltipItem) {
							const label = tooltipItem.label || '';
							const value = tooltipItem.raw;
							const total = tooltipItem.chart._metasets[0].total;
							const percentage = ((value / total) * 100).toFixed(2);
							return `${label}: ${value} (${percentage}%)`;
						}
					}
				}
			}
		},
	});
}

function createGoalsChart(stats) {
	const canvas = document.getElementById('playerGoalsChart');
	const ctx = canvas.getContext('2d');

	const existingChart = Chart.getChart(canvas);
	if (existingChart) {
		existingChart.destroy();
	}

	new Chart(ctx, {
		type: 'bar',
		data: {
			labels: ['Goals Scored', 'Goals Conceded', 'Total Goals'],
			datasets: [
				{
					data: [
						stats.goal_scored,
						stats.goal_conceded,
						stats.goal_scored + stats.goal_conceded,
					],
					backgroundColor: ['#008000', '#FF0000', '#FF8000'],
					borderColor: ['#388e3c', '#d32f2f', '#fbc02d'],
					borderWidth: 1,
				},
			],
		},
		options: {
			responsive: true,
			plugins: {
				legend: {
					display: false,
				},
				title: {
					display: true,
					text: 'Goals',
					color: '#FFFFFF',
					font: {
						size: 18,
					},
					position: 'top',
				},
			},
			scales: {
				y: {
					beginAtZero: true,
				},
			},
		},
	});
}

async function getStats() {
	let getStatsUrl = "https://" + window.location.host + "/stat/stats/";

	return await fetch(getStatsUrl, {
		method: "GET",
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
		console.log(data)
		return data
	})
	.catch((error) => {
		console.error("Fetch error: ", error);
	});
}

async function getMatchHistory() {
	let getMatchHistoryUrl = "https://" + window.location.host + "/stat/game-history/";

	return await fetch(getMatchHistoryUrl, {
		method: "GET",
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
		console.log(data)
		return data;
	})
	.catch((error) => {
		console.error("Fetch error: ", error);
	});
}

let usersClick;
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


	/////////// NAVIGATION //////////////
	const contentContainer = document.getElementById("content");
	contentContainer.addEventListener("click", async function (event) {
		if (event.target && event.target.id === "b-signin-ok") {
			await loginButton(event);
			route('/');
		}
		else if (event.target && event.target.id === "b-signup-ok") {
			signupButton(event);
		}
		else if (event.target && event.target.id === "pvp-mode") {
			document.getElementById("main-menu").classList.add("hidden");
			GameMode(0);
		}
		else if (event.target && event.target.id === "cpu-mode") {
			document.getElementById("main-menu").classList.add("hidden");
			GameMode(1);
		}
		else if (event.target && event.target.id === "b-tourney_settings") {
			tournamentSettings();
		}
		else if (event.target && event.target.id === "b-online-go"){
			GameMode(3);
		}
		else if (event.target && event.target.id === "refresh-stats") {
			addGame();
			displayProfile();
		}
		else if (event.target && event.target.id === "logout") {
			logoutButton();
			route("/");
		}
		else if (event.target && event.target.id === "profile") {
			displayProfile();
		}
	});

	document.getElementById("profile_tab").addEventListener("click", async function (event){
		event.preventDefault();
		let url = window.location.pathname;
		if (url === "/profile/" || url === "/signin/" || url === "/signup/")
		{	
			route('/');
		}
		else if (userIsConnected)
		{
			if (url == "/") {
				document.getElementById("main-menu").classList.remove("shown");
				document.getElementById("main-menu").classList.add("hidden");
				await sleep(500);
			}
			route('/profile/');
			// await sleep(100);
			// document.getElementById("user-info-box").style.opacity = "0";
			// document.getElementById("user-info-box").classList.remove("hidden");
			// document.getElementById("user-info-box").classList.add("shown");
		}
		else
		{
			document.getElementById("main-menu").classList.remove("shown");
			document.getElementById("main-menu").classList.add("hidden");
			await sleep(500);
			route('/signin/');
		}
	});

	////////////////////// SIGNUP ////////////////////////////

	let signupUrl = "https://" + window.location.host + "/auth/register/";

	async function signupButton(event) {
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

	let loginUrl = "https://" + window.location.host + "/auth/signin/";

	async function loginButton(event) {
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
			await addGame(); // à supprimer
			return user;
		})
		.catch((error) => {
			console.error("Fetch error:", error);
		});
	}

	////////////////////// LOGOUT ////////////////////////////

	let logoutUrl = "https://" + window.location.host + "/auth/logout/";

	async function logoutButton() {
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

	let usrsLst = document.getElementById("tabs-list");
	let usersListBox = document.getElementById("users-list-box");
	var chat_room_name;

	usrsLst.addEventListener("click", async function (event) {					//// frontend
		event.preventDefault();
		if (window.location.pathname === "/users/") {
			route("/");
		}
		else {
			if (window.location.pathname === "/") {
				document.getElementById("main-menu").classList.remove("shown");
				document.getElementById("main-menu").classList.add("hidden");
				await sleep(500);
			}
			route("/users/");
		}
	});

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
			.then(data => {
				const usersList = document.getElementById('users-list-container');
				usersList.innerHTML = '';
				console.log("data: ", data);

			if (data.users.length !== 0) {
				data.users.forEach((user) => {
					const li = document.createElement("li"); ////
					li.textContent = user.username + " "; //// dynamically creating users list with
					//// buttons "start chat"
					const button = document.createElement("button"); ////
					button.textContent = "Start Chat"; ////

					button.addEventListener("click", (e) => {
					e.preventDefault();
					if (!document.getElementById("chat-box").classList.item("active"))
						document.getElementById("chat-box").classList.toggle("active");
					handleChatLinkClick(user.username); //// opening chat
					});

					li.appendChild(button);
					usersList.appendChild(li);
				});
			}
		})
		.catch((error) => console.error("Error fetching user data:", error));
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

	var chatSocket = null;

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

export { usersClick }