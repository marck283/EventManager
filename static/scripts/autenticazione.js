//Aggiunto un listener di evento "keydown" sul tasto "Enter" della tastiera per permettere
//all'utente di autenticarsi anche senza premere il bottone "Login".
document.addEventListener("keydown", event => {
    if(event.code === "Enter") {
        login();
        console.log("Login started");
    }
});

var login = () => {
    fetch('../api/v2/authentications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: document.getElementById("loginEmail").value,
        password: CryptoJS.SHA3(document.getElementById("loginPassword").value, {outputLength: 512}).toString(),
        csrfToken: document.getElementById("csrfField").value }),
    })
    .then(resp => {
        switch(resp.status) {
            case 200: {
                resp.json().then(data => {
                    localStorage.setItem('token', data.token);
                    window.open("../publicCalendar.html", "_self", "noopener, noreferrer");
                });
                break;
            }
            case 400: {
                resp.json().then(data => alert(data.error));
                break;
            }
            case 403:
            case 404: {
                resp.json().then(data => alert(data.message));
                break;
            }
            default: {
                console.log("error");
            }
        }
        return;
    }).catch( error => console.error(error) ); // If there is any error you will catch them here
};




