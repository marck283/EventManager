var getFileExtension = fileName => {
	var ext = fileName.split('.').pop();
	return (ext == fileName) ? "" : ext;
}

var showError = (fieldValue, docNode, msg) => {
	if(fieldValue === "") {
		document.getElementById(docNode).textContent = msg;
		return true;
	} else {
		document.getElementById(docNode).textContent = "";
	}
	return false;
}

var reg = () => {
	var email = document.getElementById("loginEmail").value
	var password = document.getElementById("loginPassword").value
	var nome = document.getElementById("RealName").value
	var telefono = document.getElementById("Telefono").value

	if (showError(nome, "n", "Inserire nome") ||
		showError(email, "e", "Inserire email") ||
		showError(password, "p", "Inserire password")) {
		return;
	}

	var file = new FileReader(), realFile = document.querySelector("input[type=file]").files[0];
	file.onloadend = () => {
		regReq(email, nome, password, telefono, file.result, getFileExtension(realFile.name));
	}
	if(realFile) {
		file.readAsDataURL(realFile);
	}
};

var checkFormatCompatibility = format => {
	var formatSpecIndex = 0;
	switch(format) {
		case "jpg": {
			formatSpecIndex = 23;
			break;
		}
		case "png": {
			formatSpecIndex = 22;
			break;
		}
		default: {
			alert("Formato file non supportato.");
			break;
		}
	}
	return formatSpecIndex;
}

var regReq = (email, nome, password, telefono, result, format) => {
	var formatSpecIndex = checkFormatCompatibility(format);
	if(formatSpecIndex === 0) {
		return;
	}
	fetch('../api/v2/Utenti', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			email: email,
			pass: CryptoJS.SHA3(password, {outputLength: 512}).toString(),
			nome: nome,
			tel: telefono,
			csrfToken: document.getElementById("csrfField").value,
			picture: result.substring(formatSpecIndex)
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
