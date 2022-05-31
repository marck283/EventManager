const idIscr = ''; //da sistemareeeeeeeeeeeeeeee


let url = window.location.href;
var idEvento = '';
var token = '';

if(localStorage.getItem('token') != null){

    token = localStorage.getItem('token');
}

try{
    url=url.split('=');
    idEvento=url[1];
}catch(error){
    console.log(error);
}

var disiscrPub = () => {
    
    fetch('../api/v1/EventiPubblici/'+idEvento+'/Iscrizioni/'+idIscr, {method: 'DELETE', headers: {'x-access-token': token}})
        .then(resp => {
            switch(resp.status){
                case 204: {
                    document.getElementById("message").textContent = 'Annullamento iscrizione effettuato con successo.';
                    break;
                }
                case 401:
                case 403:
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
                    document.getElementById("message").textContent = 'Annullamento iscrizione effettuato con successo.';
                    break;
                }
                case 401:
                case 403:
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
