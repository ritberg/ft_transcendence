import { token, getUserId } from "./users.js";
import { errorMsg } from "./utils.js";

let fetchBlockedUsers, blockUser, unblockUser;
document.addEventListener("DOMContentLoaded", function () {
    ////////////////////// UPDATE THE BLOCKED USERS LIST ////////////////////////////

    let blockUserUrl = "https://" + window.location.host + "/auth/block-user/";
    let unblockUserUrl = "https://" + window.location.host + "/auth/unblock-user/";
    let ListBlockedUsersUrl = "https://" + window.location.host + "/auth/list-blocked-users/";

    fetchBlockedUsers = async function () {
        return await fetch(ListBlockedUsersUrl, {
            method: 'GET',
            headers: {
                "X-CSRFToken": token,
                "Content-Type": "application/json",
            }
        })
        .then(async (response) => {
        if (!response.ok) {
                const error = await response.json();
                errorMsg(error.message);
                return null;
            }
            return response.json();
        })
        .then(async (data) => {
            if (data !== null) {
                console.log('Blocked users:', data);
                let blocked_users = data.blocked_users;
                return blocked_users;
            }
        })
    }


    ////////////////////// BLOCK A USER (not used yet) ////////////////////////////

    blockUser = async function (username) {
        // const username = document.getElementById("user-username-to-block").value;
        console.log("user username: ", username);
        // const messageContainer = document.getElementById("block-user-message");
        if (!username) {
            // messageContainer.textContent = "Please enter a username";
            return;
        }

        const userId = await getUserId(username);
        await fetch(blockUserUrl, {
            method: "POST",
            headers: {
                "X-CSRFToken": token,
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ to_user: userId }),
        })
        .then( async (response) => {
            if (!response.ok) {
                const data = await response.json();    
                errorMsg(data.message);
            }
        })
    }


    ////////////////////// UNBLOCK A USER (not used yet) ////////////////////////////

    unblockUser = async function (username) {
        // const username = document.getElementById("user-username-to-unblock").value;
        // const messageContainer = document.getElementById("unblock-user-message");
        if (!username) {
            return;
        }

        const userId = await getUserId(username);
        await fetch(unblockUserUrl, {
            method: "POST",
            headers: {
                "X-CSRFToken": token,
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ user_to_unblock_id: userId }),
        })
        .then( async (response) => {
            if (!response.ok) {
                const data = await response.json();    
                errorMsg(data.message);
            }
        })
    }
});
export {fetchBlockedUsers, blockUser, unblockUser}