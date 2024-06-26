import { errorMsg, sleep } from './utils.js';
import { stars, starWars, modifyDelta } from './stars.js';
import { username_global, token, userIsConnected, getUserId } from './users.js';
import { game } from './router.js';
import { online } from '../online/pong_online.js';
import { pvp } from './pong_pvp.js';
import { bot } from '../bot/pong_bot.js';
import { tourney, change_loop_exec } from './pong_tourney.js';
import { openWebSocket } from './userStatus.js';
import { updateStatus } from './userStatus.js';

export let ai_activated = false;

export async function GameMode(n) {
    if (n == 0) {
        await starWars();
        if (window.location.pathname !== '/pvp/') {
            modifyDelta(1.5);
            return;
        }
        document.getElementById("game_canvas").style.display = "block";
        await updateStatus('in_game');
        game.game_type = 'pvp';
        game.game_class = new pvp();
        game.game_class.loop();
    }
    else if (n == 1) {
        await starWars();
        if (window.location.pathname !== '/bot/') {
            modifyDelta(1.5);
            return;
        }
        document.getElementById("game_canvas").style.display = "block";
        await updateStatus('in_game');
        game.game_type = 'bot';
        game.game_class = new bot();
        game.game_class.gameLoop_bot();
    }
    else if (n == 2)
    {
        await starWars();
        if (window.location.pathname !== "/tourney/") {
            change_loop_exec(false);
            modifyDelta(1.5);
            stars(document.getElementById("main_canvas"));
            return;
        }
        document.getElementById("game_canvas").style.display = "block";
        await updateStatus('in_game');
        game.game_type = 'tourney';
        game.game_class = new tourney();
        game.game_class.loopTourney();
    }
    else if (n == 3) {
        if (userIsConnected == false) {
            errorMsg("user must be logged in to play online");
            return;
        }

        let player_id = await getUserId(username_global);
        if (player_id == null) 
            return;
        let room_selected = document.querySelector("#i-room_name").value;

        await fetch("https://" + window.location.host + "/room/", {
            method: "POST",
            headers: {
                "Content-type": "application/json",
                "X-CSRFToken": token,
            },
            body: JSON.stringify({
                room: room_selected,
                player_id: player_id,
            }),
            credentials: "include",
        })
        .then(async (response) => {
            if (!response.ok) {
                const error = await response.json();
                errorMsg(error.error);
                return null;
            }
            return response.json();
        })
        .then(async (data) => {
            if (data !== null) {
                document.getElementById("online-box").classList.remove("shown");
		        document.getElementById("online-box").classList.add("hidden");
                await starWars();
                if (window.location.pathname !== '/online/') {
                    modifyDelta(1.5);
                    return;
                }
                // document.getElementById("online-box").style.display = "none";
                document.getElementById("game_canvas").style.display = "block";
                game.ws = new WebSocket(`wss://${window.location.host}/ws/online/${data.room_name}/${username_global}/${player_id}/`);
                await updateStatus('in_game');
                game.game_type = 'online';
                game.game_class = new online();
                game.game_class.online_game();
            }
        })
    }
}

window.onload = async function () {
    stars(document.getElementById("main_canvas"));
    var savedLanguage = localStorage.getItem('preferredLanguage');
    if (!savedLanguage)
        savedLanguage = 'en';
    document.getElementById('language-select-menu').value = savedLanguage;
    // if (userIsConnected == true) {
    //     let user_id = await getUserId(username_global);
    //     await openWebSocket(user_id);
    // }
}