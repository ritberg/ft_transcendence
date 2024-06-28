import { msg, sleep, escapeHtml } from "./utils.js";
import { updateProfile, token, userIsConnected, username_global, getUserId } from "./users.js";
import { route } from "./router.js";
import { fetchLanguage, loadLanguage } from "./lang.js";
import { closeWebSocket, openWebSocket } from "./userStatus.js";

//whether the 2FA setup is ongoing
let is2FAEnabled = false;
//whether the 2FA in enabled for the account
let is2FAVerified = false;

//checks if the user already has 2FA enabled and verified
async function check2FAStatus() {
    try {
        const localUser = JSON.parse(localStorage.getItem('user'));
        console.log('Local Storage 2FA Status:', {
            verified: localUser?.is_2fa_verified
        });
        await fetch("https://" + window.location.host + '/auth/check-2fa-status/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            credentials: "include",
        })
        .then(async (response) => {
            if (!response.ok) {
                let error = await response.json();
                msg(error);
                return null;
            }
            return response.json();
        })
        .then(async (data) => {
            if (data !== null) {
                //first checks if localUser is null or undefined
                if (localUser?.is_2fa_verified !== data.is_2fa_verified) {
                    await updateLocalStorage();
                }
                is2FAVerified = data.is_2fa_verified;
                
                return { verified: is2FAVerified };
            }
            else
                return null;
        })
    } catch (error) {
        console.error('Error checking 2FA status:', error);
        return { enabled: false, verified: false };
    }
}

//updates the user in localStorage
async function updateLocalStorage() {
    try {
        fetch("https://" + window.location.host + '/auth/user-info/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            credentials: "include",
        })
        .then(async (response) => {
            if (!response.ok) {
                let error = await response.json();
                msg(error);
                return null;
            }
            return response.json();
        })
        .then(async (data) => {
            if (data !== null) {
                localStorage.setItem('user', JSON.stringify(data));
                console.log('Local Storage Updated:', data);
            }
            else
                return null;
        })
    } catch (error) {
        console.error('Error updating local storage:', error);
    }
}

//activates 2FA setup
export async function enable2FA() {
    await closeWebSocket();
    //ensures the updateStatus has time to send it's message
    await sleep(100);
    try {
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

        //displays qr code
        img.src = data.qr_code;
        img.alt = "2FA QR Code";
        img.style.maxWidth = "200px";
        img.style.height = "auto";
        qrCodeContainer.innerHTML = '';
        qrCodeContainer.appendChild(img);

        //displays secret
        otpSecretSpan.textContent = data.otp_secret;

        qrCodeContainer.style.display = 'block';
        otpSecret.style.display = 'block';
        verifyOTPForm.style.display = 'block';
        verifyOTPSubmit.style.display = 'block';

        is2FAEnabled = true;
        is2FAVerified = false;
        //updates enable to cancel on the button text
        updateToggle2FAButton();

    } catch (error) {
        console.error('Error enabling 2FA:', error);
        msg(error.message);
    }
}

//disables 2FA if it is verified
async function disable2FA() {
    await closeWebSocket();
    //ensures the updateStatus has time to send it's message
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
        msg('2FA has been disabled successfully.');
    } catch (error) {
        msg(error.message);
    }
    let user_id = await getUserId(username_global);
    await openWebSocket(user_id);
}

//verifies the otp code provided is correct
async function verify2FA(otp) {
    //don't do anything if empty otp
    if (otp.replace(/\s/g,'') == "")
        return;
    await closeWebSocket();
    //ensures the updateStatus has time to send it's message
    await sleep(100);
    try {
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

        if (response.ok) {
            is2FAEnabled = false;
            is2FAVerified = true;
            msg('OTP Verified Successfully. 2FA is now fully enabled.');
            updateToggle2FAButton();
            //hides secret key/qr code
            hideOTPElements();
            await updateLocalStorage();
        } else {
            throw new Error(data.detail || data.message);
        }
    } catch (error) {
        msg(error.message);
    }
    let user_id = await getUserId(username_global);
    await openWebSocket(user_id);
}

//if ongoing 2fa setup is canceled. hides secret key and qr code
function cancel2FASetup(event) {
    console.log('Cancelling 2FA Setup');
    is2FAEnabled = false;
    is2FAVerified = false;
    hideOTPElements();
    updateToggle2FAButton();
    document.getElementById('toggle-2fa-button').style.color = "rgba(255, 255, 255, .8)";
    msg('2FA setup has been cancelled.');
}

//checks whether to display disable/enable/cancel, depends on is2FAEnabled and is2FAVerified
function updateToggle2FAButton() {
    const toggle2FAButton = document.getElementById('toggle-2fa-button');
    if (is2FAVerified) {
        toggle2FAButton.textContent = 'Disable 2FA';
        toggle2FAButton.style.color = 'orange';
        toggle2FAButton.className = 'disable2FA';
    } else if (is2FAEnabled && !is2FAVerified) {
        toggle2FAButton.textContent = 'Cancel 2FA Setup';
        toggle2FAButton.style.color = 'orange';
        toggle2FAButton.className = 'cancel2FA';
    } else {
        toggle2FAButton.textContent = 'Enable 2FA';
        toggle2FAButton.style.color = '';
        toggle2FAButton.className = 'enable2FA';
    }
    //translates the new button text
    var localLanguage = localStorage.getItem('preferredLanguage') || navigator.language.slice(0, 2);
    if (!localLanguage)
        localLanguage = 'en';
    loadLanguage(localLanguage);
}

//called after verifying or canceling the setup
function hideOTPElements() {
    document.getElementById('qr-code-container').style.display = 'none';
    document.getElementById('otp-secret').style.display = 'none';
    document.getElementById('verify-otp-form').style.display = 'none';
    document.getElementById('otp-secret-span').style.display = 'none';
}

let updateUser, logoutFunc, uploadPicture, displaySettings;
document.addEventListener("DOMContentLoaded", function () {
    
    ////// UPDATE PROFILE /////

    //displays settings, such as username, profile picture, prefered language and 2fa
    displaySettings = async function () {
        if (userIsConnected == false) {
            document.getElementById("settings-content").textContent = '';
            document.getElementById("settings-content").innerHTML = '<h3 class="ulist-error">login to access</h3>';
            return;
        }

        let user = JSON.parse(localStorage.getItem("user")) || null;

        if (user === null) {
            console.log("No user found for displayUserInfo");
            return;
        }
        // Ajout de la vérification de l'état de la 2FA
        await check2FAStatus();
        is2FAEnabled = false;
        console.log("isf2aEnabled ?", is2FAEnabled);
        console.log("isf2aVerified ?", is2FAVerified);
        updateToggle2FAButton();

        //if no language in localstorage take the navigator's language
        var localLanguage = localStorage.getItem('preferredLanguage') || navigator.language.slice(0, 2);
        if (!localLanguage)
            localLanguage = 'en';
        loadLanguage(localLanguage);

        //displays username and profile picture
        if (user) {
            const username = user.username;
            if (username) {
                document.getElementById("info-username").textContent = `${escapeHtml(username)}`;
            }
            if (user.profile_picture) {
                document.getElementById("user-avatar").src = user.profile_picture;
            }
        }
        // Load the saved language preference of user on settings page load
        var savedLanguage = 'en';
        if (userIsConnected == true)
            savedLanguage = await fetchLanguage();
        console.log("language in db:", savedLanguage);
        if (savedLanguage) {
            document.getElementById('language-select-settings').value = savedLanguage;
        } else {
            console.log('No saved language preference found');
        }

        //checks whether to execute disable/enable/cancel, depends on is2FAEnabled and is2FAVerified
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
                        msg("you must be logged in to log out");
                    else {
                        const error = await response.json();
                        msg(error.message);
                    }
                    return null;
                }
                return response.json();
            })
            .then( async (data) => {
                if (data !== null) {
                    console.log("data: ", data);
                    //close the status websocket if logging out
                    await closeWebSocket();
                    //removes chat content
                    document.getElementById("chat-box").innerHTML = '';
                    //sets user to zero in updateProfile
                    updateProfile(null, false, null);
                    //redirects to main page
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
        //changes will be put in a formData and sent to the backend
        let formData = new FormData();
        let hasChanges = false;
        let pwdChange = false;

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
            //if the password changes different operations will occur
            pwdChange = true;
        }

        let PictureInput = document.getElementById("avatar-input");
        if (PictureInput.value) {
            let file = document.getElementById("avatar-input").files[0];
            formData.append("profile_picture", file);
            hasChanges = true;
        }

        //if no changes don't do anything
        if (!hasChanges) {
            msg("There are no changes");
            return;
        }

        await closeWebSocket();
        //ensures the updateStatus has time to send it's message
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
                //if image is too big
                if (response.status == 413)
                    msg("Image max size is 2mb")
                else {
                    const error = await response.json();
                    msg(error.message);
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
                //if password remains unchanged, updates profile
                let user = data.data;
                await updateProfile(user, true, data.csrfToken);
                let user_id = await getUserId(username_global);
                await openWebSocket(user_id);
            }
            else {
                //if password is changed, logs out and asks to login again
                document.getElementById("chat-box").innerHTML = '';
                await updateProfile(null, false, null);
                route("/");
            }
        })
    }
});
export { updateUser, logoutFunc, uploadPicture, displaySettings }
