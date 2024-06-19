import { drawBrackets, enterNicknames, createPlayers } from './brackets.js';
import { GameMode } from './main.js';
import { sleep } from './utils.js';
import { modifyDelta, stars } from './stars.js';

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
        }
        if (event.target && event.target.id === "s-points") {
            document.getElementById("t-points").style.textShadow = `none`;
            document.getElementById("t-points").textContent = `POINTS`;
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
		createPlayers();
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
