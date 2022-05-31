

var disiscrPub = (idEvento,idIscr) => {
    
    fetch('../api/v1/EventiPubblici/'+idEvento+'/Iscrizioni/'+idIscr, {method: 'DELETE', headers: {'x-access-token': token}})
        .then(resp => {
            switch(resp.status){
                case 204: {
                    alert('Annullamento iscrizione effettuato con successo.');
                    break;
                }
                case 401: {
                    resp.json().then(data => {alert(data.message)});
                    break;
                }
                case 403:
                case 404:
                case 500: {
                    resp.json().then(data => {alert(data.error)});
                    break;
                }
                default: {
                    console.log(resp.status);
                }
            }
        })
        .catch( error => console.error(error) );

}

var disiscrPriv = (idEvento,idIscr) => {
    
    fetch('../api/v1/EventiPrivati/'+idEvento+'/Iscrizioni/'+idIscr, {method: 'DELETE', headers: {'x-access-token': token}})
        .then(resp => {
            switch(resp.status){
                case 204: {
                    alert('Annullamento iscrizione effettuato con successo.');
                    break;
                }
                case 401:{
                    resp.json().then(data => {alert(data.message)});
                    break;
                }
                case 403:
                case 404:
                case 500: {
                    resp.json().then(data => {alert(data.error)});
                    break;
                }
                default: {
                    console.log(resp.status);
                }
            }
        })
        .catch( error => console.error(error) );

}
