import { fetchBlockedUsers, blockUser, unblockUser } from "./block.js";
import { token, getUserId } from "./users.js";
import { errorMsg } from "./utils.js";
import { handleChatLinkClick } from "./chat.js";

let displayFriends, displayFriendRequests, fetchFriends, fetchFriendRequests, addFriend, delFriend;
document.addEventListener("DOMContentLoaded", function () {
    ////////////////////// ADD FRIENDS ////////////////////////////

    let friendRequestUrl = "https://" + window.location.host + "/auth/send-friend-request/";
    let delFriendUrl = "https://" + window.location.host + "/auth/delete-friend/";

    addFriend = async function (username) {

        if (!username) {
            return;
        }

        if ( await getUserId(username) == null) {
            return;
        }

        try {
            const userId = await getUserId(username);
            console.log("user id : ", userId);
            const response = await fetch(friendRequestUrl, {
                method: "POST",
                headers: {
                    "X-CSRFToken": token,
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ to_user: userId }),
            });
            const data = await response.json();
            console.log(data);
            // messageContainer.textContent = data.message;
            if (response.ok) {
                console.log("ok");
                // document.getElementById("friend-username-to-add").value = "";
            }
            else
            {
                errorMsg(data.message);
            }
        } catch (error) {
            console.error("Error sending friend request:", error);
            // messageContainer.textContent = "Error sending friend request";
        }
    }

    ////////////////////// DELETE FRIENDS ////////////////////////////

    delFriend = async function (username) {
        // const username = document.getElementById("friend-username-to-del").value;
        console.log("friend username : ", username);
        // const messageContainer = document.getElementById("del-friend-message");
        if (!username) {
            return;
        }

        if ( await getUserId(username) == null) {
            return;
        }

        try {
            const userId = await getUserId(username);
            console.log("user id : ", userId);
            const response = await fetch(delFriendUrl, {
                method: "DELETE",
                headers: {
                    "X-CSRFToken": token,
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ to_user: userId }),
            });
            const data = await response.json();
            // messageContainer.textContent = data.message;
            if (response.ok) {
                // document.getElementById("friend-username-to-del").value = "";
                fetchFriends();
            }
            else {
                errorMsg(data.message);
            }
        } catch (error) {
            console.error("Error sending friend request:", error);
            // messageContainer.textContent = "Error sending friend request";
        }
    }

    /////////// FRIENDS - OTHER /////////

    let friendRequestListUrl = "https://" + window.location.host + "/auth/list-friend-requests/";
    let acceptFriendRequestUrl = "https://" + window.location.host + "/auth/accept-friend-request/";
    let rejectFriendRequestUrl = "https://" + window.location.host + "/auth/reject-friend-request/";
    var friends;

    fetchFriendRequests = async function () {
        try {
            const response = await fetch(friendRequestListUrl, {
                method: "GET",
                headers: {
                    "X-CSRFToken": token,
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });
            const data = await response.json();
            console.log(data.friends);
            friends = data.friends;
            console.log("Friend requests data:", data); // Debug: log data
            if (data && Array.isArray(data.data)) {
                displayFriendRequests(data.data);
            } else {
                errorMsg(data);
            }
        } catch (error) {
            console.error("Error fetching friend requests:", error);
        }
    }

    displayFriendRequests = async function (requests) {
        const friendRequestsContainer = document.getElementById("friend-requests");
        friendRequestsContainer.innerHTML = "";
        requests.forEach((request) => {
            const requestElement = document.createElement("li");
            //requestElement.classList.add("friend-request");
            const user_button = document.createElement('span');
            user_button.style.flexGrow = "1";
            user_button.style.cursor = "pointer";
            user_button.textContent = request.from_user.username;
            requestElement.appendChild(user_button);
            const accept_button = document.createElement('button');
            accept_button.classList.add("bi", "bi-check-circle");
            accept_button.setAttribute('onclick', `handleFriendRequest(${request.id}, true)`);
            requestElement.appendChild(accept_button);
            const reject_button = document.createElement('button');
            reject_button.classList.add("bi", "bi-x-circle");
            reject_button.setAttribute('onclick', `handleFriendRequest(${request.id}, false)`);
            requestElement.appendChild(reject_button);
            friendRequestsContainer.appendChild(requestElement);
        });
    }

    window.handleFriendRequest = async (requestId, accept) => {
        const url = accept ? acceptFriendRequestUrl : rejectFriendRequestUrl;
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "X-CSRFToken": token,
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ friend_request_id: requestId }),
            });
            const data = await response.json();
            if (!(response.ok)) {
                errorMsg(data.message);
            }
            else {
                fetchFriendRequests(); // Reload the list of friend requests
                fetchFriends(); // Reload the list of friends
            }
        } catch (error) {
            console.error("Error handling friend request:", error);
        }
    }

    // Function to fetch and display friends

    let friendListUrl = "https://" + window.location.host + "/auth/list-friends/";

    fetchFriends = async function () {
        try {
            const response = await fetch(friendListUrl, {
                method: "GET",
                headers: {
                    "X-CSRFToken": token,
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });
            const data = await response.json();
            console.log("Friends data:", data); // Debug: log data
            if (data && Array.isArray(data.data)) {
                displayFriends(data.data);
            } else {
                errorMsg(data);
            }
        } catch (error) {
            console.error("Error fetching friends:", error);
        }
    }

    displayFriends = async function (friends) {
        const friendsContainer = document.getElementById("friends_list-container");
        friendsContainer.innerHTML = "";

        friends.forEach(async (friend) => {
            let friend_id = await getUserId(friend.username);
            if (!friend_id)
                return;
            const li = document.createElement('li');
            //li.textContent = user.username;  
            const user_status = document.createElement('h6');
						user_status.style.fontFamily = "Arial";
						user_status.style.fontSize = "20px";
						user_status.style.color = "white";
						user_status.style.margin = "0";
            user_status.textContent = "•\u00A0";
            user_status.id = `friend_status_${friend_id}`;
            if (friend.status == 'online')
                user_status.style.color = 'green';
            if (friend.status == 'offline')
                user_status.style.color = 'red';
            if (friend.status == 'ingame')
                user_status.style.color = 'yellow';
            li.appendChild(user_status);
            const user_button = document.createElement('span');
            user_button.style.flexGrow = "1";
            user_button.style.cursor = "pointer";
            user_button.id = `friend_profile_${friend_id}`;
            user_button.textContent = friend.username;
            li.appendChild(user_button);

            // const add_button = document.createElement('button');
            // add_button.classList.add("bi", "bi-person-plus");
            // add_button.addEventListener('click', (e) => {
            // 	e.preventDefault();
            // 	addFriend(friend.username);
            // });
            // li.appendChild(add_button);
            const del_button = document.createElement('button');
            del_button.classList.add("bi", "bi-person-dash"); // TODO
            del_button.addEventListener('click', (e) => {
                e.preventDefault();
                delFriend(friend.username);
            });
            li.appendChild(del_button);
            //// buttons "start chat" 
            const chat_button = document.createElement('button');
            chat_button.classList.add("bi", "bi-chat-left-text");

            chat_button.addEventListener('click', (e) => {
                e.preventDefault();
                if (!(document.getElementById("chat-box").classList.item("active")))
                    document.getElementById("chat-box").classList.toggle("active");
                handleChatLinkClick(friend.username);
            });

            li.appendChild(chat_button);
            const block_button = document.createElement('button');
            block_button.classList.add("bi", "bi-slash-circle");
            block_button.addEventListener('click', async (e) => {
                let blocked_users = await fetchBlockedUsers();
                e.preventDefault();
                console.log(blocked_users);
                console.log(friend.username);
                if (blocked_users.includes(friend.username))
                    unblockUser(friend.username);
                else
                    blockUser(friend.username);
            });
            li.appendChild(block_button);
            friendsContainer.appendChild(li);
        });
    }
});
export {fetchFriends, fetchFriendRequests, addFriend}

//window.handleFriendRequest
