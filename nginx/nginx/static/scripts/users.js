import { sleep, errorMsg } from './utils.js';
import { route } from './router.js';
import { invite_accept } from './chat.js';
import { blockUser, unblockUser, fetchBlockedUsers } from './block.js';
import { fetchFriends, fetchFriendRequests } from './friends.js';
import { handleChatLinkClick } from './chat.js';
import { addFriend } from './friends.js';
import { loadLanguage, fetchLanguage } from './lang.js';
import { openWebSocket } from './userStatus.js';
import { enable2FA } from './settings.js';

export var username_global = "guest";
export var token = localStorage.getItem("token") || null;
export var userIsConnected = JSON.parse(localStorage.getItem("userIsConnected")) || false;

export const getUserId = async (username) => {
	let getIdUrl = "https://" + window.location.host + `/auth/get-user-id/?username=${username}`;
	const response = await fetch(getIdUrl,
		{
			method: "GET",
			headers: {
				"X-CSRFToken": token,
				"Content-Type": "application/json",
			},
			credentials: "include",
		}
	);
	const data = await response.json();
	if (!response.ok) {
		if (response.status == 403)
			errorMsg("you must be logged in to access profiles");
		else {
			errorMsg("this user does not exist");
		}
		return null;
	}
	console.log("data : ", data);
	return data.id;
};

export const updateProfile = async (user, isConnected, token) => {
	console.log("updateProfile called with =", user, isConnected, token);

	if (user !== null) {
		console.log("user is not null")
		username_global = user.username;
		localStorage.setItem("user", JSON.stringify(user));
		document.getElementById("user-name").textContent = user.username;
		document.getElementById("profile-pic").src = user.profile_picture;
	}
	else {
		console.log("user is null")
		username_global = "Guest";
		document.getElementById("profile-pic").src = "/media/profile_pics/default.jpg"
		localStorage.removeItem("user");
		document.getElementById("user-name").textContent = "Guest";
	}
	localStorage.setItem("userIsConnected", isConnected);
	userIsConnected = isConnected;
	console.log("userIsConnected : ", localStorage.getItem("userIsConnected"));
	console.log("print tokennnnn2 ", token);
	if (token !== null) {
		updateCSRFToken(token);
	} else {
		localStorage.removeItem("token");
	}
};

const updateCSRFToken = (newToken) => {
	console.log("old token : ", token);
	token = newToken;
	localStorage.setItem("token", token);
	console.log("new token : ", token);
	document.querySelector('meta[name="csrf-token"]').setAttribute("content", newToken);
};

let usersClick, signupButton, loginButton;
document.addEventListener("DOMContentLoaded", function () {

	let storedUser = localStorage.getItem("user");
	if (storedUser) {
		let user = JSON.parse(storedUser);
		username_global = user.username;
		document.getElementById("profile-pic").src = user.profile_picture;
		document.getElementById("user-name").textContent = user.username;
	}

	if (token == null) {
		let csrfMetaTag = document.querySelector('meta[name="csrf-token"]');
		token = csrfMetaTag ? csrfMetaTag.getAttribute("content") : null;
	}

	if (!token) {
		console.error("CSRF token not found!");
		return;
	}

	////////////////////// SIGNUP ////////////////////////////

	let signupUrl = "https://" + window.location.host + "/auth/register/";

	signupButton = async function (event) {
        event.preventDefault();

        if (userIsConnected == true) {
            errorMsg("cannot signup while logged in");
            return;
        }
        let username = document.getElementById("username").value;
        let email = document.getElementById("email").value;
        let password = document.getElementById("password").value;
        let password_confirm = document.getElementById("password_confirm").value;

        if (password !== password_confirm) {
            errorMsg("Passwords don't match");
            return;
        }

        console.log({ username, email, password, password_confirm });

        await fetch(signupUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": token,
            },
            body: JSON.stringify({ username, email, password, password_confirm }),
        })
        .then( async (response) => {
            if (!response.ok) {
                if (response.status == 403) {
                    errorMsg("error logging in");
                    return null;
                }
                const error = await response.json();
                console.log(error);
                if (error.email) {
                    if (typeof(error.email) == 'string')
                        errorMsg(error.email);
                    else
                        errorMsg(error.email[0]);
                }
				else if (error.username) {
                    if (typeof(error.username) == 'string')
                        errorMsg(error.username);
                    else
                        errorMsg(error.username[0]);
                }
                else if (error.password) {
                    if (typeof(error.password) == 'string')
                        errorMsg(error.password);
                    else
                        errorMsg(error.password[0]);
                }
                return null;
            }
            return response.json();
        })
        .then((data) => {
            if (data !== null) {
                console.log(data);
                console.log("token received : ", data.crsfToken);
                updateCSRFToken(data.crsfToken);
                route("/signin/");
            }
        })
            .catch((error) => {
                console.error("Fetch error: ", error);
            });
    }



	////////////////////// LOGIN ////////////////////////////

	//let loginForm = document.getElementById("b-signin-ok");
	let loginUrl = "https://" + window.location.host + "/auth/signin/";

	loginButton = async function (event) {
		event.preventDefault();
		if (userIsConnected == true) {
			errorMsg("cannot login while already logged in");
			return null;
		}

		let username = document.getElementById("username1").value;
		let password = document.getElementById("password1").value;

		console.log("Sending signin request...");
		console.log("username : ", username);

		return await fetch(loginUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-CSRFToken": token,
			},
			body: JSON.stringify({ username, password }),
			credentials: "include",
		})
		.then(async (response) => {
			if (!response.ok) {
				if (response.status == 403)
					errorMsg("error logging in");
				else {
					const error = await response.json();
					console.log(error);
					let message = error.message.split(": ");
					if (message.length > 1)
						errorMsg(message[1]);
					else
						errorMsg(error.message);
					// errorMsg(error.message[1]);
				}
				return null;
			}
			return response.json();
		})
		.then(async (data) => {
			if (data !== null) {
				console.log("Cookies after signin response:", document.cookie);
				console.log("Login successful. Server response data:", data);
				if (data.is_2fa_enabled == true) {
					enable2FA();
					return;
				}
				let user = data.data;
				console.log("data : ", user);
				console.log("token received : ", data.crsfToken);
				updateProfile(user, true, data.crsfToken);
				await openWebSocket(user.id);
				let language = await fetchLanguage();
				localStorage.setItem('preferredLanguage', language);
				loadLanguage(language);
				document.getElementById('language-select-menu').value = language
				route('/');
				// await addGame(); // à supprimer
				return user;
			}
		})
			.catch((error) => {
				console.error("Fetch error:", error);
			});
	}

	////////////////////// USERS LIST + BUTTON "START CHAT" ////////////////////////////

	usersClick = async function () {
		let usersUrl = "https://" + window.location.host + "/users_list/";

		await fetch(usersUrl, {
			method: "POST",
			headers: {
				"X-CSRFToken": token,
				"Content-Type": "application/json",
			},
			credentials: "include",
		})
		.then( async (response) => {
			if (!response.ok)
				throw new Error("Network response was not ok");
			return response.json();
		})
			.then(async data => {
				await fetchFriendRequests();
				await fetchFriends();
				const usersList = document.getElementById('users_list-container');
				usersList.innerHTML = '';
				console.log("data: ", data);

				if (data.users.length !== 0) {
					data.users.forEach((user) => {
						const li = document.createElement('li');     		////
						//li.textContent = user.username;        		//// dinamically creating users list with
						const user_button = document.createElement('span');	////
						user_button.style.flexGrow = "1";
						user_button.style.cursor = "pointer";
						user_button.textContent = user.username;
						user_button.id = "user_profile";
						li.appendChild(user_button);

						const add_button = document.createElement('button');	////
						add_button.classList.add("bi", "bi-person-plus");
						add_button.addEventListener('click', (e) => {
							e.preventDefault();
							addFriend(user.username);
						});
						li.appendChild(add_button);
						//// buttons "start chat" 
						const chat_button = document.createElement('button');	////
						chat_button.classList.add("bi", "bi-chat-left-text");

						chat_button.addEventListener('click', (e) => {
							e.preventDefault();
							console.log(e.target);
							if (!(document.getElementById("chat-box").classList.item("active")))
								document.getElementById("chat-box").classList.toggle("active");
							handleChatLinkClick(user.username);				//// opening chat
						});

						li.appendChild(chat_button);
						const block_button = document.createElement('button');	////
						block_button.classList.add("bi", "bi-slash-circle");
						block_button.addEventListener('click', async (e) => {
							e.preventDefault();
							let blocked_users = await fetchBlockedUsers();
							console.log("1", blocked_users);
							console.log("2", user.username);
							if (blocked_users.includes(user.username))
								unblockUser(user.username);
							else
								blockUser(user.username);
						});
						li.appendChild(block_button);
						usersList.appendChild(li);
					});
				}
			})
			.catch(error => {
				const error_msg = document.createElement("h3");
				error_msg.classList.add("ulist-error");
				error_msg.id = ("users-not-allowed");
				error_msg.textContent = "login to access";
				document.getElementById("ulist-users").appendChild(error_msg);
				var savedLanguage = localStorage.getItem('preferredLanguage');
				if (!savedLanguage)
					savedLanguage = 'en';
				document.getElementById('language-select-menu').value = savedLanguage;
				loadLanguage(savedLanguage);
			});
		//.catch((error) => console.error("Error fetching user data:", error));
	}

	////////////////////// A SUPPRIMER (DEMANDER A ALESS SI C'EST OK) ////////////////////////////

	async function addGame() {
		console.log("add game clicked");

		try {
			const player_1_id = await getUserId("aless");
			const player_2_id = await getUserId("rita");

			const game = {
				player_1_id: player_1_id,
				player_2_id: player_2_id,
				player_1_score: 10,
				player_2_score: 5,
				winner_id: player_1_id,
				date_played: new Date().toISOString(),
				duration: 300,
			};

			console.log("game : ", JSON.stringify(game));

			let setGameUrl = "https://" + window.location.host + "/stat/game-history/";

			const response = await fetch(setGameUrl, {
				method: "POST",
				headers: {
					"X-CSRFToken": token,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(game),
				credentials: "include",
			});

			if (!response.ok) {
				const errorData = await response.json();
				console.log(response);
				throw new Error(`Network response was not ok: ${JSON.stringify(errorData)}`);
			}

			const data = await response.json();
			console.log(data);
		} catch (error) {
			console.error("Fetch error: ", error);
		}
	}
});
export { usersClick, signupButton, loginButton }