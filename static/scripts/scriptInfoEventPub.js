let url = window.location.href;
url=url.split('?');
url=url[1].split('=');
id = url[1];
fetch('../api/v1/EventiPubblici/'+id)
    .then((resp) => resp.json()) // Transform the data into json
    .then(function(resp) {

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

    })
    .catch( error => console.error(error) );
