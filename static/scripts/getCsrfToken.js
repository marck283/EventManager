//Chiamo l'endpoint per ottenere il token anti-CSRF.
var getCsrfToken = () => {
    fetch('../api/v2/CsrfToken')
    .then(resp => {
        try {
            if(resp.status === 200) {
                resp.json().then(data => document.getElementById("csrfField").value = data.csrfToken);
            } else {
                resp.json().then(data => console.log(data.error));
            }
        } catch(err) {
            console.log(err);
        }
    })
    .catch(err => console.log(err));
}