import { fetchBlockedUsers } from './block.js';
import { getUserId, token, userIsConnected, username_global } from './users.js';
import { msg, escapeHtml, sleep } from './utils.js';
import { route, game } from './router.js';
import { online } from '../games/pong_online.js';

let handleChatLinkClick, fetchInvite, invite_accept; 
document.addEventListener("DOMContentLoaded", function () {
    ////////////////////// CHAT ////////////////////////////

    var chatSocket = null;
    var chat_room_name;

    //handles invites in chat
    fetchInvite = async function (room_name, sender) {
        if (userIsConnected == false) {
			msg("User must be logged in to play online");
			return;
		}

		let player_id = await getUserId(username_global);
		if (player_id == null) 
			return;

        await fetch("https://" + window.location.host + "/room/invite", {
            method: "POST",
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "X-CSRFToken": token,
            },
            body: JSON.stringify({
                chat_name: room_name,
                player_id: player_id,
            }),
            credentials: "include",
        })
            .then(async (response) => {
                if (!response.ok) {
                    const error = await response.json();
                    msg(error.error);
                    return null;
                }
                return response.json();
            })
            .then(async (data) => {
                if (data !== null) {
                    route("/online/");
                    await sleep(100);
                    document.getElementById("online-box").style.display = "none";
                    document.getElementById("game_canvas").style.display = "block";
                    //sends invite to other player
                    if (sender == true)
                        chatSocket.send(JSON.stringify({ message: `Game invitation: <button type=\"submit\" id=\"invite-link\">ACCEPT</button>`, username: username_global }));
                    game.ws = new WebSocket(`wss://${window.location.host}/ws/online/${data.room_name}/${username_global}/${player_id}/`);
                    game.game_type = 'online';
                    game.game_class = new online();
                    game.game_class.online_game();
                }
            })
    }

    ////////////////////// ACCEPT INVITATION TO PLAY PONG ////////////////////////////

    //accept invite
	invite_accept = async function () {
		fetchInvite(chat_room_name, false);
	}

	const chatContainer = document.getElementById("chat-box");

	chatContainer.addEventListener("click", function (event) {			//// invitation to play pong online
		if (event.target && event.target.id === "invite-link") {		//// clicking on a dynamically added button
			invite_accept(event);
		}
	});

    //access profile from chat
    function chat_profile(username) {
        if (username)
            route("/profile/" + username + "/");
    }

    document.getElementById('chat-box').addEventListener('click', function(event) {
        if (event.target && event.target.classList.contains('msg_username')) {
            let username = event.target.textContent;
            chat_profile(username);
        }
    });

    //handle chat click
    //opens the chat, displays the messages and adds event listeners
    handleChatLinkClick = async function (username) {
        if ( await getUserId(username) == null) {
            return;
        }
        const chatUrl = "https://" + window.location.host + "/chat/" + username + "/";

        await fetch(chatUrl, {
            method: "POST",
            headers: {
                "X-CSRFToken": token,
                "Content-Type": "application/json",
            },
            credentials: "include",
        })
            .then(async (response) => {
                if (!response.ok) {
                    let error = await response.json();
                    msg(error.error);
                    return null;
                }
                return response.json();
            })
            .then((data) => {
                if (data === null)
                    return;
                if (data && data.other_user && Array.isArray(data.messages)) {		//// adding messages into the chat container dinamically
                    document.getElementById("chat-box").innerHTML = `
        <div id="msg_container">
            ${data.messages.map(message => `
            <p class="msg_text"><span class="msg_username">${escapeHtml(message.fields.username)}</span>: ${message.fields.message}</p>
            `).join('')}
        </div>
        <div id="input_container">
            <input type="text" id="i-msg" placeholder="Type a message to @${escapeHtml(data.other_user)}" />
            <button type="submit" id="b-msg" class=" bi bi-arrow-right-circle"></button>
                        <button type="submit" id="id_invit_button" class="bi bi-joystick"></button>
        </div>
        `;
                }
                else {
                    return;
                }

                console.log("++ room_name : ", data.room_name);
                console.log("++ other_user : ", data.other_user);
                console.log("++ username : ", data.username);
                console.log("++ messages : ", data.messages);

                //room_name is the two ids of the chatters. ex: 4_9
                chat_room_name = data.room_name;

                const roomName = data.room_name;
                //closes previous chat socket if still open
                if (chatSocket !== null) {
                    chatSocket.close();
                }
                chatSocket = new WebSocket("wss://" + window.location.host + "/chat/" + roomName + "/");
                chatSocket.onopen = function (e) {
                    console.log("The connection was set up successfully!");
                };

                chatSocket.onclose = function (e) {
                    console.log("The connection was closed successfully!");
                };

                //focuses on the input to write straight away
                document.querySelector("#i-msg").focus();
                //enter listener
                document.querySelector("#i-msg").onkeyup = function (e) {
                    if (e.keyCode === 13) {
                        document.querySelector("#b-msg").click();
                    }
                };

                //sends message
                document.querySelector("#b-msg").onclick = async function (e) {
                    var messageInput = document.querySelector("#i-msg").value;
                    messageInput = escapeHtml(messageInput);
                    //if empty message, do nothing
                    if (messageInput.replace(/\s/g,'') == "")
                        return;
                    if (userIsConnected !== true) {
                        msg("You must be connected to access chat functions");
                        return;
                    }
                    //checks if the other chatter is blocked, if not, send message
                    let blocked_users = await fetchBlockedUsers();
                    if (!(blocked_users.includes(data.other_user))) {
                        chatSocket.send(JSON.stringify({ message: messageInput, username: data.username }));
                    }
                    else
                        msg("This user is blocked");
                };

                //send invite to other player
                document.querySelector("#id_invit_button").onclick = async function (e) {
                    if (userIsConnected !== true) {
                        msg("You must be connected to access chat functions");
                        return;
                    }
                    let blocked_users = await fetchBlockedUsers();
                    if (blocked_users.includes(data.other_user)) {
                        msg("This user is blocked");
                        return;
                    }
                    fetchInvite(data.room_name, true);
                };

                chatSocket.onmessage = async function (e) {
                    //don't receive messages from blocked users
                    let blocked_users = await fetchBlockedUsers();
                    const data = JSON.parse(e.data);
                    let ok = 0;
                    for (let i = 0; i < blocked_users.length; i++) {
                        if (blocked_users[i] == data.username)
                            ok = 1;
                    }
                    if (ok == 1)
                        return;

                    const div = document.createElement("div");
                    div.classList.add("msg_text");

                    //adds message to chat
                    div.innerHTML = `
            <div class="msg_content">
            <div class="msg_username">${escapeHtml(data.username)}</div>
            <div class="msg_text">: ${data.message}</div>
            </div>
        `;
                    document.querySelector("#i-msg").value = "";
                    document.querySelector("#msg_container").appendChild(div);
                    document.querySelector("#msg_container").scrollTop = document.querySelector("#msg_container").scrollHeight;
                }
                document.getElementById("chat-box").classList.add("chat-active");
                document.getElementById("b-close-chat").classList.add("chat-active");
            })
            .catch(error => console.error('Error fetching chat data:', error));
    }
});

export { handleChatLinkClick, fetchInvite, invite_accept }