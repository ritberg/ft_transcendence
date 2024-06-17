import { userIsConnected } from "./users.js";
import { token, username_global } from "./users.js";

function updateUserStats(stats) {
	if (stats) {
		document.getElementById("stat-wins").textContent = `Wins: ${stats.wins}`;
		document.getElementById("stat-losses").textContent = `Losses: ${stats.losses}`;
		document.getElementById("stat-win-rate").textContent = `Win Rate: ${stats.win_rate.toFixed(2)}%`;
		document.getElementById("stat-goals-avg").textContent = `Score Avg: ${stats.goal_scored / stats.goal_conceded}%`;
		document.getElementById("stat-goals-scored").textContent = `Goals Scored: ${stats.goal_scored}`;
		document.getElementById("stat-goals-conceded").textContent = `Goals Conceded: ${stats.goal_conceded}`;
		document.getElementById("stat-total-games").textContent = `Total Games Played: ${stats.total_games_played}`;
		document.getElementById("stat-total-hours").textContent = `Total Hours Played: ${stats.total_hours_played.toFixed(2)}`;
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

			listItem.textContent = `${data_played}: ${opponent} • ${status} [${player_1_score} - ${player_2_score}] • ${time}min`;
			listItem.classList.add(status === winStatus ? "win" : "loss");
			historyList.appendChild(listItem);
		});
	}
}

export async function displayProfile() {
	let user = JSON.parse(localStorage.getItem("user")) || null;

	console.log("userIsConnected in var : ", userIsConnected);
	console.log("userIsConnected in localStorage : ", localStorage.getItem("userIsConnected"));

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
					backgroundColor: ['transparent', 'transparent'],
					borderColor: ['#00ff00', '#ff0000'],
					borderWidth: 3,
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
