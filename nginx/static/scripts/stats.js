import { getUserId } from "./users.js";
import { token, username_global } from "./users.js";
import { escapeHtml, msg } from "./utils.js";

//calculates stats and displays them in profiles
function updateUserStats(stats) {
	if (stats) {
		document.getElementById("wins-value").textContent = stats.wins;
		document.getElementById("losses-value").textContent = stats.losses;
		document.getElementById("win-rate-value").textContent = stats.win_rate.toFixed(2) + "%";
		document.getElementById("goals-avg-value").textContent = ((stats.goal_scored / (stats.wins + stats.losses))).toFixed(3);
		document.getElementById("goals-scored-value").textContent = stats.goal_scored;
		document.getElementById("goals-conceded-value").textContent = stats.goal_conceded;
		document.getElementById("total-games-value").textContent = stats.total_games_played;
		document.getElementById("total-hours-value").textContent = stats.total_hours_played.toFixed(2);
	}
}

//displays the match history
function updateMatchHistory(matchHistory, username) {
	if (username == null)
		username = username_global;
	if (matchHistory) {
		const historyList = document.getElementById("history-list");
		historyList.innerHTML = ""; // Clear previous history
		matchHistory.forEach((match) => {
			const listItem = document.createElement("li");
			let date_played = new Date(match.date_played).toLocaleDateString('fr-FR');
			let opponent = (username === match.player_1.username) ? escapeHtml(match.player_2.username) : escapeHtml(match.player_1.username);
			const winStatus = "WIN";
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

//called in route when going in /profile/
//the username argument checks which user to display
export async function displayProfile(username) {

	if (username === null) {
		console.log("No user found for displayUserInfo");
		return;
	}
	let player_id = await getUserId(username);

	//get user stats and match history
	let stats = await getStats(player_id);
	let match_history = await getMatchHistory(player_id);

	//get user profile picture, located in user's media folder
	let profile_pic = await getProfilePicture(username);
	
	if (username) {
		if (username) {
			document.getElementById("info-username").textContent = `${escapeHtml(username)}`;
		}
		if (profile_pic) {
			document.getElementById("display_picture").src = profile_pic;
		}
		//if no stats, do nothing
		if (stats && stats.length != 0) {
			console.log("stats: ", stats);
			updateUserStats(stats);
			createChartGames(stats);
			createGoalsChart(stats);
		}
		//if no games played, do nothing
		if (match_history) {
			console.log("match history: ", match_history);
			updateMatchHistory(match_history, username);
		}
	}
}

//displays win rate chart
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
	canvas.style.width = '50%';
	canvas.style.height = '100%';
}

//displays goal repartition charts
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

//fetch stats, called in displayProfile
async function getStats(player_id) {
	let getStatsUrl = "https://" + window.location.host + "/stat/stats/" + player_id + "/";

	return await fetch(getStatsUrl, {
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
				msg(error.message);
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

//fetches games history, called in displayProfile
async function getMatchHistory(player_id) {
	let getMatchHistoryUrl = "https://" + window.location.host + "/stat/game-history/" + player_id + "/";

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
				msg(error.message);
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

//fetches profile picture, used in displayProfile
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
				msg(error.message);
				return null;
			}
			return response.json();
		})
		.then((data) => {
			if (data !== null) {
				return data.pfp;
			}
		})
		.catch((error) => {
			console.error("Fetch error: ", error);
		});
}
