var iscr = () => {
	fetch('../api/v2/EventiPubblici/' + id + '/Iscrizioni', {
		method: 'POST',
		headers: {
			'x-access-token': token
		}
	}).then(resp => {
		switch (resp.status) {
			case 201: {
				document.getElementById("iscrizione").textContent = "Iscritto";
				break;
			}
			case 401: {
				resp.json().then(data => document.getElementById("iscrizione").textContent = data.message);
				break;
			}
			case 403:
			case 404:
			case 500: {
				resp.json().then(data => { document.getElementById("iscrizione").textContent = data.error });
				break;
			}
		}
		return;
	}).catch(error => console.error(error)); // If there is any error you will catch them here
};

var iscrInv = (id) => {
	fetch('../api/v2/EventiPubblici/' + id + '/Iscrizioni', {
		method: 'POST',
		headers: {
			'x-access-token': token
		}
	}).then(resp => {
		switch(resp.status) {
			case 201: {
				alert("Iscritto");
				break;
			}
			case 401: {
				resp.json().then(data => alert(data.message));
				break;
			}
			case 403:
			case 404:
			case 500: {
				resp.json().then(data => alert(data.error));
				break;
			}
		}

		return;
	}).catch(error => console.error(error)); // If there is any error you will catch them here
}