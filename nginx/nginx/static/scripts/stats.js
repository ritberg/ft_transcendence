import { getUserId, userIsConnected } from "./users.js";
import { token, username_global } from "./users.js";
import { errorMsg } from "./utils.js";

function updateUserStats(stats) {
	if (stats) {
		document.getElementById("stat-wins").textContent = `Wins: ${stats.wins}`;
		document.getElementById("stat-losses").textContent = `Losses: ${stats.losses}`;
		document.getElementById("stat-win-rate").textContent = `Win Rate: ${stats.win_rate.toFixed(2)}%`;
		document.getElementById("stat-goals-avg").textContent = `Score Avg: ${(stats.goal_scored / stats.goal_conceded).toFixed(2)}%`;
		document.getElementById("stat-goals-scored").textContent = `Goals Scored: ${stats.goal_scored}`;
		document.getElementById("stat-goals-conceded").textContent = `Goals Conceded: ${stats.goal_conceded}`;
		document.getElementById("stat-total-games").textContent = `Total Games Played: ${stats.total_games_played}`;
		document.getElementById("stat-total-hours").textContent = `Total Hours Played: ${stats.total_hours_played.toFixed(2)}`;
	}
}

function updateMatchHistory(matchHistory, username) {
	if (username == null)
		username = username_global;
	if (matchHistory) {
		const historyList = document.getElementById("history-list");
		historyList.innerHTML = ""; // Clear previous history
		matchHistory.forEach((match) => {
			const listItem = document.createElement("li");
			let date_played = new Date(match.date_played).toLocaleDateString('fr-FR');
			let opponent = (username === match.player_1.username) ? match.player_2.username : match.player_1.username;
			const winStatus = "WIN"
			let status = (username === match.winner.username) ? winStatus : "LOSS";
			let player_1_score = match.player_1.score;
			let player_2_score = match.player_2.score;
			let time = (match.duration / 60).toFixed(2);

			listItem.textContent = `${date_played}: ${opponent} • ${status} [${player_1_score} - ${player_2_score}] • ${time}min`;
			listItem.classList.add(status === winStatus ? "win" : "loss");
			historyList.appendChild(listItem);
		});
	}
}

export async function displayProfile(username) {

	if (username === null) {
		console.log("No user found for displayUserInfo");
		return;
	}
	let player_id = await getUserId(username);

	let stats = await getStats(player_id);
	let match_history = await getMatchHistory(player_id);

	let profile_pic = await getProfilePicture(username);
	
	if (username) {
		if (username) {
			console.log("PUT USERNAME IN USERINFO DISPLAY: ", username);
			document.getElementById("info-username").textContent = `${username}`;
			// document.getElementById("user-name").textContent = `${username}`;
		}
		if (profile_pic) {
			document.getElementById("display_picture").src = profile_pic;
		}
		if (stats && stats.length != 0) {
			console.log("PUT STAT IN USERINFO DISPLAY: ", stats);
			updateUserStats(stats);
			createChartGames(stats);
			createGoalsChart(stats);
		}
		if (match_history) {
			console.log("PUT MATCH HISTORY IN USERINFO DISPLAY: ", match_history);
			updateMatchHistory(match_history, username);
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
			//labels: ['Wins', 'Losses'],
			datasets: [
				{
					label: 'Win Rate',
					data: [stats.wins, stats.losses],
					backgroundColor: ['transparent', 'transparent'],
					borderColor: ['#00ff00', '#ff0000'],
					borderWidth: 3,
				},
			],
		},
		options: {
			responsive: false,
			plugins: {
				legend: {
					position: 'top',
					font: {
						size: 18
					},
				},
				title: {
					display: true,
					text: 'Win Rate',
					font: {
						size: 36
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
	//Chart.defaults.font.size = 16; // Set global font size
	canvas.style.width = '50%';
	canvas.style.height = '100%';
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
			labels: ['Scored', 'Conceded', 'Total'],
			datasets: [
				{
					data: [
						stats.goal_scored,
						stats.goal_conceded,
						stats.goal_scored + stats.goal_conceded,
					],
					backgroundColor: ['transparent', 'transparent', 'transparent'],
					borderColor: ['#00ff00', '#ff0000', '#fff000'],
					borderWidth: 3,
				},
			],
		},
		options: {
			responsive: false,
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
	canvas.style.width = '100%';
	canvas.style.height = '100%';
}

async function getStats(player_id) {
	let getStatsUrl = "https://" + window.location.host + "/stat/stats/" + player_id + "/";

	return await fetch(getStatsUrl, {
		method: "GET",
		headers: {
			"X-CSRFToken": token,
			"Content-Type": "application/json",
		},
		// credentials: "include",
	})
		.then(async (response) => {
			if (!response.ok) {
				const error = await response.json();
				errorMsg(error.message);
				return null;
			}
			return response.json();
		})
		.then((data) => {
			if (data !== null) {
				console.log(data)
				return data
			}
		})
		.catch((error) => {
			console.error("Fetch error: ", error);
		});
}

async function getMatchHistory(player_id) {
	let getMatchHistoryUrl = "https://" + window.location.host + "/stat/game-history/" + player_id + "/";

	return await fetch(getMatchHistoryUrl, {
		method: "GET",
		headers: {
			"X-CSRFToken": token,
			"Content-Type": "application/json",
		},
		// credentials: "include",
	})
		.then(async (response) => {
			if (!response.ok) {
				const error = await response.json();
				errorMsg(error.message);
				return null;
			}
			return response.json();
		})
		.then((data) => {
			if (data !== null) {
				console.log(data)
				return data;
			}
		})
		.catch((error) => {
			console.error("Fetch error: ", error);
		});
}

async function getProfilePicture(username) {
	let getMatchHistoryUrl = "https://" + window.location.host + "/auth/get-user-picture/" + username + "/";

	return await fetch(getMatchHistoryUrl, {
		method: "GET",
		headers: {
			"X-CSRFToken": token,
			"Content-Type": "application/json",
		},
		credentials: "include",
	})
		.then(async (response) => {
			if (!response.ok) {
				const error = await response.json();
				errorMsg(error.message);
				return null;
			}
			return response.json();
		})
		.then((data) => {
			if (data !== null) {
				console.log(data)
				return data.pfp;
			}
		})
		.catch((error) => {
			console.error("Fetch error: ", error);
		});
}
