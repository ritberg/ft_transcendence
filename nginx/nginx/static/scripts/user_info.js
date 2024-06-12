export function updateUserInfoDisplay(userInfo) {
  console.log("updateUserInfo called with userInfo =", userInfo);
  if (userInfo) {
    const username = userInfo.username;
    if (username) {
      document.getElementById("info-username").textContent = `${username}`;
      document.getElementById("user-name").textContent = `${username}`;
    } else {
      document.getElementById("info-username").textContent = "guest";
      document.getElementById("user-name").textContent = "guest";
    }

    if (userInfo.stats) {
      document.getElementById(
        "stat-wins"
      ).textContent = `Wins: ${userInfo.stats.wins}`;
      document.getElementById(
        "stat-losses"
      ).textContent = `Losses: ${userInfo.stats.losses}`;
      document.getElementById(
        "stat-win-rate"
      ).textContent = `Win Rate: ${userInfo.stats.win_rate}%`;
      document.getElementById(
        "stat-total-games"
      ).textContent = `Total Games Played: ${userInfo.stats.total_games}`;
      document.getElementById(
        "stat-total-hours"
      ).textContent = `Total Hours Played: ${userInfo.stats.total_hours}`;
      document.getElementById(
        "stat-goals-scored"
      ).textContent = `Goals Scored: ${userInfo.stats.goals_scored}`;
      document.getElementById(
        "stat-goals-conceded"
      ).textContent = `Goals Conceded: ${userInfo.stats.goals_conceded}`;
    }

    if (userInfo.match_history) {
      const historyList = document.getElementById("history-list");
      historyList.innerHTML = ""; // Clear previous history
      userInfo.match_history.forEach((match) => {
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
  var usersListBox = document.getElementById("users-list-box");
  var signinBox = document.getElementById("profile-box_signin");

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
    usersListBox.classList.remove("show");
    signinBox.style.display = "none";
  } else {
    userInfoBox.style.display = "none";
    mainMenu.style.display = "flex";
  }
}
