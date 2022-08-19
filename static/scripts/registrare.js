var reg = () => {

	var email = document.getElementById("loginEmail").value
	var password = document.getElementById("loginPassword").value
	var nome = document.getElementById("RealName").value
	var telefono = document.getElementById("Telefono").value

	var vuoto = false;

	if (email == "") {
		document.getElementById("e").innerHTML = "Inserire Email"
		vuoto = true

	} else {
		document.getElementById("e").innerHTML = ""
	}

	if (nome == "") {
		document.getElementById("n").innerHTML = "Inserire nome"
		vuoto = true


	} else {

		document.getElementById("n").innerHTML = ""

	}
	if (password == "") {
		document.getElementById("p").innerHTML = "Inserire password"
		vuoto = true

	} else {

		document.getElementById("p").innerHTML = ""

	}

	if (vuoto == true) {

		return;

	}

	fetch('../api/v2/Utenti', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			email: email, pass: CryptoJS.SHA3(password, {outputLength: 512}).toString(), nome: nome, tel: telefono
		})
	}).then((resp) => {
		switch(resp.status) {
			case 201: {
				alert("Utente registrato con successo.");
				break;
			}
			case 400:
			case 409:
			case 500: {
				alert(resp.json().then(data => data.error));
				break;
			}
		}
	}).catch(error => console.error(error)) // If there is any error you will catch them here
};
