import { getUser } from "./user_api.js";

export function updateUserInfo(user) {
  const usernameLabel = document.getElementById("user-name");
  const usernameElement = document.getElementById("info-username");
  // const profile_picture = document.getElementById("profile-picture");

  const { isConnected } = getUser();
  const { username } = getUser();

  if (username !== user.username) {
    console.error("Username does not match");
    return;
  }

  usernameLabel.textContent = username;

  console.log("user is connected: ", isConnected);
  console.log("user: ", user);
  console.log("user.username: ", user.username);

  if (!usernameElement) {
    console.error("Element #info-username not found");
    return;
  } else {
    console.log("Element #info-username found");
  }

  if (isConnected && user) {
    if (user.username) {
      document.getElementById("info-username").textContent = `${user.username}`;
    }

    if (user.stats) {
      document.getElementById(
        "stat-wins"
      ).textContent = `Wins: ${user.stats.wins}`;
      document.getElementById(
        "stat-losses"
      ).textContent = `Losses: ${user.stats.losses}`;
      document.getElementById(
        "stat-win-rate"
      ).textContent = `Win Rate: ${user.stats.win_rate}%`;
      document.getElementById(
        "stat-total-games"
      ).textContent = `Total Games Played: ${user.stats.total_games}`;
      document.getElementById(
        "stat-total-hours"
      ).textContent = `Total Hours Played: ${user.stats.total_hours}`;
      document.getElementById(
        "stat-goals-scored"
      ).textContent = `Goals Scored: ${user.stats.goals_scored}`;
      document.getElementById(
        "stat-goals-conceded"
      ).textContent = `Goals Conceded: ${user.stats.goals_conceded}`;
    }

    if (user.match_history) {
      const historyList = document.getElementById("history-list");
      historyList.innerHTML = ""; // Clear previous history
      user.match_history.forEach((match) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${match.date}: ${match.opponent} - ${match.result}`;
        historyList.appendChild(listItem);
      });
    }
  }
}

export function DisplayUserInfoBox(display) {
  const userInfoBox = document.getElementById("user-info-box");
  const mainMenu = document.getElementById("main-menu");

  console.log("DisplayUserInfoBox called with display =", display);

  if (!userInfoBox) {
    console.error("Element #user-info-box not found");
    return;
  } else {
    console.log("Element #user-info-box found");
  }

  if (display) {
    userInfoBox.style.display = "block";
    console.log("User info box should be visible now");
    mainMenu.style.display = "none";
  } else {
    userInfoBox.style.display = "none";
    mainMenu.style.display = "flex";
  }
}
