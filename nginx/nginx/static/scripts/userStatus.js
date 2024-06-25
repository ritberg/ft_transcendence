import { getUserId, userIsConnected, username_global } from "./users.js";
import { game } from "./router.js";

let socket = null;

let openWebSocket, closeWebSocket, updateStatus;
document.addEventListener('DOMContentLoaded', () => {
	openWebSocket = function (userId) {
		console.log("id =", userId);
		if (!userId) {
			console.error("User ID is required to open WebSocket connection");
			return;
		}
		
		socket = new WebSocket(`wss://${window.location.host}/ws/status/?user_id=${userId}`);

		socket.onopen = function(e) {
			console.log("WebSocket connection established.");
			updateStatus('online');
		};

		socket.onclose = function(e) {
			console.log("WebSocket connection closed.");
		};

		socket.onmessage = async function(e) {
			const data = JSON.parse(e.data);
			console.log("Message received: ", data);

			const userId = data.user_id;
			const status = data.status;

			console.log("in message:", username_global);
			let own_id = await getUserId(username_global);
			if (userId == own_id) {
				let username = document.getElementById("user-name");
				if (data.status == 'offline') {
					username.style.color = 'pink';
				}
				else if (data.status == 'online') {
					username.style.color = 'green';
				}
				else if (data.status == 'ingame') {
					username.style.color = 'yellow';
				}
			}
			else {
				const statusElement = document.getElementById(`friend_profile_${userId}`);
				if (statusElement) {
					if (data.status == 'offline') {
						statusElement.style.color = 'pink';
					}
					else if (data.status == 'online') {
						statusElement.style.color = 'green';
					}
					else if (data.status == 'ingame') {
						statusElement.style.color = 'yellow';
					}
				}
			}
		};

		socket.onerror = function(error) {
			console.log("WebSocket error: ", error);
		};
	}

	closeWebSocket = function () {
		if (socket) {
			updateStatus('offline');
			socket.close();
			socket = null;
		}
	}

	updateStatus = function (newStatus) {
		// if (!socket) {
		// 	console.log("WebSocket is not open. Opening new connection...");
		// 	const userId = localStorage.getItem('user').id;
		// 	openWebSocket(userId)
		// }
		if (userIsConnected) {
			if (socket && socket.readyState === WebSocket.OPEN) {
				socket.send(JSON.stringify({
					'status': newStatus
				}));
			} else {
				console.log("WebSocket is not open.");
			}
		}
	}

	// Detect when the page gains or loses focus
	window.addEventListener('focus', () => {
		if (userIsConnected) {
			let url = game.game_type;
			console.log(url);
			if (url == 'pvp' || url == 'bot' || url == 'tourney' || url == 'online')
				updateStatus('ingame');
			else
				updateStatus('online');
		}
	});

	window.addEventListener('blur', () => {
		if (userIsConnected)
			updateStatus('offline');
	});

	// Detect when the user leaves the page
	window.addEventListener('beforeunload', () => {
		if (userIsConnected) {
			updateStatus('offline');
			closeWebSocket();
		}
	});
});

export { openWebSocket, closeWebSocket, updateStatus }