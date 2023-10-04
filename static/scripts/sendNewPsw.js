var clearAll = () => {
    document.getElementById('email').value = "";
    document.getElementById('password').value = "";
    document.getElementById('pswConfirm').value = "";
}

var fetchAndUpdate = (userEmail, newPsw) => {
    fetch('../api/v2/Utenti', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: userEmail,
            psw: newPsw
        })
    })
    .then(resp => {
        switch(resp.status) {
            case 200: {
                resp.json().then(data => alert(data.message));
                break;
            }
            case 400:
            case 404:
            case 500:
            default:{
                resp.json().then(data => alert(data.error));
                break;
            }
        }
    })
    .catch(error => console.log(error));
};

var send = () => {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var pswC = document.getElementById('pswConfirm').value;

    //Fetch user, check password inequality and return true or false
    if(password !== pswC) {
        console.log("Password non corrispondenti.");
        return false;
    }

    var newPsw = CryptoJS.SHA3(document.getElementById('password').value, {outputLength: 512}).toString();
    fetch('../api/v2/Utenti?email=' + email)
    .then(resp => {
        switch(resp.status) {
            case 200: {
                fetchAndUpdate(email, newPsw);
                break;
            }
            case 404: {
                resp.json().then(data => alert(data.error));
                break;
            }
        }
    });

    return;
};