var send = () => {
    console.log(document.getElementById("email").value);
    fetch('../api/v2/RecuperoPassword', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: document.getElementById("email").value
        })
    })
    .then(resp => {
        switch(resp.status) {
            case 201: {
                resp.json().then(data => alert(data.message));
                break;
            }
            case 500: {
                resp.json().then(data => alert(data.error));
                break;
            }
        }
    })
    .catch(error => console.log(error));
};