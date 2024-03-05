var recensisci = () => {
    var url = window.location.href, eventId = url.split("=")[1];
    var eval = document.getElementById("evaluation").value;
    var description = document.getElementById("description").value;
    var token = localStorage.getItem("token");

    //Ora invio la recensione con l'id dell'evento e il token
    fetch("../api/v2/Recensioni/" + eventId, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
        },
        body: JSON.stringify({
            idEvento: eventId,
            evaluation: eval,
            description: description
        })
    })
    .then(resp => {
        //Handle the response
        switch(resp.status) {
            case 201:
            case 401: {
                resp.json().then(data => alert(data.message));
                break;
            }
            case 400:
            case 500: {
                resp.json().then(data => alert(data.error));
                break;
            }
            default: {
                //This should never happen
                console.log(resp.status);
                break;
            }
        }
    })
}