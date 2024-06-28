import { token, getUserId } from "./users.js";
import { msg, escapeHtml } from "./utils.js";

let fetchBlockedUsers, blockUser, unblockUser;
document.addEventListener("DOMContentLoaded", function () {
    ////////////////////// UPDATE THE BLOCKED USERS LIST ////////////////////////////

    let blockUserUrl = "https://" + window.location.host + "/auth/block-user/";
    let unblockUserUrl = "https://" + window.location.host + "/auth/unblock-user/";
    let ListBlockedUsersUrl = "https://" + window.location.host + "/auth/list-blocked-users/";

    //returns a list of blocked users
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
                msg(error.message);
                return null;
            }
            return response.json();
        })
        .then(async (data) => {
            if (data !== null) {
                console.log('Blocked users:', data);
                return data.blocked_users;;
            }
        })
    }


    ////////////////////// BLOCK A USER (not used yet) ////////////////////////////

    //blocks user
    blockUser = async function (username) {
        if (!username) {
            // messageContainer.textContent = "Please enter a username";
            return;
        }
        if ( await getUserId(username) == null) {
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
                msg(data.message);
            }
            else {
                msg(`${escapeHtml(username)} has been blocked`);
            }
        })
    }


    ////////////////////// UNBLOCK A USER (not used yet) ////////////////////////////

    //unblocks user
    unblockUser = async function (username) {
        if (!username) {
            return;
        }

        if ( await getUserId(username) == null) {
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
                msg(data.message);
            }
            else {
                msg(`${escapeHtml(username)} has been unblocked`);
            }
        })
    }
});
export {fetchBlockedUsers, blockUser, unblockUser}