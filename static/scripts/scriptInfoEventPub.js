let url = window.location.href;
url=url.split('?');
url=url.split('=');
id = url[1];
fetch('../api/v1/EventiPubblici/'+id)
    .then((resp) => resp.json()) // Transform the data into json
    .then(function(resp) {

        let nomeAtt = document.getElementsByTagName("h1");
        nomeAtt[0].textContent = resp.nomeAtt;

        let data = document.getElementById("data");
        data.setAttribute("value", resp.data);
        let ora = document.getElementById("ora");
        ora.setAttribute("value", resp.ora);
        let durata = document.getElementById("durata");
        durata.setAttribute("value", resp.durata);

        let categoria = document.getElementById("categoria");
        categoria.setAttribute("value", resp.categoria);

        let indirizzo = document.getElementById("indirizzo");
        indirizzo.setAttribute("value", resp.luogoEv.indirizzo);
        let citta = document.getElementById("citta");
        citta.setAttribute("value", resp.luogoEv.citta);

        let organizzatore = document.getElementById("organizzatore");
        organizzatore.setAttribute("value", resp.organizzatore);

        let maxPers = document.getElementById("maxPers");
        maxPers.setAttribute("value", resp.maxPers);
        let numPers = document.getElementById("numPers");
        numPers.setAttribute("value", resp.partecipanti.length);

        let partecipanti = document.getElementById("partecipanti");
        partecipanti.textContent = resp.partecipanti;

    })
    .catch( error => console.error(error) );
