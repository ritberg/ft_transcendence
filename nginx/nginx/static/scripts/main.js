import { sleep } from "./utils.js";
import { stars } from "./stars.js";
import { loop } from "./pong.js";
import { online_game } from "../online/index.js";
import { gameLoop_bot } from "../bot/pong.js";
import { username_global } from "./user_api.js";
import { userIsConnected } from "./user_api.js";
import { DisplayUserInfoBox } from "./user_info.js";

// import { loop_t } from './pong_tournoi.js';

export let delta = 1.5;
export let loop_exec = 0;
export let ai_activated = false;

export async function GameMode(n) {
  for (let i = 0; i < 40; i++) {
    delta /= 1.05;
    await sleep(20);
  }
  for (let i = 0; i < 20; i++) {
    delta /= 1.05;
    const brightness = i * 4; //18
    document.getElementById("game").style.background =
      "rgba(" + brightness + ", " + brightness + ", " + brightness + ", 1)";
    await sleep(20);
  }
  document.getElementById("game").style.background = "black";
  document.getElementById("main-menu").style.display = "none";

  if (n == 0) {
    loop_exec = true;
    requestAnimationFrame(loop);
  } else if (n == 1) {
    let ws = new WebSocket("wss://" + window.location.host + "/ws/bot/");
    await gameLoop_bot(ws);
    // ws.close();
  } else if (n == 3) {
    document.getElementById("online-box").style.display = "none";
    const csrftoken = document.querySelector(
      "[name=csrfmiddlewaretoken]"
    ).value;
    let room_selected = document.querySelector("#i-room_name").value;
    let ws;
    fetch("https://" + window.location.host + "/room/", {
      method: "POST",
      body: JSON.stringify({
        room: room_selected,
        username: username_global,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        "X-CSRFToken": csrftoken,
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        let code = data.status;
        if (code == 500) console.log("error: " + data.error);
        else {
          ws = new WebSocket(
            "wss://" +
              window.location.host +
              "/ws/online/" +
              data.room_name +
              "/"
          );
          online_game(ws);
          // ws.close();
        }
      });
  }
}

stars(document.getElementById("game"));

document.getElementById("profile_tab").addEventListener("click", function () {
  var mainMenu = document.getElementById("main-menu");
  var signinBox = document.getElementById("profile-box_signin");
  var usersList = document.getElementById("users-list-box");
  const userInfoBox = document.getElementById("user-info-box");

  console.log("user is connected in main: ", userIsConnected);

  if (userIsConnected) {
    // Utilisation de la variable pour vérifier l'état de connexion
    if (window.getComputedStyle(userInfoBox).display === "none") {
      DisplayUserInfoBox(true);
    } else {
      DisplayUserInfoBox(false);
    }
    signinBox.style.display = "none";
  } else {
    if (window.getComputedStyle(signinBox).display === "none") {
      signinBox.style.display = "block";
      mainMenu.style.display = "none";
    } else {
      signinBox.style.display = "none";
      mainMenu.style.display = "flex";
    }
  }
  usersList.style.display = "none";
});
