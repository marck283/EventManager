var invip = () => {
	let email = document.getElementById("posta").value;
	console.log(email)

	fetch('../api/v2/EventiPubblici/' + id + '/Inviti', {
		method: 'POST',
		headers: {
			'x-access-token': token,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ email: email })
	}).then(resp => {
		switch (resp.status) {
			case 201: {
				document.getElementById("invitip").textContent = "Invitato"
				break;
			}
			case 401: {
				resp.json().then(data => document.getElementById("invitip").textContent = data.message);
				break;
			}
			case 400:
			case 403:
			case 404:
			case 500: {
				resp.json().then(data => document.getElementById("invitip").textContent = data.error);
			}
		}

		return;
	}).catch(error => console.error(error)); // If there is any error you will catch them here
}