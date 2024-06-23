import { errorMsg } from "./utils.js";
import { updateProfile, token, userIsConnected } from "./users.js";
import { route } from "./router.js";
import { loadLanguage } from "./lang.js";

let updateUser, logoutFunc, uploadPicture, displaySettings;
document.addEventListener("DOMContentLoaded", function () {
    ////// UPDATE PROFILE /////

    displaySettings = async function () {
        let user = JSON.parse(localStorage.getItem("user")) || null;

        console.log("userIsConnected in var : ", userIsConnected);
        console.log("userIsConnected in localStorage : ", localStorage.getItem("userIsConnected"));

        if (user === null) {
            console.log("No user found for displayUserInfo");
            return;
        }

        console.log("updateUserInfo called with userInfo =", user);
        if (user) {
            const username = user.username;
            if (username) {
                console.log("PUT USERNAME IN USERINFO DISPLAY: ", username);
                document.getElementById("info-username").textContent = `${username}`;
            }
            if (user.profile_picture) {
                document.getElementById("user-avatar").src = user.profile_picture;
            }
        }
        // Load the saved language preference on settings page load
        const savedLanguage = localStorage.getItem('preferredLanguage');
        if (savedLanguage) {
            document.getElementById('language-select').value = savedLanguage;
            console.log('Loaded saved language preference:', savedLanguage);
        } else {
            console.log('No saved language preference found');
        }

        document.getElementById('language-select').addEventListener('change', function () {
            const selectedLanguage = this.value;
            localStorage.setItem('preferredLanguage', selectedLanguage);
            console.log('Language preference saved:', selectedLanguage);
            loadLanguage(selectedLanguage);
        });
    }

    uploadPicture = async function () {
        let file = document.getElementById("input-avatar").files[0];

        if (file == null || file.type == "") {
            errorMsg("please select a file");
            return;
        }
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
            .then(async (response) => {
                if (!response.ok) {
                    if (response.status == 403)
                        errorMsg("you must be logged in to change picture");
                    else {
                        const error = await response.json();
                        errorMsg(error.message);
                    }
                    return null;
                }
                return response.json();
            })
            .then((data) => {
                if (data !== null) {
                    console.log("sucess: ", data);
                    console.log("profile picture : ", data.data.profile_picture);
                    let user = data.data;
                    document.getElementById("user-avatar").src = data.data.profile_picture;
                    updateProfile(user, true, token);
                }
            })
            .catch((error) => {
                console.error("Fetch error: ", error.detail);
            });
    }

    let logoutUrl = "https://" + window.location.host + "/auth/logout/";

    logoutFunc = async function () {
        fetch(logoutUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": token,
            },
            credentials: "include",
        })
            .then(async (response) => {
                if (!response.ok) {
                    if (response.status == 403)
                        errorMsg("you must be logged in to log out");
                    else {
                        const error = await response.json();
                        errorMsg(error.message);
                    }
                    return null;
                }
                return response.json();
            })
            .then((data) => {
                if (data !== null) {
                    console.log("data: ", data);
                    document.getElementById("chat-box").innerHTML = '';
                    updateProfile(null, false, null);
                    route("/");
                }
            })
            .catch((error) => {
                console.error("Fetch error:", error);
            });
    }

    let updateUrl = "https://" + window.location.host + "/auth/update/";

    updateUser = async function () {
        let formData = new FormData();
        let hasChanges = false;
        let pwdChange = false;

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
            pwdChange = true;
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
                .then(async (response) => {
                    if (!response.ok) {
                        if (response.status == 403)
                            errorMsg("you must be logged in to update your infos");
                        else {
                            const error = await response.json();
                            errorMsg(error.message);
                        }
                        return null;
                    }
                    return response.json();
                })
                .then(async (data) => {
                    if (data !== null) {
                        console.log("Update success: ", data);
                        if (pwdChange == false) {
                            let user = data.data;
                            updateProfile(user, true, data.csrfToken);
                            if (user) {
                                if (data.data.username) {
                                    console.log("PUT USERNAME IN USERINFO DISPLAY: ", data.data.username);
                                    document.getElementById("info-username").textContent = `${data.data.username}`;
                                }
                            }
                        }
                        else {
                            document.getElementById("chat-box").innerHTML = '';
                            updateProfile(null, false, null);
                            route("/");
                        }
                    }
                })
                .catch((error) => {
                    console.error("Fetch error: ", error.message);
                });
        } else {
            errorMsg("There are no changes");
        }
    }
});
export { updateUser, logoutFunc, uploadPicture, displaySettings }