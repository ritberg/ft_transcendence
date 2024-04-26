document.addEventListener("DOMContentLoaded", function () {
  let btnProfile = document.getElementById("btnLogin");
  let btnLogin = document.getElementById("login");
  let btnSignup = document.getElementById("signup");
  let btnFormClose = document.getElementById("btnFormClose");
  let formContainer = document.querySelector(".form-container");
  let loginForm = document.querySelector(".login-form");
  let signupForm = document.querySelector(".signup-form");

  btnFormClose.addEventListener("click", function () {
    formContainer.classList.remove("show");
    loginForm.classList.remove("show");
    signupForm.classList.remove("show");
  });

  btnProfile.addEventListener("click", function () {
    formContainer.classList.add("show");
    loginForm.classList.add("show");
    signupForm.classList.remove("show");
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
});
