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
		console.log(resp)
		/**if(resp.status==403 || resp.status==400){
			document.getElementById("iscrizione").innerHTML = "non iscritto";
		}
		if(resp.status==201){
			document.getElementById("iscrizione").innerHTML = "Iscritto " + "\n" + resp.headers;
		}
		*/

		if (resp.status == 201) {
			document.getElementById("iscrizione").innerHTML = "Registrato"

		}
		if (resp.status == 409 || resp.status == 500 || resp.status == 400) {
			resp.json().then(data => { document.getElementById("iscrizione").innerHTML = data.error });
		}
	}).catch(error => console.error(error)) // If there is any error you will catch them here
};
