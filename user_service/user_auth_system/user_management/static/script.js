document.addEventListener("DOMContentLoaded", function () {
  // button
  let btnProfile = document.getElementById("user-avatar");
  let btnLogin = document.getElementById("login");
  let btnSignup = document.getElementById("signup");
  let btnFormClose = document.getElementById("btn-form-close");

  // form
  let formContainer = document.querySelector(".form-container");
  let loginForm = document.querySelector(".login-form");
  let signupForm = document.querySelector(".signup-form");

  // user nav
  let usernameLabel = document.getElementById("user-name");
  let emailLabel = document.getElementById("user-email");
  let logout = document.getElementById("user-logout");
  let profile_picture = document.getElementById("user-avatar");
  let logInfo = document.getElementById("info");
  let btnUpdateProfile = document.getElementById("update-profile");
  let btnUploadProfilePicture = document.getElementById("upload-avatar");
  let btnChat = document.getElementById("chat");

  // api ulrs
  let loginUrl = "http://localhost:8000/auth/login/";
  let signupUrl = "http://localhost:8000/auth/register/";
  let updateUrl = "http://localhost:8000/auth/update/";
  let logoutURL = "http://localhost:8000/auth/logout/";
  let friendRequestUrl = "http://localhost:8000/auth/send-friend-request/";
  let acceptFriendRequestUrl =
    "http://localhost:8000/auth/accept-friend-request/";
  let rejectFriendRequestUrl =
    "http://localhost:8000/auth/reject-friend-request/";
  let friendRequestListUrl = "http://localhost:8000/auth/list-friend-requests/";
  let friendListUrl = "http://localhost:8000/auth/list-friends/";
  let delFriendUrl = "http://localhost:8000/auth/delete-friend/";

  // CSRF token
  let csrfMetaTag = document.querySelector('meta[name="csrf-token"]');
  let token = csrfMetaTag ? csrfMetaTag.getAttribute("content") : null;

  if (!token) {
    console.error("CSRF token not found!");
    return; // Arrêtez l'exécution si le token CSRF n'est pas trouvé
  }

  const updateCSRFToken = (newToken) => {
    console.log("old token : ", token);
    token = newToken;
    console.log("new token : ", token);
    document
      .querySelector('meta[name="csrf-token"]')
      .setAttribute("content", newToken);
  };

  // add click event listener for button

  closeLogin = () => {
    formContainer.classList.remove("show");
    loginForm.classList.remove("show");
    signupForm.classList.remove("show");
  };

  openLogin = () => {
    formContainer.classList.add("show");
    loginForm.classList.add("show");
    signupForm.classList.remove("show");
  };

  displayProfile = (user) => {
    usernameLabel.textContent = user.username;
    emailLabel.textContent = user.email;
    logout.textContent = "logout";
    logInfo.textContent = user.id;
    if (user.profile_picture) {
      profile_picture.src = user.profile_picture;
    }
    closeLogin();
    document.querySelector(".profile-modify").classList.add("show");
  };

  btnFormClose.addEventListener("click", function () {
    closeLogin();
  });

  btnProfile.addEventListener("click", function () {
    openLogin();
  });

  btnSignup.addEventListener("click", function () {
    signupForm.classList.add("show");
    loginForm.classList.remove("show");
  });

  btnLogin.addEventListener("click", function () {
    loginForm.classList.add("show");
    signupForm.classList.remove("show");
  });

  document.querySelectorAll(".toggle-password").forEach(function (icon) {
    icon.addEventListener("click", function () {
      let input = icon.previousElementSibling;

      if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("uil-eye-slash");
        icon.classList.add("uil-eye");
      } else {
        input.type = "password";
        icon.classList.remove("uil-eye");
        icon.classList.add("uil-eye-slash");
      }
    });
  });

  // form validation

  signupForm.addEventListener("submit", function (event) {
    event.preventDefault();

    let username = signupForm.querySelector("input[name=username]").value;
    let email = signupForm.querySelector("input[name=email]").value;
    let password = signupForm.querySelector("input[name=password]").value;

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

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Récupère les valeurs des champs du formulaire
    let username = loginForm.querySelector("input[name=username]").value;
    let password = loginForm.querySelector("input[name=password]").value;

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
        displayProfile(data.data);
        console.log("token received : ", data.crsfToken);
        updateCSRFToken(data.crsfToken);
        fetchFriendRequests();
        fetchFriends();
      })
      .catch((error) => {
        console.error("Fetch error:", error);
      });
  });

  logout.addEventListener("click", function () {
    console.log("logout clicked");
    console.log("all cookies : ", document.cookie);
    console.log("token : ", token);
    fetch(logoutURL, {
      method: "POST",
      headers: {
        "X-CSRFToken": token,
      },
      credentials: "include",
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

        usernameLabel.textContent = "Guest";
        emailLabel.textContent = "";
        logout.textContent = "";
        profile_picture.src = "";
        logInfo.textContent = "Please login to access your profile";
        document.querySelector(".profile-modify").classList.remove("show");
      })
      .catch((error) => {
        console.error("Fetch error: ", error);
      });
  });

  btnUpdateProfile.addEventListener("click", function () {
    let formData = new FormData();
    let hasChanges = false;

    console.log("update clicked");
    console.log("all cookies : ", document.cookie);

    let usernameInput = document.getElementById("new-username");
    if (usernameInput.value) {
      formData.append("username", usernameInput.value);
      hasChanges = true;
    }

    let emailInput = document.getElementById("new-email");
    if (emailInput.value) {
      formData.append("email", emailInput.value);
      hasChanges = true;
    }

    let passwordInput = document.getElementById("new-password");
    if (passwordInput.value) {
      formData.append("password", passwordInput.value);
      hasChanges = true;
    }

    let avatarInput = document.getElementById("input-avatar");
    if (avatarInput.files.length > 0) {
      formData.append("avatar", avatarInput.files[0]);
      hasChanges = true;
    }

    if (hasChanges) {
      fetch(updateUrl, {
        method: "PUT",
        headers: {
          "X-CSRFToken": token,
        },
        body: formData,
        credentials: "include",
      })
        .then((response) => {
          if (!response.ok) {
            console.log(response);
            return response.json().then((error) => {
              throw new Error(JSON.stringify(error));
            });
          }
          return response.json();
        })
        .then((data) => {
          console.log("Update success: ", data);
          usernameLabel.textContent = data.data.username;
          emailLabel.textContent = data.data.email;
        })
        .catch((error) => {
          console.error("Fetch error: ", error.message);
        });
    } else {
      console.log("No changes detected, no update performed.");
    }
  });

  btnUploadProfilePicture.addEventListener("click", function () {
    let file = document.getElementById("input-avatar").files[0];
    let formData = new FormData();

    formData.append("profile_picture", file);

    console.log("update clicked");
    // console.log("all cookies : ", document.cookie);
    console.log("file : ", file);
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    fetch(updateUrl, {
      method: "PUT",
      headers: {
        "X-CSRFToken": token,
      },
      body: formData,
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          console.log(response);
          return response.json().then((error) => {
            throw new Error(JSON.stringify(error));
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log("sucess: ", data);
        console.log("profile picture : ", data.data.profile_picture);
        profile_picture.src = data.data.profile_picture;
      })
      .catch((error) => {
        console.error("Fetch error: ", error.detail);
      });
  });

  // Fetch and display friend requests

  const fetchFriendRequests = async () => {
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
      console.log("Friend requests data:", data); // Debug: log data
      if (data && Array.isArray(data.data)) {
        displayFriendRequests(data.data);
      } else {
        console.error("Expected an array but got:", data);
      }
    } catch (error) {
      console.error("Error fetching friend requests:", error);
    }
  };

  const displayFriendRequests = (requests) => {
    const friendRequestsContainer = document.getElementById("friend-requests");
    friendRequestsContainer.innerHTML = "";
    requests.forEach((request) => {
      const requestElement = document.createElement("div");
      requestElement.classList.add("friend-request");
      requestElement.innerHTML = `
        <span>${request.from_user.username}</span>
        <div class="buttons">
          <button onclick="handleFriendRequest(${request.id}, true)">Accept</button>
          <button onclick="handleFriendRequest(${request.id}, false)">Reject</button>
        </div>
      `;
      friendRequestsContainer.appendChild(requestElement);
    });
  };

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
      fetchFriendRequests(); // Reload the list of friend requests
      fetchFriends(); // Reload the list of friends
    } catch (error) {
      console.error("Error handling friend request:", error);
    }
  };

  // Function to fetch and display friends
  const fetchFriends = async () => {
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
        console.error("Expected an array but got:", data);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  const displayFriends = (friends) => {
    const friendsContainer = document.getElementById("friends-list");
    friendsContainer.innerHTML = "";
    friends.forEach((friend) => {
      const friendElement = document.createElement("div");
      friendElement.classList.add("friend");
      friendElement.innerHTML = `<span>${friend.username}</span>`;
      friendsContainer.appendChild(friendElement);
    });
  };

  // Function to add a friend
  const getUserId = async (username) => {
    const response = await fetch(
      `http://localhost:8000/auth/get-user-id/?username=${username}`
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Error getting user ID");
    }
    console.log("data : ", data);
    return data.id;
  };

  const addFriend = async () => {
    const username = document.getElementById("friend-username-to-add").value;
    console.log("friend username : ", username);
    const messageContainer = document.getElementById("add-friend-message");
    if (!username) {
      messageContainer.textContent = "Please enter a username";
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
      messageContainer.textContent = data.message;
      if (response.ok) {
        document.getElementById("friend-username-to-add").value = "";
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
      messageContainer.textContent = "Error sending friend request";
    }
  };

  const delFriend = async () => {
    const username = document.getElementById("friend-username-to-del").value;
    console.log("friend username : ", username);
    const messageContainer = document.getElementById("del-friend-message");
    if (!username) {
      messageContainer.textContent = "Please enter a username";
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
      messageContainer.textContent = data.message;
      if (response.ok) {
        document.getElementById("friend-username-to-del").value = "";
        fetchFriends();
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
      messageContainer.textContent = "Error sending friend request";
    }
  };

  document
    .getElementById("add-friend-btn")
    .addEventListener("click", addFriend);
  document
    .getElementById("del-friend-btn")
    .addEventListener("click", delFriend);
  document.getElementById("refresh-btn").addEventListener("click", () => {
    fetchFriendRequests();
    fetchFriends();
  });

  // btnChat.addEventListener("click", function (event) {

  //   // Logs de départ avant l'envoi de la requête
  //   console.log("Sending chat room request...");

  //   console.log("token : ", token);

  //   fetch(chatRoom1Url, {
  //     method: "POST",
  //       headers: {
  //         "X-CSRFToken": token,
  //         "Content-Type": "application/json",
  //       },
  //       credentials: "include",
  //   })
  //     .then((response) => {
  //       // Logs les headers de la réponse pour voir les cookies reçus
  //       console.log("Response Headers:", [...response.headers.entries()]);

  //       // Vérifie si la réponse est correcte (status 200-299)
  //       if (!response.ok) {
  //         console.log("Full response:", response);
  //         throw new Error("Network response was not ok");
  //       }

  //       // Retourne la réponse en JSON
  //       return response.json();
  //     })
  //     .then((data) => {
  //       // Logs pour voir le contenu des cookies après la requête
  //       console.log("chat request data:", data);

  //       // Met à jour les éléments d'interface utilisateur
  //       console.log("data : ", data.data);
  //     })
  //     .catch((error) => {
  //       console.error("Fetch error:", error);
  //     });
  // });



  // document.addEventListener('click', function() {
  //   const btnChat = document.getElementById("btnChat");
  //   const userListContainer = document.getElementById("userListContainer");

  //   // Existing URLs
  //   let chatRoom1Url = "http://localhost:8001/users/";

  //   btnChat.addEventListener("click", function (event) {
  //       console.log("Sending chat room request...");

  //       const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

  //       fetch(chatRoom1Url, {
  //           method: "POST",
  //           headers: {
  //               "X-CSRFToken": token,
  //               "Content-Type": "application/json",
  //           },
  //           credentials: "include", // Important: Include credentials (cookies)
  //       })
  //       .then((response) => {
  //           console.log("Response Headers:", [...response.headers.entries()]);

  //           if (!response.ok) {
  //               console.log("Full response:", response);
  //               throw new Error("Network response was not ok");
  //           }

  //           return response.text();
  //       })
  //       .then((html) => {
  //           userListContainer.innerHTML = html;
  //       })
  //       .catch((error) => {
  //           console.error("Fetch error:", error);
  //       });
  //     });
  //   });
  });
