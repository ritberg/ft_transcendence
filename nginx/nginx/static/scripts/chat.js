import { fetchBlockedUsers } from './block.js';
import { getUserId, token, userIsConnected, username_global } from './users.js';
import { errorMsg, escapeHtml, sleep } from './utils.js';
import { route, game } from './router.js';
import { online } from '../online/pong_online.js';

let handleChatLinkClick, fetchInvite, invite_accept; 
document.addEventListener("DOMContentLoaded", function () {
    ////////////////////// CHAT ////////////////////////////

    var chatSocket = null;
    var chat_room_name;

    fetchInvite = async function (room_name, sender) {
        await fetch("https://" + window.location.host + "/room/invite", {
            method: "POST",
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "X-CSRFToken": token,
            },
            body: JSON.stringify({
                chat_name: room_name,
                username: username_global,
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
                    route("/online/");
                    await sleep(100);
                    document.getElementById("online-box").style.display = "none";
                    document.getElementById("game_canvas").style.display = "block";
                    if (sender == true)
                        chatSocket.send(JSON.stringify({ message: `Game invitation: <button type=\"submit\" id=\"invite-link\">ACCEPT</button>`, username: username_global }));
                    game.ws = new WebSocket("wss://" + window.location.host + "/ws/online/" + data.room_name + "/" + username_global + "/");
                    game.game_type = 'online';
                    game.game_class = new online();
                    game.game_class.online_game();
                }
            })
    }

    ////////////////////// ACCEPT INVITATION TO PLAY PONG ////////////////////////////

	invite_accept = async function () {
		fetchInvite(chat_room_name, false);
	}

	const chatContainer = document.getElementById("chat-box");

	chatContainer.addEventListener("click", function (event) {			//// invitation to play pong online
		if (event.target && event.target.id === "invite-link") {		//// clicking on a dynamically added button
			invite_accept(event);
		}
	});

    async function chat_profile(username) {
        console.log(username);
        if (username)
            route("/profile/" + username + "/");
    }

    document.getElementById('chat-box').addEventListener('click', function(event) {
        console.log(event.target);
        if (event.target && event.target.classList.contains('msg_username')) {
            let username = event.target.textContent;
            chat_profile(username);
        }
    });

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
                    // let error = await response.json();
                    errorMsg("chat: user is blocked");
                    return null;
                }
                return response.json();
            })
            .then((data) => {
                if (data === null)
                    return;
                //const chatContainer = document.createElement('div');
                //chatContainer.classList.add('chat__container');
                //document.getElementById("chat-container").innerHTML = "";
                if (data && data.other_user && Array.isArray(data.messages)) {		//// adding messages into the chat container dinamically
                    document.getElementById("chat-box").innerHTML = `
        <div id="msg_container">
            ${data.messages.map(message => `
            <p class="msg_text"><span class="msg_username">${message.fields.username}</span>: ${message.fields.message}</p>
            `).join('')}
        </div>
        <div id="input_container">
            <input type="text" id="i-msg" placeholder="Type a message to @${data.other_user}" />
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

                chat_room_name = data.room_name;

                //const listItemElement = document.getElementById('chat-container');
                //listItemElement.appendChild(chatContainer);

                const roomName = data.room_name;
                if (chatSocket !== null) {
                    chatSocket.close();
                }
                chatSocket = new WebSocket("wss://" + window.location.host + "/chat/" + roomName + "/");
                console.log("websocket, ", chatSocket);
                chatSocket.onopen = function (e) {
                    console.log("The connection was set up successfully!");
                };

                chatSocket.onclose = function (e) {
                    console.log("The connection was closed successfully!");
                };

                document.querySelector("#i-msg").focus();
                document.querySelector("#i-msg").onkeyup = function (e) {
                    if (e.keyCode === 13) {
                        document.querySelector("#b-msg").click();
                    }
                };

                document.querySelector("#b-msg").onclick = async function (e) {
                    var messageInput = document.querySelector("#i-msg").value;
                    messageInput = escapeHtml(messageInput);
                    if (messageInput.replace(/\s/g,'') == "")
                        return;
                    if (userIsConnected !== true) {
                        errorMsg("you must be connected to access chat functions");
                        return;
                    }
                    let blocked_users = await fetchBlockedUsers();
                    console.log("blocking situation ", blocked_users.length);
                    console.log(data.other_user);
                    if (!(blocked_users.includes(data.other_user))) {
                        chatSocket.send(JSON.stringify({ message: messageInput, username: data.username }));
                    }
                    else
                        errorMsg("This user is blocked");
                };

                document.querySelector("#id_invit_button").onclick = async function (e) {
                    if (userIsConnected !== true) {
                        errorMsg("you must be connected to access chat functions");
                        return;
                    }
                    let blocked_users = await fetchBlockedUsers();
                    if (blocked_users.includes(data.other_user)) {
                        errorMsg("this user is blocked");
                        return;
                    }
                    fetchInvite(data.room_name, true);
                };

                chatSocket.onmessage = async function (e) {
                    let blocked_users = await fetchBlockedUsers();
                    const data = JSON.parse(e.data);
                    let ok = 0;
                    console.log("blocking situation ", blocked_users.length);
                    for (let i = 0; i < blocked_users.length; i++) {
                        if (blocked_users[i] == data.username)
                            ok = 1;
                    }
                    if (ok == 1)
                        return;

                    const div = document.createElement("div");
                    div.classList.add("msg_text");
                    //if (data.username === currentUser) {
                    //	div.classList.add("chat__message--self");
                    //} else {
                    //	div.classList.add("chat__message--other");
                    //}

                    div.innerHTML = `
            <div class="msg_content">
            <div class="msg_username">${data.username}</div>
            <div class="msg_text">: ${data.message}</div>
            </div>
        `;
                    document.querySelector("#i-msg").value = "";
                    document.querySelector("#msg_container").appendChild(div);
                    document.querySelector("#msg_container").scrollTop = document.querySelector("#msg_container").scrollHeight;
                }
            })
            .catch(error => console.error('Error fetching chat data:', error));
        document.getElementById("chat-box").classList.add("chat-active");
        document.getElementById("b-close-chat").classList.add("chat-active");
    }
});

export { handleChatLinkClick, fetchInvite, invite_accept }