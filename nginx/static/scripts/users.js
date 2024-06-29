import { escapeHtml, msg } from './utils.js';
import { route } from './router.js';
import { blockUser, unblockUser, fetchBlockedUsers } from './block.js';
import { fetchFriends, fetchFriendRequests } from './friends.js';
import { handleChatLinkClick } from './chat.js';
import { addFriend } from './friends.js';
import { loadLanguage, fetchLanguage } from './lang.js';
import { openWebSocket } from './userStatus.js';

export var username_global = "guest";
export var token = localStorage.getItem("token") || null;
export var userIsConnected = JSON.parse(localStorage.getItem("userIsConnected")) || false;

let usersClick, signupButton, loginButton;
document.addEventListener("DOMContentLoaded", function () {

	//at the start of the runtime of the website check if there is a user in localStorage
	let storedUser = localStorage.getItem("user");
	if (storedUser) {
		let user = JSON.parse(storedUser);
		username_global = user.username;
		document.getElementById("profile-pic").src = user.profile_picture;
		document.getElementById("user-name").textContent = escapeHtml(user.username);
	}

	if (token == null) {
		let csrfMetaTag = document.querySelector('meta[name="csrf-token"]');
		token = csrfMetaTag ? csrfMetaTag.getAttribute("content") : null;
	}

	if (!token) {
		console.error("CSRF token not found!");
		return;
	}
});

//fetches a user's id
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
		if (response.status == 404)
			msg("You must be logged in to access profiles");
		else {
			msg("This user does not exist");
		}
		return null;
	}
	return data.id;
};

//updates the profile, usually after a login or update
export const updateProfile = async (user, isConnected, token) => {
    console.log("updateProfile called with =", user, isConnected, token);

    if (user !== null) {
        username_global = user.username;
        localStorage.setItem("user", JSON.stringify(user));
		//put name on top right
        const userNameElement = document.getElementById("user-name");
        if (userNameElement) userNameElement.textContent = escapeHtml(user.username);
		//updates pfp on the top right
        const profilePicElement = document.getElementById("profile-pic");
        if (profilePicElement) profilePicElement.src = user.profile_picture;
		//updates pfp in profile
        const userAvatarElement = document.getElementById("user-avatar");
        if (userAvatarElement) userAvatarElement.src = user.profile_picture;
		//removes the preview from the input
        const avatarInputElement = document.getElementById("avatar-input");
        if (avatarInputElement) avatarInputElement.value = null;
		//updates the username in settings
        const infoUsernameElement = document.getElementById("info-username");
        if (infoUsernameElement) infoUsernameElement.textContent = escapeHtml(user.username);
    } else {
		//deletes user info, after a logout or a password update
        console.log("user is null")
        username_global = "Guest";
        const profilePicElement = document.getElementById("profile-pic");
        if (profilePicElement) profilePicElement.src = "/media/profile_pics/default.jpg";
		//remove user from localstorage
        localStorage.removeItem("user");
        const userNameElement = document.getElementById("user-name");	
        if (userNameElement) userNameElement.textContent = "Guest";
    }
    localStorage.setItem("userIsConnected", isConnected);
    userIsConnected = isConnected;
	//update CSRFToken
    if (token !== null) {
        updateCSRFToken(token);
    } else {
        localStorage.removeItem("token");
    }
};

//the function that updates the csrf token, after a login for example
const updateCSRFToken = (newToken) => {
	console.log("old token : ", token);
	token = newToken;
	localStorage.setItem("token", token);
	console.log("new token : ", token);
	document.querySelector('meta[name="csrf-token"]').setAttribute("content", newToken);
};

////////////////////// SIGNUP ////////////////////////////

let signupUrl = "https://" + window.location.host + "/auth/register/";

signupButton = async function (event) {
	event.preventDefault();

	if (userIsConnected == true) {
		msg("Cannot signup while logged in");
		return;
	}

	//takes values from form
	let username = document.getElementById("username").value;
	let email = document.getElementById("email").value;
	let password = document.getElementById("password").value;
	let password_confirm = document.getElementById("password_confirm").value;

	//check to make sure both passwords match
	if (password !== password_confirm) {
		msg("Passwords don't match");
		return;
	}

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
				msg("Error logging in");
				return null;
			}
			const error = await response.json();
			if (error.email) {
				if (typeof(error.email) == 'string')
					msg(error.email);
				else
					msg(error.email[0]);
			}
			else if (error.username) {
				if (typeof(error.username) == 'string')
					msg(error.username);
				else
					msg(error.username[0]);
			}
			else if (error.password) {
				if (typeof(error.password) == 'string')
					msg(error.password);
				else
					msg(error.password[0]);
			}
			return null;
		}
		return response.json();
	})
	.then((data) => {
		if (data !== null) {
			console.log(data);
			route("/signin/");
		}
	})
		.catch((error) => {
			console.error("Fetch error: ", error);
		});
}



////////////////////// LOGIN ////////////////////////////

let loginUrl = "https://" + window.location.host + "/auth/signin/";
var otp_id;

loginButton = async function (event) {
	event.preventDefault();
	if (userIsConnected == true) {
		msg("Cannot login while already logged in");
		return null;
	}

	let username = document.getElementById("username1").value;
	let password = document.getElementById("password1").value;

	console.log("Sending signin request...");

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
				msg("Error logging in");
			else {
				const error = await response.json();
				let message = error.message.split(": ");
				if (message.length > 1)
					msg(message[1]);
				else
					msg(error.message);
			}
			return null;
		}
		return response.json();
	})
	.then(async (data) => {
		if (data !== null) {
			console.log("Login successful. Server response data:", data);
			//if 2FA is not enabled, the user will have to complete an additional step before logging in
			if (data.require_2fa == true) {
				document.getElementById("otp-full").style.display = "block";
				document.getElementById("signin-form").style.display = "none";
				document.getElementById("signin-title").style.display = "none";
				otp_id = data.user_id;
				const verifyOTPForm = document.getElementById('login-otp-form');
				if (verifyOTPForm) {
					verifyOTPForm.onsubmit = async function (event) {
						event.preventDefault();
						const otpInput = document.querySelector('input[name="otp"]');
						if (!otpInput) {
							console.error('OTP input field not found');
							return;
						}
						const otp = otpInput.value;

						await VerifyOTPLogin(otp, otp_id);
					};
				}
				return;
			}
			//if no 2FA, immediately login
			let user = data.data;
			console.log("token received : ", data.crsfToken);
			//updates website with new user
			await updateProfile(user, true, data.crsfToken);
			let language = await fetchLanguage();
			//opens webSocket for status
			await openWebSocket(user.id);
			//applies the users's language from his settings
			localStorage.setItem('preferredLanguage', language);
			//load the appropriate language
			loadLanguage(language);
			document.getElementById('language-select-menu').value = language
			//redirect to main page
			route('/');
			return user;
		}
	})
		.catch((error) => {
			console.error("Fetch error:", error);
		});
}

//the additional step which is called if 2FA is enabled
async function VerifyOTPLogin(otp, user_id) {
	//check if otp is empty
	if (otp.replace(/\s/g,'') == "")
		return;
	try {
		console.log('Attempting to verify 2FA with OTP:', otp);
		const response = await fetch("https://" + window.location.host + '/auth/verify-otp-login/', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
				'Content-Type': 'application/json',
				'X-CSRFToken': token,
			},
			body: JSON.stringify({ otp, user_id }),
			credentials: "include",
		});

		const data = await response.json();
		console.log('Verify 2FA Response:', data);

		if (response.ok) {
			//if otp is correct, do the same steps as login
			console.log("now logging in");
			let user = data.user;
			await updateProfile(user, true, data.csrfToken);
			let language = await fetchLanguage();
			await openWebSocket(user.id);
			localStorage.setItem('preferredLanguage', language);
			loadLanguage(language);
			document.getElementById('language-select-menu').value = language
			route('/');
		} else {
			throw new Error(data.detail || data.message);
		}
	} catch (error) {
		msg(error.message);
	}
}
////////////////////// USERS LIST + BUTTON "START CHAT" ////////////////////////////

//displays the users/friends
usersClick = async function () {
	let usersUrl = "https://" + window.location.host + "/users_list/";

	//not accessible if not connected
	if (userIsConnected == false) {
		const error_msg = document.createElement("h3");
		error_msg.classList.add("ulist-error");
		error_msg.id = ("users-not-allowed");
		error_msg.textContent = "login to access";
		document.getElementById("ulist-users").appendChild(error_msg);
		var savedLanguage = localStorage.getItem('preferredLanguage') || navigator.language.slice(0, 2); // get the language from local storage or browser
		if (!savedLanguage)
			savedLanguage = 'en';
		document.getElementById('language-select-menu').value = savedLanguage;
		loadLanguage(savedLanguage);
		return;
	}
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
			if (data == null) {
				return;
			}
			//fetching the friends/friend requests is only done if the user fetch was successful
			await fetchFriendRequests();
			await fetchFriends();
			const usersList = document.getElementById('users_list-container');
			usersList.innerHTML = '';
			console.log("data: ", data);

			//creates the display for the users one by one
			if (data.users.length !== 0) {
				data.users.forEach((user) => {
					//displays name
					const li = document.createElement('li');
					const user_button = document.createElement('span');
					user_button.style.flexGrow = "1";
					user_button.style.cursor = "pointer";
					user_button.textContent = escapeHtml(user.username);
					user_button.id = "user_profile";
					li.appendChild(user_button);

					//displays add friend button
					const add_button = document.createElement('button');
					add_button.classList.add("bi", "bi-person-plus");
					add_button.addEventListener('click', (e) => {
						e.preventDefault();
						addFriend(user.username);
					});
					li.appendChild(add_button);

					//displays chat button
					const chat_button = document.createElement('button');
					chat_button.classList.add("bi", "bi-chat-left-text");
					chat_button.addEventListener('click', (e) => {
						e.preventDefault();
						if (!(document.getElementById("chat-box").classList.item("active")))
							document.getElementById("chat-box").classList.toggle("active");
						handleChatLinkClick(user.username);
					});
					li.appendChild(chat_button);

					//displays the block button
					const block_button = document.createElement('button');
					block_button.classList.add("bi", "bi-slash-circle");
					block_button.addEventListener('click', async (e) => {
						e.preventDefault();
						let blocked_users = await fetchBlockedUsers();
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
			msg("Users can not be retrieved at this time");
		});
}
export { usersClick, signupButton, loginButton }