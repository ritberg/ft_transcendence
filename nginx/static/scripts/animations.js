import { drawBrackets, enterNicknames, createPlayers, tourney_game } from './brackets.js';
import { change_loop_exec } from '../games/pong_tourney.js';
import { GameMode } from './main.js';
import { sleep, msg } from './utils.js';
import { modifyDelta, stars } from './stars.js';
import { closeChatSocket } from './chat.js';
import { loadLanguage } from './lang.js';

document.getElementById("tabs-icon").addEventListener("hover", function() {
	document.getElementById("tabs-list").classList.toggle("active");
});

document.getElementById("b-close-chat").addEventListener("click", function() {
	document.getElementById("chat-box").classList.toggle("chat-hidden");
	document.getElementById("b-close-chat").classList.toggle("chat-hidden");
});

document.addEventListener('DOMContentLoaded', () => {
    const contentContainer = document.getElementById("content");
    ///////////// EVENT LISTENERS //////////////

    contentContainer.addEventListener("input", async function (event) {
        if (event.target && event.target.id === "s-players") {
            document.getElementById("t-players").textContent = document.getElementById("s-players").value;
        }
        if (event.target && event.target.id === "s-points") {
            document.getElementById("t-points").textContent = document.getElementById("s-points").value;
        }
        if (event.target && event.target.id === 'i-room_name') {
            const inputElement = document.getElementById('i-room_name');
            const textElement = document.getElementById('t-empty_room');
            if (inputElement.value.length === 0) {
                textElement.style.transition = 'none';
                textElement.style.opacity = '1';
                setTimeout(() => {
                    textElement.style.transition = '.5s';
                }, 1000);
            } else {
                textElement.style.transition = 'none';
                textElement.style.opacity = '0';
                setTimeout(() => {
                    textElement.style.transition = '.5s';
                }, 1000);
            }
        }
    });

    contentContainer.addEventListener("mouseup", async function (event) {
        if (event.target && event.target.id === "s-players") {
            document.getElementById("t-players").style.textShadow = `none`;
            document.getElementById("t-players").textContent = `PLAYERS`;
            var localLanguage = localStorage.getItem('preferredLanguage') || navigator.language.slice(0, 2);
            if (!localLanguage)
                localLanguage = 'en';
            loadLanguage(localLanguage);
        }
        if (event.target && event.target.id === "s-points") {
            document.getElementById("t-points").style.textShadow = `none`;
            document.getElementById("t-points").textContent = `POINTS`;
            var localLanguage = localStorage.getItem('preferredLanguage') || navigator.language.slice(0, 2);
            if (!localLanguage)
                localLanguage = 'en';
            loadLanguage(localLanguage);
        }
    });

    contentContainer.addEventListener("mousedown", async function (event) {
        if (event.target && event.target.id === "s-players") {
            document.getElementById("t-players").style.textShadow = `white 0 0 5px`;
            document.getElementById("t-players").textContent = document.getElementById("s-players").value;
        }
        if (event.target && event.target.id === "s-points") {
            document.getElementById("t-points").style.textShadow = `white 0 0 5px`;
            document.getElementById("t-points").textContent = document.getElementById("s-points").value;
        }
    });

    contentContainer.addEventListener("focus", async function (event) {
        if (event.target && event.target.id === "i-room_name") {
            if (document.getElementById('i-room_name').value.length === 0) {
                document.getElementById('t-empty_room').style.opacity = '1';
            }
        }
    }, true);

    contentContainer.addEventListener("blur", async function (event) {
        if (event.target && event.target.id === "i-room_name") {
            document.getElementById('t-empty_room').style.opacity = '0';
        }
    }, true);
});

export async function tournamentMessages(sender, message) {
    const div = document.createElement("div");
    div.classList.add("msg_text");
    div.innerHTML = `
        <div class="msg_content">
        <div class="msg_username" style="color: #F1DB52">${sender}</div>
        <div class="msg_text">: ${message}</div>
        </div>
    `;
    document.querySelector("#msg_container").appendChild(div);
    document.querySelector("#msg_container").scrollTop = document.querySelector("#msg_container").scrollHeight;
}

export async function tournamentSettings() {
	if (window.location.pathname !== "/tourney/") {
		return;
	}
	document.getElementById("tourney_settings-box").style.opacity = "1";
	document.getElementById("tourney_settings-box").classList.remove("shown");
	document.getElementById("tourney_settings-box").classList.add("hidden");
	await sleep(500);
	document.getElementById("nickname_setup-box").style.display = "flex";
	document.getElementById("nickname_setup-box").classList.add("shown");
	enterNicknames(document.getElementById("s-players").value);
	if (window.location.pathname !== "/tourney/") {
		change_loop_exec(false);
		modifyDelta(1.5);
		stars(document.getElementById("main_canvas"));
		return;
	}
	await sleep(500);
	if (window.location.pathname !== "/tourney/") {
		change_loop_exec(false);
		modifyDelta(1.5);
		stars(document.getElementById("main_canvas"));
		return;
	}
	document.getElementById("tourney_settings-box").style.display = "none";
	document.getElementById("tourney_settings-box").style.opacity = "0";
	document.getElementById("tourney_settings-box").classList.remove("hidden");
	document.getElementById("nicknames_form").addEventListener("submit", async function(event) {
		event.preventDefault();
		const seen = new Set();
		for (const element of document.querySelectorAll("[id^='player_']")) {
			const content = element.value.trim();
			if (content === '') {
				msg("Names must contain visible characters");
				return;
			}
			if (seen.has(content)) {
				msg("Duplicates are not allowed");
				return;
			}
			seen.add(content);
		}
		createPlayers();
		// closeChatSocket();
		// document.getElementById("chat-box").innerHTML = '';
		document.getElementById("chat-box").classList.add("chat-active");
		document.getElementById("b-close-chat").classList.add("chat-active");
		if (document.getElementById("msg_container") == null)
			document.getElementById("chat-box").innerHTML = `<div id="msg_container"></div>`;
		await tournamentMessages("tournament", "The tournament has started !");
		if (window.location.pathname !== "/tourney/") {
			change_loop_exec(false);
			modifyDelta(1.5);
			stars(document.getElementById("main_canvas"));
			return;
		}
		document.getElementById("nickname_setup-box").style.opacity = "1";
		document.getElementById("nickname_setup-box").classList.remove("shown");
		document.getElementById("nickname_setup-box").classList.add("hidden");
		await sleep(300);
		if (window.location.pathname !== "/tourney/") {
			change_loop_exec(false);
			modifyDelta(1.5);
			stars(document.getElementById("main_canvas"));
			return;
		}
		await drawBrackets();
		if (window.location.pathname !== "/tourney/") {
			change_loop_exec(false);
			modifyDelta(1.5);
			stars(document.getElementById("main_canvas"));
			return;
		}
		document.getElementById("nickname_setup-box").style.display = "none";
		GameMode(2);
	});
}
