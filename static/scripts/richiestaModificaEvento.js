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

var getID = elemID => {
    return document.getElementById(elemID);
};


//Metodo per il patching di eventi Pubblici
var modificaPub = () => {
    
    //Controlli maxPers
    
    if(Number.isNaN(parseInt(getID("maxPers").value))){
        getID("error").textContent = "Numero massimo partecipanti non valido: formato non valido.";
        return;
    }
    
    if(getID("maxPers").value < 2){
        getID("error").textContent = "Numero massimo partecipanti non valido: inferiore a 2.";
        return;
    }
    
    fetch('../api/v1/EventiPubblici/'+id, {method: 'PATCH', body: JSON.stringify({
        nomeAtt: getID("nomeAtt").value,
        categoria: getID("categoria").value,
        indirizzo: getID("indirizzo").value,
        citta: getID("citta").value,
        maxPers: getID("maxPers").value
    }),
    headers: {'Content-type': 'application/json; charset=UTF-8', 'x-access-token': token}})
    .then(resp => {
        switch(resp.status){
            case 200: {
                resp.json().then(resp => {
                });
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

//Metodo per il patching di eventi Personali
var modificaPers = () => {
    
    fetch('../api/v1/EventiPersonali/'+id, {method: 'PATCH', body: JSON.stringify({
        nomeAtt: getID("nomeAtt").value,
        categoria: getID("categoria").value,
        indirizzo: getID("indirizzo").value,
        citta: getID("citta").value
    }),
    headers: {'Content-type': 'application/json; charset=UTF-8', 'x-access-token': token}})
    .then(resp => {
        switch(resp.status){
            case 200: {
                resp.json().then(resp => {
                });
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
    
    fetch('../api/v1/EventiPrivati/'+id, {method: 'PATCH', body: JSON.stringify({
        nomeAtt: getID("nomeAtt").value,
        categoria: getID("categoria").value,
        indirizzo: getID("indirizzo").value,
        citta: getID("citta").value
    }),
    headers: {'Content-type': 'application/json; charset=UTF-8', 'x-access-token': token}})
    .then(resp => {
        switch(resp.status){
            case 200: {
                resp.json().then(resp => {
                });
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
