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
  let logInfo = document.getElementById("info");
  let btnUpdateProfile = document.getElementById("update-profile");
  let uploadAvatar = document.getElementById("upload-avatar");

  // api ulrs
  let loginUrl = "http://localhost:8000/auth/login/";
  let signupUrl = "http://localhost:8000/auth/register/";
  let updateUrl = "http://localhost:8000/auth/update/";
  let logoutURL = "http://localhost:8000/auth/logout/";

  function getCookie(name) {
    console.log("getCookie called");
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      console.log("cookie found");
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        // Does this cookie string begin with the name we want?
        console.log("cookie : ", cookie);
        if (cookie.substring(0, name.length + 1) === name + "=") {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  function getCookie2(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }

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
    console.log("Current cookies (before request):", document.cookie);

    fetch(loginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
        usernameLabel.textContent = data.data.username;
        emailLabel.textContent = data.data.email;
        logout.textContent = "logout";
        logInfo.textContent = data.data.id;
        closeLogin();
        document.querySelector(".profile-modify").classList.add("show");
      })
      .catch((error) => {
        console.error("Fetch error:", error);
      });
  });

  logout.addEventListener("click", function () {
    console.log("logout clicked");
    console.log("all cookies : ", document.cookie);
    csrfCookie = getCookie("csrftoken");
    console.log(csrfCookie);
    fetch(logoutURL, {
      method: "POST",
      headers: {
        "X-CSRFToken": csrfCookie,
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
        body: formData,
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
          console.log("Update success: ", data);
          usernameLabel.textContent = data.data.username;
          emailLabel.textContent = data.data.email;
        })
        .catch((error) => {
          console.error("Fetch error: ", error);
        });
    } else {
      console.log("No changes detected, no update performed.");
    }
  });

  uploadAvatar.addEventListener("click", function () {
    let file = document.getElementById("input-avatar").files[0];
    let formData = new FormData();

    formData.append("avatar", file);

    fetch(updateUrl, {
      method: "PUT",
      body: formData,
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
        console.log("sucess: ", data);
      })
      .catch((error) => {
        console.error("Fetch error: ", error);
      });
  });
});
