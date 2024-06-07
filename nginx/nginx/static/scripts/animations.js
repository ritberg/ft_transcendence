import { sleep } from './utils.js';
import { GameMode } from './main.js';
import { drawBrackets, enterNicknames } from './brackets.js';

var token;
var csrfMetaTag;

document.addEventListener("DOMContentLoaded", function () {
	// CSRF token
	csrfMetaTag = document.querySelector('meta[name="csrf-token"]');
	token = csrfMetaTag ? csrfMetaTag.getAttribute("content") : null;

	if (!token) {
		console.error("CSRF token not found!");
		return;
	}

	const updateCSRFToken = (newToken) => {
		console.log("old token : ", token);
		token = newToken;
		console.log("new token : ", token);
		document
			.querySelector('meta[name="csrf-token"]')
			.setAttribute("content", newToken);
	};


	document.getElementById("hamburger-icon").addEventListener("click", function () {
		document.getElementById("hamburger-icon").classList.toggle("active");
		document.getElementById("vertical-tab").classList.toggle("active");
	});

	// document.getElementById("chat").addEventListener("click", function () {
	// 	document.getElementById("chat-box").classList.toggle("active");
	// });

	document.getElementById("profile-button").addEventListener("click", function () {
		if (window.getComputedStyle(document.getElementById("profile-box_main")).display === "none") {
			document.getElementById("profile-box_main").style.display = "block";
			document.getElementById("profile-box_main1").style.display = "none";
			document.getElementById("main-buttons").style.display = "none";
			
		} else {
			document.getElementById("profile-box_main").style.display = "none";
			document.getElementById("profile-box_main1").style.display = "none";
			document.getElementById("main-buttons").style.display = "flex";
		}

	});


	let signupUrl = "https://localhost/auth/register/";

	let signupForm = document.getElementById("go");

	signupForm.addEventListener("click", function (event) {
		event.preventDefault();
		let username = document.getElementById("username").value;
		let email = document.getElementById("email").value;
		let password = document.getElementById("password").value;

		console.log({ username, email, password });

		fetch(signupUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-CSRFToken": token,
			},
			body: JSON.stringify({ username, email, password }),
		})
			.then((response) => {
				if (!response.ok) {
					console.log(response);
					throw new Error("Network response was not ok");
				}
				return response.json();
			})
			.then((data) => {
				console.log(data);
				console.log("token received : ", data.crsfToken);
				updateCSRFToken(data.crsfToken);

				// displayProfile(data.data);
			})
			.catch((error) => {
				console.error("Fetch error: ", error);
			});
	});

	let loginForm = document.getElementById("go1");
	// loginForm.classList.add("show");
	// signupForm.classList.remove("show");
	let loginUrl = "https://localhost/auth/login/";

	loginForm.addEventListener("click", function (event) {
		event.preventDefault();

		// Récupère les valeurs des champs du formulaire
		let username = document.getElementById("username1").value;
		let password = document.getElementById("password1").value;

		// Logs de départ avant l'envoi de la requête
		console.log("Sending login request...");

		console.log("username : ", username);

		fetch(loginUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-CSRFToken": token,
			},
			body: JSON.stringify({ username, password }),
			credentials: "include",
		})
			.then((response) => {
				// Logs les headers de la réponse pour voir les cookies reçus
				console.log("Response Headers:", [...response.headers.entries()]);

				// Vérifie si la réponse est correcte (status 200-299)
				if (!response.ok) {
					console.log("Full response:", response);
					throw new Error("Network response was not ok");
				}

				// Retourne la réponse en JSON
				return response.json();
			})
			.then((data) => {
				// Logs pour voir le contenu des cookies après la requête
				console.log("Cookies after login response:", document.cookie);
				console.log("Login successful. Server response data:", data);

				// Met à jour les éléments d'interface utilisateur
				console.log("data : ", data.data);
				// displayProfile(data.data);
				console.log("token received : ", data.crsfToken);
				updateCSRFToken(data.crsfToken);
				document.getElementById("user-name").innerHTML = "guest";
				// fetchFriendRequests();
				// fetchFriends();
			})
			.catch((error) => {
				console.error("Fetch error:", error);
			});
		});

	


	let btnLogin = document.getElementById("login");
	let btnSignup = document.getElementById("signup");

	btnSignup.addEventListener("click", function () {
		document.getElementById("profile-box_main").style.display = "block";
		document.getElementById("profile-box_main1").style.display = "none";
	});

	btnLogin.addEventListener("click", function () {
		document.getElementById("profile-box_main").style.display = "none";
		document.getElementById("profile-box_main1").style.display = "block";
	});

	


  /////////////     Chat start (Rita)  //////////////

  let usrsLst = document.getElementById("users-full-list-button");
  let usersListBox = document.getElementById("users-list-box");
  usersListBox.classList.add('show');


  usrsLst.addEventListener("click", function (event) {
    fetch('https://localhost/users/', {
      method: "POST",
      headers: {
        "X-CSRFToken": token,
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then(response => response.json())
      .then(data => {
        const usersList = document.getElementById('users-list-container');
        usersList.innerHTML = '';

        data.users.forEach(user => {
          const li = document.createElement('li');
          li.textContent = user.username + ' ';

          const button = document.createElement('button');
          button.textContent = 'Start Chat';

          button.addEventListener('click', () => handleChatLinkClick(user.username));

          li.appendChild(button);
          usersList.appendChild(li);
        });
      })
      .catch(error => console.error('Error fetching user data:', error));
  });

  function handleChatLinkClick(username) {
    const chatUrl = `https://localhost/chat/${username}/`;

    fetch(chatUrl, {
      method: "POST",
      headers: {
        "X-CSRFToken": token,
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json(); 
      })
      .then((data) => {
        console.log("++ room_name : ", data.room_name);
        console.log("++ other_user : ", data.other_user);
        console.log("++ username : ", data.username);
        console.log("++ messages : ", data.messages);

        const chatContainer = document.createElement('div');
        chatContainer.classList.add('chat__container');

        if (data && data.other_user && Array.isArray(data.messages)){
          chatContainer.innerHTML = `
          <center><h1>Chat with ${data.other_user}</h1></center>
          <div class="chat__item__container" id="id_chat_item_container">
            ${data.messages.map(message => `
              <div class="chat__message ${message.fields.username === data.username ? 'chat__message--self' : 'chat__message--other'}">
                <img src="https://via.placeholder.com/40" alt="User Photo">
                <div class="chat__message__content">
                  <div class="chat__message__username">${message.fields.username}</div>
                  <div class="chat__message__text">${message.fields.message}</div>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="chat__input__container">
            <input type="text" id="id_message_send_input" placeholder="Type a message..." />
            <button type="submit" id="id_message_send_button">Send Message</button>
          </div>
        `;
        }
        else {
          console.error('data is missing or is not an array', data);
        }
  
        const listItemElement = document.getElementById('chat-container');
        listItemElement.appendChild(chatContainer);
  
        // Initialize WebSocket connection
        const roomName = data.room_name;
        const chatSocket = new WebSocket("wss://" + window.location.host + "/chat/" + roomName + "/");
  
        chatSocket.onopen = function (e) {
          console.log("The connection was set up successfully!");
        };
  
        chatSocket.onclose = function (e) {
          console.log("Something unexpected happened!");
        };
  
        document.querySelector("#id_message_send_input").focus();
        document.querySelector("#id_message_send_input").onkeyup = function (e) {
          if (e.keyCode === 13) {
            document.querySelector("#id_message_send_button").click();
          }
        };
  
        document.querySelector("#id_message_send_button").onclick = async function (e) {
          await fetchBlockedUsers();
          let ok = 0;
          console.log("blocking situation ", blocked_users.length);
          for (i = 0; i < blocked_users.length; i++)
          {
            if (blocked_users[i] == data.other_user)
              ok = 1;
          }
          if (ok == 0) {
            const messageInput = document.querySelector("#id_message_send_input").value;
            chatSocket.send(JSON.stringify({ message: messageInput, username: data.username }));
          }
        };
  
        chatSocket.onmessage = async function (e) {
          await fetchBlockedUsers();
          const data = JSON.parse(e.data);
          let ok = 0;
          console.log("blocking situation ", blocked_users.length);
          for (i = 0; i < blocked_users.length; i++)
          {
            if (blocked_users[i] == data.username)
              ok = 1;
          }
          if (ok == 1) 
            return;
        
          const currentUser = data.username;
          const div = document.createElement("div");
          div.classList.add("chat__message");
          if (data.username === currentUser) {
            div.classList.add("chat__message--self");
          } else {
            div.classList.add("chat__message--other");
          }
          div.innerHTML = `
            <img src="https://via.placeholder.com/40" alt="User Photo">
            <div class="chat__message__content">
              <div class="chat__message__username">${data.username}</div>
              <div class="chat__message__text">${data.message}</div>
            </div>
          `;
          document.querySelector("#id_message_send_input").value = "";
          document.querySelector("#id_chat_item_container").appendChild(div);
          document.querySelector("#id_chat_item_container").scrollTop = document.querySelector("#id_chat_item_container").scrollHeight;
        };
      })
      .catch(error => console.error('Error fetching chat data:', error));
  }

  /////////////     Chat end (Rita)  //////////////






	///////////////////////////////////////////////////////////

	document.addEventListener('DOMContentLoaded', () => {
		const inputElement = document.getElementById('room_name_input');
		const textElement = document.getElementById('empty_room_text');

		textElement.style.opacity = '0';
		inputElement.addEventListener('focus', () => {
			if (inputElement.value.length === 0) {
				textElement.style.opacity = '1';
			}
		});
		inputElement.addEventListener('blur', () => {
			textElement.style.opacity = '0';
		});
		inputElement.addEventListener('input', () => {
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
		});
	});

	document.getElementById("main-buttons").addEventListener("click", function () {
		var button_id = event.target.id;
		if (event.target.tagName.toLowerCase() === "button") {
			document.getElementById("main-buttons").classList.add("hidden");
			if (button_id === "online-mode") {
				document.getElementById("login-box").style.display = "block";
				document.getElementById("login-box").classList.add("shown");
				document.getElementById("GO_O").addEventListener("click", function () {
					GameMode(3);
				});
			}
			else if (button_id === "tournoi-mode") {
				document.getElementById("tournoi").style.display = "block";
				document.getElementById("tournoi").classList.add("shown");
				document.getElementById("OK_T").addEventListener("click", async function () {
					document.getElementById("tournoi").style.opacity = "1";
					document.getElementById("tournoi").classList.remove("shown");
					document.getElementById("tournoi").classList.add("hidden");
					await sleep(700);
					document.getElementById("tournoi").style.display = "none";
					document.getElementById("nickname_setup_box").style.display = "flex";
					enterNicknames(document.getElementById("slider1").value);
					document.getElementById("nicknames_form").addEventListener("submit", function (event) {
						event.preventDefault();
						// if (document.forms["nicknames_form"]["player_1"].value != "" && document.forms["nicknames_form"]["player_1"].value != null) {
						// }
						document.getElementById("nickname_setup_box").style.display = "none";
						document.getElementById("brackets").style.display = "block";
						drawBrackets(document.getElementById("slider1").value);
					});
				});
			}
			else if (button_id === "pvp-mode")
				GameMode(0);
			else if (button_id === "cpu-mode")
				GameMode(1);
			document.getElementById("main-buttons").addEventListener("animationend", function () {
				document.getElementById("main-buttons").style.display = "none";
			});
		}
	});

	document.getElementById("slider1").addEventListener("mousedown", function () {
		document.getElementById("PLAYERS_T").style.textShadow = `white 0 0 5px`;
		document.getElementById("PLAYERS_T").textContent = `${this.value}`;
	});
	document.getElementById("slider1").addEventListener("input", function () {
		document.getElementById("PLAYERS_T").textContent = `${this.value}`;
	});
	document.getElementById("slider1").addEventListener("mouseup", function () {
		document.getElementById("PLAYERS_T").style.textShadow = `none`;
		document.getElementById("PLAYERS_T").textContent = `PLAYERS`;
	});

	document.getElementById("slider2").addEventListener("mousedown", function () {
		document.getElementById("DIFFICULTY_T").style.textShadow = `white 0 0 5px`;
		if (`${this.value}` === '1') {
			document.getElementById("DIFFICULTY_T").textContent = `EASY`;
		} else if (`${this.value}` === '2') {
			document.getElementById("DIFFICULTY_T").textContent = `MEDIUM`;
		} else {
			document.getElementById("DIFFICULTY_T").textContent = `HARD`;
		}
	});
	document.getElementById("slider2").addEventListener("input", function () {
		if (`${this.value}` === '1') {
			document.getElementById("DIFFICULTY_T").textContent = `EASY`;
		} else if (`${this.value}` === '2') {
			document.getElementById("DIFFICULTY_T").textContent = `MEDIUM`;
		} else {
			document.getElementById("DIFFICULTY_T").textContent = `HARD`;
		}
	});
	document.getElementById("slider2").addEventListener("mouseup", function () {
		document.getElementById("DIFFICULTY_T").style.textShadow = `none`;
		document.getElementById("DIFFICULTY_T").textContent = `DIFFICULTY`;
	});

	document.getElementById("slider3").addEventListener("mousedown", function () {
		document.getElementById("MODE_T").style.textShadow = `white 0 0 5px`;
		if (`${this.value}` === '0') {
			document.getElementById("MODE_T").textContent = `DEFAULT`;
		} else {
			document.getElementById("MODE_T").textContent = `POWER-UPS`;
		}
	});
	document.getElementById("slider3").addEventListener("input", function () {
		// document.getElementById("MODE_T").style.textShadow = `none`;
		if (`${this.value}` === '0') {
			document.getElementById("MODE_T").textContent = `DEFAULT`;
		} else {
			document.getElementById("MODE_T").textContent = `POWER-UPS`;
		}
	});
	document.getElementById("slider3").addEventListener("mouseup", function () {
		document.getElementById("MODE_T").style.textShadow = `none`;
		document.getElementById("MODE_T").textContent = `MODE`;
	});

});