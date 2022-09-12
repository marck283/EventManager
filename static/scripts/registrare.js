var reg = () => {

	var email = document.getElementById("loginEmail").value
	var password = document.getElementById("loginPassword").value
	var nome = document.getElementById("RealName").value
	var telefono = document.getElementById("Telefono").value

	var vuoto = false;

	if (email == "") {
		document.getElementById("e").textContent = "Inserire Email"
		vuoto = true
	} else {
		document.getElementById("e").textContent = ""
	}

	if (nome == "") {
		document.getElementById("n").textContent = "Inserire nome"
		vuoto = true
	} else {
		document.getElementById("n").textContent = ""
	}

	if (password == "") {
		document.getElementById("p").textContent = "Inserire password"
		vuoto = true
	} else {
		document.getElementById("p").textContent = ""
	}

	if (vuoto) {
		return;
	}

	var file = new FileReader(), realFile = document.querySelector("input[type=file]").files[0];
	file.onloadend = () => {
		regReq(email, nome, password, telefono, file.result);
	}
	if(realFile) {
		file.readAsDataURL(realFile);
	}
};

var regReq = (email, nome, password, telefono, result) => {
	fetch('../api/v2/Utenti', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			email: email,
			pass: CryptoJS.SHA3(password, {outputLength: 512}).toString(),
			nome: nome,
			tel: telefono,
			csrfToken: document.getElementById("csrfField").value,
			picture: result.substring(22)
		})
	}).then(resp => {
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
}
