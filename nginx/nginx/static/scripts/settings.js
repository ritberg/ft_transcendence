import { errorMsg } from "./utils.js";
import { updateProfile, token, userIsConnected } from "./users.js";
import { route } from "./router.js";
import { loadLanguage } from "./lang.js";

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

async function updateUI() {
    const is2FAEnabled = await check2FAStatus();
    toggle2FAButton.textContent = is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA';
    qrCodeContainer.style.display = 'none';
    otpSecretSpan.textContent = '';
    verifyOTPForm.style.display = 'none';
}

async function check2FAStatus() {
    try {
        const response = await fetch('/auth/verify-otp-login/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        return data.is_2fa_enabled;
    } catch (error) {
        console.error('Error checking 2FA status:', error);
        return false;
    }
}

async function refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
        throw new Error('No refresh token available');
    }

    const response = await fetch('/auth/token/refresh/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
        throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.access);
    return data.access;
}

updateUI();

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

        document.getElementById('enable-2fa-form').onsubmit = async function (event) {
            event.preventDefault();
            try {
                console.log("Tentative d'activation de la 2FA");
                let token = localStorage.getItem('access_token');
                const csrfToken = getCSRFToken();
        
                const makeRequest = async (token) => {
                    const response = await fetch('/auth/enable-2fa/', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                            'X-CSRFToken': csrfToken
                        }
                    });
        
                    console.log("Statut de la réponse:", response.status);
                    const responseText = await response.text();
                    console.log("Contenu de la réponse:", responseText);
        
                    if (response.status === 403 && responseText.includes('token_not_valid')) {
                        token = await refreshToken();
                        return makeRequest(token);
                    }
        
                    if (!response.ok) {
                        throw new Error(`Failed to enable 2FA: ${response.status} ${responseText}`);
                    }
        
                    return JSON.parse(responseText);
                };
        
                const data = await makeRequest(token);
        
                // Affichage du QR code et du secret OTP
                const qrCodeContainer = document.getElementById('qr-code-container');
                const img = document.createElement('img');
                const otpSecretSpan = document.getElementById('otp-secret');
                const verifyOTPForm = document.getElementById('verify-otp-form');
        
                // Afficher le QR code
                img.src = data.qr_code;
                img.alt = "2FA QR Code";
                img.style.maxWidth = "200px";
                img.style.height = "auto";
                qrCodeContainer.innerHTML = '';
                qrCodeContainer.appendChild(img);
                qrCodeContainer.style.display = 'block';
        
                // Afficher le secret OTP
                otpSecretSpan.textContent = data.otp_secret;
        
                // Afficher le formulaire de vérification OTP
                verifyOTPForm.style.display = 'block';
        
                // Changer le texte du bouton
                // document.getElementById('toggle-2fa-button').textContent = 'Disable 2FA';
        
            } catch (error) {
                console.error('Error enabling 2FA:', error);
                alert('Error enabling 2FA. Please try again. Details: ' + error.message);
            }
        };

        document.getElementById('verify-otp-form').onsubmit = async function (event) {
            event.preventDefault();
            const otp = document.querySelector('input[name="otp"]').value;
            
            if (!otp) {
                alert('Please enter an OTP.');
                return;
            }
        
            try {
                const response = await fetch('/auth/verify-otp/', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCSRFToken() // Assurez-vous d'avoir une fonction getCSRFToken()
                    },
                    body: JSON.stringify({ otp })
                });
        
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const data = await response.json();
                    if (response.ok) {
                        alert('OTP Verified Successfully');
                        // Mettez à jour l'interface utilisateur ici
                    } else {
                        throw new Error(data.detail || 'Failed to verify OTP');
                    }
                } else {
                    const text = await response.text();
                    console.error('Unexpected response:', text);
                    throw new Error('Server returned an unexpected response');
                }
            } catch (error) {
                console.error('Error verifying OTP:', error);
                alert(`Error: ${error.message}`);
            }
        };
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
    // Add event listeners
    document.getElementById('update-profile').addEventListener('click', updateUser);
    document.getElementById('user-logout').addEventListener('click', logoutFunc);
    document.getElementById('upload-avatar').addEventListener('click', uploadPicture);

    // Call displaySettings to initialize the page
    displaySettings();
});
export { updateUser, logoutFunc, uploadPicture, displaySettings }