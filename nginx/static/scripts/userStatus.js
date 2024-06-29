import { userIsConnected } from "./users.js";
import { game } from "./router.js";

let socket = null;

let openWebSocket, closeWebSocket, updateStatus;

openWebSocket = async function (userId) {
	if (!userId) {
		console.error("User ID is required to open WebSocket connection");
		return;
	}

	socket = new WebSocket(`wss://${window.location.host}/ws/status/?user_id=${userId}`);

	socket.onopen = async function(e) {
		console.log("Status WebSocket connection established.");
		await updateStatus('online');
	};

	socket.onclose = function(e) {
		console.log("Status WebSocket connection closed.");
		socket = null;
	};

	//updates the status of the other users
	socket.onmessage = async function(e) {
		const data = JSON.parse(e.data);
		// console.log("Message received: ", data);

		const userId = data.user_id;
		const status = data.status;

		const statusElement = document.getElementById(`friend_status_${userId}`);
		if (statusElement) {
			if (status == 'offline') {
				statusElement.style.color = 'red';
			}
			else if (status == 'online') {
				statusElement.style.color = 'green';
			}
			else if (status == 'in_game') {
				statusElement.style.color = 'yellow';
			}
		}
	};

	socket.onerror = function(error) {
		console.log("Status WebSocket error: ", error);
	};
}

closeWebSocket = async function () {
	if (socket) {
		await updateStatus('offline');
		socket.close();
		socket = null;
	}
}

//the function that communicates with the user consumer
updateStatus = async function (newStatus) {
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

document.addEventListener('DOMContentLoaded', () => {
	// Detect when the page gains focus
	window.addEventListener('focus', async () => {
		if (userIsConnected) {
			let url = game.game_type;
			if (url == 'pvp' || url == 'bot' || url == 'tourney' || url == 'online')
				await updateStatus('in_game');
			else
				await updateStatus('online');
		}
	});

	//detect when user unfocuses from the game
	//if the user is in a game, resets keyspressed to avoid bugs
	window.addEventListener('blur', async () => {
		if (userIsConnected)
			await updateStatus('offline');
		if (game.game_type !== null) {
			game.game_class.keysPressed.clear();
		}
	});

	// Detect when the user leaves the page
	window.addEventListener('beforeunload', async () => {
		if (userIsConnected) {
			await updateStatus('offline');
			await closeWebSocket();
		}
	});
});

export { openWebSocket, closeWebSocket, updateStatus }
