var token = "";
if (localStorage.getItem('token') != null) {
	token = localStorage.getItem('token');
}

fetch('../api/v2/Utenti/me/Inviti', {
	method: 'GET',
	headers: {
		'x-access-token': token
	}
}).then(resp => {
	switch (resp.status) {
		case 200: {
			resp.json().then(data => {
				let paragrafo = document.getElementById("inviti");

				for (elem of data) {
					let d = document.createElement("div");

					let tipo = document.createElement("h4");
					tipo.textContent = "Tipo Evento: ";
					switch (elem.tipoevento) {
						case "pub": {
							tipo.textContent += "pubblico";
							break;
						}
						case "priv": {
							tipo.textContent += "privato";
							break;
						}
						default: {
							tipo.textContent += "tipo evento non riconosciuto";
							break;
						}
					}

					d.appendChild(tipo);

					let h1 = document.createElement("h4");
					h1.textContent = "Evento: " + elem.nomeAtt;

					d.appendChild(h1);

					let h2 = document.createElement("h4");
					h2.textContent = "Organizzatore: " + elem.nomeOrg;

					d.appendChild(h2);

					var h4 = document.createElement("h4");
					if (elem.accettato) {
						h4.textContent = "già accettato";
						d.appendChild(h4);
					}

					let pulsante = document.createElement("button");
					pulsante.textContent = "Iscrizione";
					pulsante.classList = "btn btn-primary";

					if (elem.tipoevento == "pub") {
						pulsante.onclick = iscrInv.bind(this, elem.idevento);
					} else {
						pulsante.onclick = iscrPr.bind(this, elem.idevento);
					}

					d.appendChild(pulsante);

					let h3 = document.createElement("h4");
					h3.textContent = "--------------------"
					d.appendChild(h3);

					paragrafo.appendChild(d);
				}
			});
		}
		case 401: {
			resp.json().then(data => { document.getElementById("error").textContent = data.message });
		}
		case 403:
		case 404:
		case 500: {
			resp.json().then(data => document.getElementById("error").textContent = data.error);
			break;
		}
	}
	return;
}).catch(error => console.error(error)); // If there is any error you will catch them here