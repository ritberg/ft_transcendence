let socket = null;

export function openWebSocket(userId) {
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

	socket.onmessage = function(e) {
		const data = JSON.parse(e.data);
		console.log("Message received: ", data);

		const userId = data.user_id;
		const status = data.status;

		// const statusElement = document.getElementById(`status-${userId}`);
		// if (statusElement) {
		// 	statusElement.innerText = status;
		// }
	};

	socket.onerror = function(error) {
		console.log("WebSocket error: ", error);
	};
}

export function closeWebSocket() {
	if (socket) {
		updateStatus('offline');
		socket.close();
		socket = null;
	}
}

export function updateStatus(newStatus) {
	// if (!socket) {
	// 	console.log("WebSocket is not open. Opening new connection...");
	// 	const userId = localStorage.getItem('user').id;
	// 	openWebSocket(userId)
	// }

	if (socket && socket.readyState === WebSocket.OPEN) {
		socket.send(JSON.stringify({
			'status': newStatus
		}));
	} else {
		console.log("WebSocket is not open.");
	}
}

// Detect when the page gains or loses focus
window.addEventListener('focus', () => {
	updateStatus('online');
});

window.addEventListener('blur', () => {
	updateStatus('offline');
});

// Detect when the user leaves the page
window.addEventListener('beforeunload', () => {
	updateStatus('offline');
	closeWebSocket();
});