import { errorMsg, sleep } from "./utils.js";
import { updateProfile, token, userIsConnected, username_global } from "./users.js";
import { route } from "./router.js";
import { loadLanguage, fetchLanguage, changeLanguage } from "./lang.js";
import { closeWebSocket, openWebSocket } from "./userStatus.js";

let is2FAEnabled = false;
let is2FAVerified = false;

async function check2FAStatus() {
    try {
        const response = await fetch('/auth/check-2fa-status/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        is2FAEnabled = data.is_2fa_enabled;
        is2FAVerified = data.is_2fa_verified;
        console.log('2FA Status:', { enabled: is2FAEnabled, verified: is2FAVerified });
        updateToggle2FAButton();
        return { enabled: is2FAEnabled, verified: is2FAVerified };
    } catch (error) {
        console.error('Error checking 2FA status:', error);
        return { enabled: false, verified: false };
    }
}

export async function enable2FA() {
    try {
        console.log("Tentative d'activation de la 2FA");
        let token = localStorage.getItem('access_token');
        const csrfToken = getCSRFToken();

        const response = await fetch('/auth/enable-2fa/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to enable 2FA: ${response.status}`);
        }

        const data = await response.json();
        console.log('2FA Activation Response:', data);

        // Mise à jour de l'interface utilisateur
        const qrCodeContainer = document.getElementById('qr-code-container');
        const img = document.createElement('img');
        const otpSecretSpan = document.getElementById('otp-secret-span');
        const otpSecret = document.getElementById('otp-secret');
        const verifyOTPForm = document.getElementById('verify-otp-form');

        img.src = data.qr_code;
        img.alt = "2FA QR Code";
        img.style.maxWidth = "200px";
        img.style.height = "auto";
        qrCodeContainer.innerHTML = '';
        qrCodeContainer.appendChild(img);

        otpSecretSpan.textContent = data.otp_secret;

        qrCodeContainer.style.display = 'block';
        otpSecret.style.display = 'block';
        verifyOTPForm.style.display = 'block';

        is2FAEnabled = true;
        is2FAVerified = false;
        updateToggle2FAButton();

    } catch (error) {
        console.error('Error enabling 2FA:', error);
        alert('Error enabling 2FA. Please try again. Details: ' + error.message);
    }
}

async function verify2FA(otp) {
    try {
        console.log('Attempting to verify 2FA with OTP:', otp);
        const response = await fetch('/auth/verify-otp/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({ otp })
        });

        const data = await response.json();
        console.log('Verify 2FA Response:', data);

        if (response.ok) {
            is2FAVerified = true;
            alert('OTP Verified Successfully. 2FA is now fully enabled.');
            updateToggle2FAButton();
            hideOTPElements();
        } else {
            throw new Error(data.detail || 'Failed to verify OTP');
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        alert(`Error: ${error.message}`);
    }
}

function updateToggle2FAButton() {
    const toggle2FAButton = document.getElementById('toggle-2fa-button');
    if (is2FAEnabled && is2FAVerified) {
        toggle2FAButton.textContent = 'Disable 2FA';
        toggle2FAButton.onclick = disable2FA;
    } else if (is2FAEnabled && !is2FAVerified) {
        toggle2FAButton.textContent = 'Cancel 2FA Setup';
        toggle2FAButton.style.color = 'orange';
        toggle2FAButton.onclick = cancel2FASetup;
    } else {
        toggle2FAButton.textContent = 'Enable 2FA';
        toggle2FAButton.onclick = enable2FA;
    }
    console.log('Button Updated:', toggle2FAButton.textContent);
}

function cancel2FASetup(event) {
    event.preventDefault();
    console.log('Cancelling 2FA Setup');
    is2FAEnabled = false;
    is2FAVerified = false;
    hideOTPElements();
    updateToggle2FAButton();
    document.getElementById('toggle-2fa-button').style.color = "rgba(255, 255, 255, .8)";
    errorMsg('2FA setup has been cancelled.');
}

function hideOTPElements() {
    document.getElementById('qr-code-container').style.display = 'none';
    document.getElementById('otp-secret').style.display = 'none';
    document.getElementById('verify-otp-form').style.display = 'none';
}

function getCSRFToken() {
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// async function updateUI() {
//     const is2FAEnabled = await check2FAStatus();
//     toggle2FAButton.textContent = is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA';
//     qrCodeContainer.style.display = 'none';
//     otpSecretSpan.textContent = '';
//     verifyOTPForm.style.display = 'none';
// }

// async function check2FAStatus() {
//     try {
//         const response = await fetch('/auth/verify-otp-login/', {
//             method: 'GET',
//             headers: {
//                 'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
//                 'Content-Type': 'application/json'
//             }
//         });
//         const data = await response.json();
//         return data.is_2fa_enabled;
//     } catch (error) {
//         console.error('Error checking 2FA status:', error);
//         return false;
//     }
// }

// async function refreshToken() {
//     const refreshToken = localStorage.getItem('refresh_token');
//     if (!refreshToken) {
//         throw new Error('No refresh token available');
//     }

//     const response = await fetch('/auth/token/refresh/', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ refresh: refreshToken }),
//     });

//     if (!response.ok) {
//         throw new Error('Failed to refresh token');
//     }

//     const data = await response.json();
//     localStorage.setItem('access_token', data.access);
//     return data.access;
// }

// updateUI();

let updateUser, logoutFunc, uploadPicture, displaySettings;
document.addEventListener("DOMContentLoaded", function () {
    ////// UPDATE PROFILE /////

    displaySettings = async function () {
        if (userIsConnected == false) {
            document.getElementById("settings-content").textContent = '';
            document.getElementById("settings-content").innerHTML = '<h3 class="ulist-error">login to access</h3>';
        }

        let user = JSON.parse(localStorage.getItem("user")) || null;

        console.log("userIsConnected in var : ", userIsConnected);
        console.log("userIsConnected in localStorage : ", localStorage.getItem("userIsConnected"));

        if (user === null) {
            console.log("No user found for displayUserInfo");
            return;
        }
        // Ajout de la vérification de l'état de la 2FA
        await check2FAStatus();
        console.log("isf2aEnabled ?", is2FAEnabled);
        console.log("isf2aVerified ?", is2FAVerified);
        updateToggle2FAButton();

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
        var savedLanguage = 'en';
        if (userIsConnected == true)
            savedLanguage = await fetchLanguage();
        console.log("language in db:", savedLanguage);
        if (savedLanguage) {
            document.getElementById('language-select-settings').value = savedLanguage;
        } else {
            console.log('No saved language preference found');
        }

        document.getElementById('language-select-settings').addEventListener('change', function () {
            const selectedLanguage = this.value;
            localStorage.setItem('preferredLanguage', selectedLanguage);
            console.log('Language preference saved:', selectedLanguage);
            loadLanguage(selectedLanguage);
        });

        document.getElementById('toggle-2fa-button').onclick = async function (event) {
            event.preventDefault();
						document.getElementById("qr-code-container").style.display = "block";
						document.getElementById("otp-secret").style.display = "block";
            if (!is2FAEnabled) {
                await enable2FA();
                const verifyOTPForm = document.getElementById('verify-otp-form');
                if (verifyOTPForm) {
                    verifyOTPForm.onsubmit = async function (event) {
                        event.preventDefault();
                        const otpInput = document.querySelector('input[name="otp"]');
                        if (!otpInput) {
                            console.error('OTP input field not found');
                            return;
                        }
                        const otp = otpInput.value;

                        if (!otp) {
                            alert('Please enter an OTP.');
                            return;
                        }

                        await verify2FA(otp);
                    };
                }
            }
        };

        const verifyOTPForm = document.getElementById('verify-otp-form');
        if (verifyOTPForm) {
            verifyOTPForm.onsubmit = async function (event) {
                event.preventDefault();
                const otpInput = document.querySelector('input[name="otp"]');
                if (!otpInput) {
                    console.error('OTP input field not found');
                    return;
                }
                const otp = otpInput.value;

                if (!otp) {
                    alert('Please enter an OTP.');
                    return;
                }

                await verify2FA(otp);
            };
        }
    }

    uploadPicture = async function () {
        let file = document.getElementById("avatar-input").files[0];

        if (file == null || file.type == "") {
            errorMsg("please select a file");
            return;
        }
        let formData = new FormData();

        formData.append("profile_picture", file);

        console.log("update clicked");
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
                    else if (response.status == 413) {
                        errorMsg("Image max size is 10mb")
                    }
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
            .then( async (data) => {
                if (data !== null) {
                    console.log("data: ", data);
                    await closeWebSocket();
                    document.getElementById('user-name').style.color = 'white';
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
        await closeWebSocket();
        await sleep(100);
        let formData = new FormData();
        let hasChanges = false;
        let pwdChange = false;

        console.log("update clicked");
        console.log("all cookies : ", document.cookie);

        let usernameInput = document.getElementById("new-username");
        if (usernameInput.value) {
            console.log(usernameInput.value);
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

        let PictureInput = document.getElementById("avatar-input");
        if (PictureInput.value) {
            uploadPicture();
            if (hasChanges == false)
                return;
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
                            await updateProfile(user, true, data.csrfToken);
                            console.log("username-global", username_global);
                            // await closeWebSocket();
                            console.log("abracadabra", user.id);
                            await openWebSocket(user.id);
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
                // .catch((error) => {
                //     console.error("Fetch error: ", error.message);
                // });
        } else {
            errorMsg("There are no changes");
        }
    }

    // Call displaySettings to initialize the page
    // displaySettings();
});
export { updateUser, logoutFunc, uploadPicture, displaySettings }
