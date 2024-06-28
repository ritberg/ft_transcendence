import { fetchBlockedUsers, blockUser, unblockUser } from "./block.js";
import { token, getUserId } from "./users.js";
import { msg, escapeHtml } from "./utils.js";
import { handleChatLinkClick } from "./chat.js";

let displayFriends, displayFriendRequests, fetchFriends, fetchFriendRequests, addFriend, delFriend;
document.addEventListener("DOMContentLoaded", function () {
    ////////////////////// ADD FRIENDS ////////////////////////////

    let friendRequestUrl = "https://" + window.location.host + "/auth/send-friend-request/";
    let delFriendUrl = "https://" + window.location.host + "/auth/delete-friend/";

    //sends a friend request to the user
    addFriend = async function (username) {
        if (!username) {
            return;
        }
        if ( await getUserId(username) == null) {
            return;
        }

        try {
            const userId = await getUserId(username);
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
            if (response.ok) {
                msg(`Friend request sent to ${escapeHtml(username)}`);
            }
            else
            {
                msg(data.message);
            }
        } catch (error) {
            console.error("Error sending friend request:", error);
        }
    }

    ////////////////////// DELETE FRIENDS ////////////////////////////

    //deletes a friend from the friend list
    delFriend = async function (username) {
        if (!username) {
            return;
        }
        if ( await getUserId(username) == null) {
            return;
        }

        try {
            const userId = await getUserId(username);
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
            if (response.ok) {
                msg(`${escapeHtml(username)} has been removed from your friends`)
                fetchFriends();
            }
            else {
                msg(data.message);
            }
        } catch (error) {
            console.error("Error sending friend request:", error);
        }
    }

    /////////// FRIENDS - OTHER /////////

    let friendRequestListUrl = "https://" + window.location.host + "/auth/list-friend-requests/";
    let acceptFriendRequestUrl = "https://" + window.location.host + "/auth/accept-friend-request/";
    let rejectFriendRequestUrl = "https://" + window.location.host + "/auth/reject-friend-request/";
    var friends;

    //fetches all the friend requests
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
            if (data && Array.isArray(data.data)) {
                //displays the fetched friend requests
                displayFriendRequests(data.data);
            } else {
                msg(data);
            }
        } catch (error) {
            console.error("Error fetching friend requests:", error);
        }
    }

    //display friend requests
    displayFriendRequests = async function (requests) {
        const friendRequestsContainer = document.getElementById("friend-requests");
        friendRequestsContainer.innerHTML = "";
        requests.forEach((request) => {
            //display friend name
            const requestElement = document.createElement("li");
            const user_button = document.createElement('span');
            user_button.style.flexGrow = "1";
            user_button.style.cursor = "pointer";
            user_button.textContent = escapeHtml(request.from_user.username);
            requestElement.appendChild(user_button);
            //accept friend request button
            const accept_button = document.createElement('button');
            accept_button.classList.add("bi", "bi-check-circle");
            accept_button.setAttribute('onclick', `handleFriendRequest(${request.id}, true)`);
            requestElement.appendChild(accept_button);
            //rejects friend request button
            const reject_button = document.createElement('button');
            reject_button.classList.add("bi", "bi-x-circle");
            reject_button.setAttribute('onclick', `handleFriendRequest(${request.id}, false)`);
            requestElement.appendChild(reject_button);
            friendRequestsContainer.appendChild(requestElement);
        });
    }

    //accepts or rejects friend requests
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
                msg(data.message);
            }
            else {
                accept ? msg(`Friend request accepted`) : msg(`Friend request rejected`);
                fetchFriendRequests(); // Reload the list of friend requests
                fetchFriends(); // Reload the list of friends
            }
        } catch (error) {
            console.error("Error handling friend request:", error);
        }
    }

    // Function to fetch and display friends

    let friendListUrl = "https://" + window.location.host + "/auth/list-friends/";

    //fetches friend list
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
            console.log(data.data);
            if (data && Array.isArray(data.data)) {
                //displays fetched friend list
                displayFriends(data.data);
            } else {
                msg(data);
            }
        } catch (error) {
            console.error("Error fetching friends:", error);
        }
    }

    //displays friends list
    displayFriends = async function (friends) {
        const friendsContainer = document.getElementById("friends_list-container");
        friendsContainer.innerHTML = "";

        friends.forEach(async (friend) => {
            let friend_id = await getUserId(friend.username);
            if (!friend_id)
                return;

            //creates friend button
            const li = document.createElement('li');

            //friend status
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
            if (friend.status == 'in_game')
                user_status.style.color = 'yellow';
            li.appendChild(user_status);

            //friend username
            const user_button = document.createElement('span');
            user_button.style.flexGrow = "1";
            user_button.style.cursor = "pointer";
            user_button.id = `friend_profile_${friend_id}`;
            user_button.textContent = escapeHtml(friend.username);
            li.appendChild(user_button);

            //remove friend button
            const del_button = document.createElement('button');
            del_button.classList.add("bi", "bi-person-dash"); // TODO
            del_button.addEventListener('click', (e) => {
                e.preventDefault();
                delFriend(friend.username);
            });
            li.appendChild(del_button);

            //chat button
            const chat_button = document.createElement('button');
            chat_button.classList.add("bi", "bi-chat-left-text");
            chat_button.addEventListener('click', (e) => {
                e.preventDefault();
                if (!(document.getElementById("chat-box").classList.item("active")))
                    document.getElementById("chat-box").classList.toggle("active");
                handleChatLinkClick(friend.username);
            });
            li.appendChild(chat_button);

            //block button
            const block_button = document.createElement('button');
            block_button.classList.add("bi", "bi-slash-circle");
            block_button.addEventListener('click', async (e) => {
                let blocked_users = await fetchBlockedUsers();
                e.preventDefault();
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