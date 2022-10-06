let url = window.location.href;
var id = '';
var token = '';

if (localStorage.getItem('token') != null) {
    token = localStorage.getItem('token');
}

try {
    url = url.split('=');
    id = url[1];
} catch (error) {
    console.log(error);
}

fetch('../api/v2/EventiPubblici/' + id)
    .then(resp => {
        switch (resp.status) {
            case 200: {
                resp.json().then(resp => {
                    if (!resp.annullato) {
                        let nomeAtt = document.getElementsByTagName("h1");
                        nomeAtt[0].textContent = resp.nomeAtt;

                        let data = document.getElementById("data");
                        data.textContent = resp.data;
                        let ora = document.getElementById("ora");
                        ora.textContent = resp.ora;
                        let durata = document.getElementById("durata");
                        durata.textContent = resp.durata;

                        let categoria = document.getElementById("categoria");
                        categoria.textContent = resp.categoria;

                        let indirizzo = document.getElementById("indirizzo");
                        indirizzo.textContent = resp.luogoEv.indirizzo;
                        let citta = document.getElementById("citta");
                        citta.textContent = resp.luogoEv.citta;

                        let organizzatore = document.getElementById("organizzatore");
                        organizzatore.textContent = resp.organizzatore;

                        let maxPers = document.getElementById("maxPers");
                        maxPers.textContent = resp.maxPers;
                        let numPers = document.getElementById("numPers");
                        numPers.textContent = resp.partecipanti.length;

                        let partecipanti = document.getElementById("partecipanti");
                        partecipanti.textContent = resp.partecipanti;

                        let img = document.createElement("img");
                        img.src = resp.eventPic;
                        img.alt = "Immagine evento";
                        document.getElementById("img").appendChild(img);

                        if(!resp.terminato) {
                            document.getElementById("evaluation").disabled = true;
                        }
                    }
                });
                break;
            }
            case 404:
            case 500: {
                resp.json().then(data => { document.getElementById("error").textContent = data.error });
                break;
            }
            default: {
                console.log(resp.status);
            }
        }
    })
    .catch(error => console.error(error));

var annulla = () => {
    fetch('../api/v2/EventiPubblici/' + id + "/annullaEvento", {
        method: 'DELETE',
        headers: {
            'x-access-token': token
        }
    })
    .then(resp => {
        switch(resp.status) {
            case 200: {
                resp.json().then(data => alert(data.message));
                break;
            }
            case 403:
            case 404:
            case 500: {
                resp.json().then(data => alert(data.error));
                break;
            }
            default: {
                //This should never happen
                alert("Qualcosa è andato storto. Contatta lo sviluppatore.");
                break;
            }
        }
    })
};
