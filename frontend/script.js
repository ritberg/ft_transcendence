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

  // api ulrs
  let loginUrl = "http://localhost:8000/auth/login/";
  let signupUrl = "http://localhost:8000/auth/register/";
  let updateUrl = "http://localhost:8000/auth/update/";
  let logoutURL = "http://localhost:8000/auth/logout/";

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

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    let username = loginForm.querySelector("input[name=username]").value;
    let password = loginForm.querySelector("input[name=password]").value;

    fetch(loginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
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

        // document.getElementById("user-avatar").src = data.avatar;
        usernameLabel.textContent = data.data.username;
        emailLabel.textContent = data.data.email;
        logout.textContent = "logout";
        logInfo.textContent = data.data.id;
        closeLogin();
        document.querySelector(".profile-modify").classList.add("show");
      })
      .catch((error) => {
        console.error("Fetch error: ", error);
      });
  });

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

  logout.addEventListener("click", function () {
    fetch(logoutURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
    let username = document.getElementById("new-username").value;
    if (username === "") {
      console.log(
        "current username: ",
        document.getElementById("user-name").textContent
      );
      username = usernameLabel.textContent;
    }
    let email = emailLabel.value;
    if (email === "") {
      email = document.getElementById("user-email").textContent;
    }
    let password = document.getElementById("new-password").value;
    let id = logInfo.textContent;

    console.log({ id, username, email, password });

    fetch(updateUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, username, email, password }),
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

        usernameLabel.textContent = data.data.username;
        emailLabel.textContent = data.data.email;
      })
      .catch((error) => {
        console.error("Fetch error: ", error);
      });
  });
});
