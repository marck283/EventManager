const idIscr = '628fc32d8e12efe877108f4c';
const idEvento = '628fbe89d969d3e2bdc79f80';

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

var disiscrPub = () => {
    
    fetch('../api/v1/EventiPubblici/'+idEvento+'/Iscrizioni/'+idIscr, {method: 'DELETE', headers: {'x-access-token': token}})
        .then(resp => {
            switch(resp.status){
                case 204: {
                    resp.json().then(data => {document.getElementById("message").textContent = 'Annullamento iscrizione effettuato con successo.'});
                    break;
                }
                case 401:
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

}

var disiscrPriv = () => {
    
    fetch('../api/v1/EventiPrivati/'+idEvento+'/Iscrizioni/'+idIscr, {method: 'DELETE', headers: {'x-access-token': token}})
        .then(resp => {
            switch(resp.status){
                case 204: {
                    resp.json().then(data => {document.getElementById("message").textContent = 'Annullamento iscrizione effettuato con successo.'});
                    break;
                }
                case 401:
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

}
