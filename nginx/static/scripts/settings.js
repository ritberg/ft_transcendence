import { errorMsg, sleep } from "./utils.js";
import { updateProfile, token, userIsConnected, username_global, getUserId } from "./users.js";
import { route } from "./router.js";
import { fetchLanguage, loadLanguage } from "./lang.js";
import { closeWebSocket, openWebSocket } from "./userStatus.js";

let is2FAEnabled = false;
let is2FAVerified = false;

async function check2FAStatus() {
    try {
        const localUser = JSON.parse(localStorage.getItem('user'));
        console.log('Local Storage 2FA Status:', {
            verified: localUser?.is_2fa_verified 
        });
        const response = await fetch("https://" + window.location.host + '/auth/check-2fa-status/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            credentials: "include",
        });
        const serverData = await response.json();
        console.log('Server 2FA Status:', serverData);

        if (localUser?.is_2fa_verified !== serverData.is_2fa_verified) {
            await updateLocalStorage();
        }

        is2FAVerified = serverData.is_2fa_verified;
        
        return { verified: is2FAVerified };
    } catch (error) {
        console.error('Error checking 2FA status:', error);
        return { enabled: false, verified: false };
    }
}

async function updateLocalStorage() {
    try {
        const response = await fetch("https://" + window.location.host + '/auth/user-info/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            credentials: "include",
        });
        const userData = await response.json();
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('Local Storage Updated:', userData);
    } catch (error) {
        console.error('Error updating local storage:', error);
    }
}

export async function enable2FA() {
    await closeWebSocket();
    await sleep(100);
    try {
        console.log("Tentative d'activation de la 2FA");

        const response = await fetch("https://" + window.location.host + '/auth/enable-2fa/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-CSRFToken': token
            },
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error(`Failed to enable 2FA`);
        }
        let user_id = await getUserId(username_global);
        await openWebSocket(user_id);
        const data = await response.json();
        console.log('2FA Activation Response:', data);

        const qrCodeContainer = document.getElementById('qr-code-container');
        const img = document.createElement('img');
        const otpSecretSpan = document.getElementById('otp-secret-span');
        const otpSecret = document.getElementById('otp-secret');
        const verifyOTPForm = document.getElementById('settings-otp-form');
        const verifyOTPSubmit = document.getElementById('verify-otp-form');

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
        verifyOTPSubmit.style.display = 'block';

        is2FAEnabled = true;
        is2FAVerified = false;
        updateToggle2FAButton();

    } catch (error) {
        console.error('Error enabling 2FA:', error);
        errorMsg(error.message);
    }
}

async function disable2FA() {
    await closeWebSocket();
    await sleep(100);
    try {
        const response = await fetch("https://" + window.location.host + '/auth/disable-2fa/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-CSRFToken': token,
            },
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error(`Failed to disable 2FA: ${response.status}`);
        }

        const data = await response.json();
        console.log('2FA Disable Response:', data);

        is2FAEnabled = false;
        is2FAVerified = false;
        updateToggle2FAButton();
        errorMsg('2FA has been disabled successfully.');
    } catch (error) {
        errorMsg(error.message);
    }
    let user_id = await getUserId(username_global);
    await openWebSocket(user_id);
}

async function verify2FA(otp) {
    if (otp.replace(/\s/g,'') == "")
        return;
    await closeWebSocket();
    await sleep(100);
    try {
        console.log('Attempting to verify 2FA with OTP:', otp);
        const response = await fetch("https://" + window.location.host + '/auth/verify-otp/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-CSRFToken': token
            },
            body: JSON.stringify({ otp }),
            credentials: "include",
        });

        const data = await response.json();
        console.log('Verify 2FA Response:', data);
        console.log('Response status:', response.status);

        if (response.ok) {
            is2FAEnabled = false;
            is2FAVerified = true;
            errorMsg('OTP Verified Successfully. 2FA is now fully enabled.');
            updateToggle2FAButton();
            hideOTPElements();
            await updateLocalStorage();
        } else {
            throw new Error(data.detail || data.message);
        }
    } catch (error) {
        errorMsg(error.message);
    }
    let user_id = await getUserId(username_global);
    await openWebSocket(user_id);
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

function updateToggle2FAButton() {
    const toggle2FAButton = document.getElementById('toggle-2fa-button');
    if (is2FAVerified) {
        toggle2FAButton.textContent = 'Disable 2FA';
        toggle2FAButton.onclick = disable2FA;
        toggle2FAButton.style.color = 'orange';
        toggle2FAButton.className = 'disable2FA';
    } else if (is2FAEnabled && !is2FAVerified) {
        toggle2FAButton.textContent = 'Cancel 2FA Setup';
        toggle2FAButton.style.color = 'orange';
        toggle2FAButton.onclick = cancel2FASetup;
        toggle2FAButton.className = 'cancel2FA';
    } else {
        toggle2FAButton.textContent = 'Enable 2FA';
        toggle2FAButton.onclick = enable2FA;
        toggle2FAButton.style.color = '';
        toggle2FAButton.className = 'enable2FA';
    }
    var localLanguage = localStorage.getItem('preferredLanguage') || navigator.language.slice(0, 2);
    if (!localLanguage)
        localLanguage = 'en';
    loadLanguage(localLanguage);
}

function hideOTPElements() {
    document.getElementById('qr-code-container').style.display = 'none';
    document.getElementById('otp-secret').style.display = 'none';
    document.getElementById('verify-otp-form').style.display = 'none';
}

// export function getCSRFToken() {
//     const name = 'csrftoken';
//     let cookieValue = null;
//     if (document.cookie && document.cookie !== '') {
//         const cookies = document.cookie.split(';');
//         for (let i = 0; i < cookies.length; i++) {
//             const cookie = cookies[i].trim();
//             if (cookie.substring(0, name.length + 1) === (name + '=')) {
//                 cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
//                 break;
//             }
//         }
//     }
//     return cookieValue;
// }

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

        var localLanguage = localStorage.getItem('preferredLanguage') || navigator.language.slice(0, 2);
        if (!localLanguage)
            localLanguage = 'en';
        loadLanguage(localLanguage);

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

        // document.getElementById('language-select-settings').addEventListener('change', function () {
        //     console.log("hye mate");
        //     const selectedLanguage = this.value;
        //     localStorage.setItem('preferredLanguage', selectedLanguage);
        //     console.log('Language preference saved:', selectedLanguage);
        //     loadLanguage(selectedLanguage);
        // });

        document.getElementById('toggle-2fa-button').onclick = async function (event) {
            event.preventDefault();
            if (is2FAVerified) {
                disable2FA();
                return;
            }
            else if (is2FAEnabled && !is2FAVerified) {
                cancel2FASetup();
                return;
            }
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

                await verify2FA(otp);
            };
        }
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

            localStorage.removeItem('user');
            localStorage.removeItem('access_token');
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
            console.log(PictureInput.value);
            let file = document.getElementById("avatar-input").files[0];
            formData.append("profile_picture", file);
            hasChanges = true;
        }

        if (!hasChanges)
            return;

        await closeWebSocket();
        await sleep(100);

        await fetch(updateUrl, {
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
                else if (response.status == 413)
                    errorMsg("Image max size is 2mb")
                else {
                    const error = await response.json();
                    errorMsg(error.message);
                }
                return null;
            }
            return response.json();
        })
        .then(async (data) => {
            if (data === null)
                return;
            console.log("Update success: ", data);
            if (pwdChange === false) {
                let user = data.data;
                await updateProfile(user, true, data.csrfToken);
                console.log("for fuck sake");
                let user_id = await getUserId(username_global);
                await openWebSocket(user_id);
            }
            else {
                document.getElementById("chat-box").innerHTML = '';
                await updateProfile(null, false, null);
                route("/");
            }
        })
    }
});
export { updateUser, logoutFunc, uploadPicture, displaySettings }
