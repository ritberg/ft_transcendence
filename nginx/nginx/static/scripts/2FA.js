document.getElementById('enable-2fa-form').onsubmit = async function (event) {
	event.preventDefault();
	const response = await fetch('/api/enable-2fa/', {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
			'Content-Type': 'application/json'
		}
	});
	const data = await response.json();
	alert(`2FA Enabled. OTP Secret: ${data.otp_secret}`);
};

document.getElementById('verify-otp-form').onsubmit = async function (event) {
	event.preventDefault();
	const otp = document.querySelector('input[name="otp"]').value;
	const response = await fetch('/api/verify-otp/', {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ otp })
	});
	const data = await response.json();
	if (response.ok) {
		alert('OTP Verified');
	} else {
		alert('Invalid OTP');
	}
};