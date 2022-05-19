let url = window.location.href;
var id = '';
var token = '';

try{
    url=url.split('?');
    url=url[1].split('&');
    idurl=url[0].split('=');
    tokenurl=url[1].split('=');
    id=idurl[1];
    token=tokenurl[1];
}catch(error){
    console.log(error);
}

fetch('../api/v1/EventiPersonali/'+id)
    .then(resp => {
        switch(resp.status){
            case 200: {
                resp.json().then(resp => {
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
                });
                break;
            }
            case 404:
            case 500: {
                resp.json().then(data => {document.getElementById("error").textContent = data.error});
                break;
            }
            default: {
                console.log(resp.status);
            }
        }
    })
    .catch( error => console.error(error) );
