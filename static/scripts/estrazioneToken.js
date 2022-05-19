let url = window.location.href;
var token = "6284b7742a0699866a636979"; //Valore di esempio (da cambiare in stringa vuota quando verrà aggiunto il supporto
//per il modulo di autenticazione)
try {
    url=url.split('?');
/* if(url[1] != undefined) { */ //Commento da togliere quando verrà aggiunto il supporto per il modulo di autenticazione
    url=url[1].split('=');
    token = url[1];
/* } */
} catch(error) {
    console.log(error);
}
