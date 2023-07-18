let url = window.location.href;
var id = '';
var token = '';

if(localStorage.getItem('token') != null){

    token = localStorage.getItem('token');
}

try{
    url=url.split('=');
    id=url[1];
}catch(error){
    console.log(error);
}

var getID = elemID => {
    return document.getElementById(elemID);
};


//Metodo per il patching di eventi Pubblici
var modificaPub = () => {
    var categoria = "";
    if(getID("categoria").value != "---") {
        categoria = getID("categoria").value;
    }
    
    //Controlli maxPers
    if(getID("maxPers").value != "" && Number.isNaN(parseInt(getID("maxPers").value)) && getID("maxPers").value < 2){    
        getID("error").textContent = "Numero massimo partecipanti non valido: inferiore a 2.";
        return;
    }
    
    
    
    fetch('../api/v2/EventiPubblici/'+id, {method: 'PATCH', body: JSON.stringify({
        nomeAtt: getID("nomeAtt").value,
        categoria: categoria,
        indirizzo: getID("indirizzo").value,
        citta: getID("citta").value,
        maxPers: getID("maxPers").value
    }),
    headers: {'Content-type': 'application/json; charset=UTF-8', 'x-access-token': token}})
    .then(resp => {
        switch(resp.status){
            case 200: {
                getID("error").textContent = "Modifica fatta";
                break;
            }
            case 401: {
                resp.json().then(data => getID("error").textContent = data.message);
                break;
            }
            case 400:
            case 403:
            case 404:
            case 500: {
                resp.json().then(data => getID("error").textContent = data.error);
                break;
            }
            default: {
                console.log(resp.status);
            }
        }
    })
    .catch(error => console.error(error));
}

//Metodo per il patching di eventi Personali
var modificaPers = () => {
    var categoria = "";
    if(getID("categoria").value != "---") {
        categoria = getID("categoria").value;
    }

    fetch('../api/v2/EventiPersonali/'+id, {method: 'PATCH', body: JSON.stringify({
        nomeAtt: getID("nomeAtt").value,
        categoria: categoria,
        indirizzo: getID("indirizzo").value,
        citta: getID("citta").value
    }),
    headers: {'Content-type': 'application/json; charset=UTF-8', 'x-access-token': token}})
    .then(resp => {
        switch(resp.status){
            case 200: {
                getID("error").textContent = "Modifica fatta";
                break;
            }
            case 401: {
                resp.json().then(data => {getID("error").textContent = data.message});
                break;
            }
            case 400:
            case 403:
            case 404:
            case 500: {
                resp.json().then(data => {getID("error").textContent = data.error});
                break;
            }
            default: {
                console.log(resp.status);
            }
        }
    })
    .catch( error => console.error(error) );
    
}

//Metodo per il patching di eventi Privati
var modificaPriv = () => {
    var categoria = "";
    if(getID("categoria").value != "---") {
        categoria = getID("categoria").value;
    }
    
    fetch('../api/v2/EventiPrivati/'+id, {method: 'PATCH', body: JSON.stringify({
        nomeAtt: getID("nomeAtt").value,
        categoria: categoria,
        indirizzo: getID("indirizzo").value,
        citta: getID("citta").value
    }),
    headers: {'Content-type': 'application/json; charset=UTF-8', 'x-access-token': token}})
    .then(resp => {
        switch(resp.status){
            case 200: {
                getID("error").textContent = "Modifica fatta";
                break;
            }
            case 401: {
                resp.json().then(data => {getID("error").textContent = data.message});
                break;
            }
            case 400:
            case 403:
            case 404:
            case 500: {
                resp.json().then(data => {getID("error").textContent = data.error});
                break;
            }
            default: {
                console.log(resp.status);
            }
        }
    })
    .catch( error => console.error(error) );
    
}
