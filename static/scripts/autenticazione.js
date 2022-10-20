//Aggiunto un listener di evento "keydown" sul tasto "Enter" della tastiera per permettere
//all'utente di autenticarsi anche senza premere il bottone "Login".
document.addEventListener("keydown", event => {
    if(event.code === "Enter") {
        login();
        console.log("Login started");
    }
});

window.fbAsyncInit = function() {
    FB.init({
        appId: '1143189906271722',
        cookie: true,
        xfbml: true,
        version: 'v15.0'
    });
      
    FB.AppEvents.logPageView(); 
};

(function(d, s, id) {
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {
        return;
    }
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
} (document, 'script', 'facebook-jssdk'));

var fbLogin = () => {
    FB.getLoginStatus(function(response) {
        switch(response.status) {
            case "connected": {
                window.open("../publicCalendar.html", "_self", "noopener, noreferrer");
                break;
            }
            case "not_authorized": {
                //Qualcosa
                break;
            }
            case "unknown": {
                FB.login();
            }
        }
    });
};

var login = (gresponse = null) => {
    if(gresponse != null) {
        //Set the token as the Google OAuth2 token. Now the problem shifts to decrypting the token whenever we need to by using the
        //tokenChecker module.
        localStorage.setItem('token', gresponse);
    }
    fetch('../api/v2/authentications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: document.getElementById("loginEmail").value,
            password: CryptoJS.SHA3(document.getElementById("loginPassword").value, {outputLength: 512}).toString(),
            csrfToken: document.getElementById("csrfField").value,
            googleJwt: gresponse
        })
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
