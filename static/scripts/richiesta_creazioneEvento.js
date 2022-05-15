var request = () => {
    //reqObj.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    var reqObj = new XMLHttpRequest(), eventJSONList;
    reqObj.open("Post", "http://localhost:8080/api/v1/creazioneEvento/pubblico", true); //Invio una richiesta asincrona al server Node.js
    reqObj.setRequestHeader('Content-Type', 'application/json');
    //reqObj.responseType = "json";
    reqObj.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 201) {
            console.log("ricevuto")
            //Popola la pagina con i dati ricevuti
            eventJSONList = this.response; //Cattura la risposta in formato JSON
            locazione=this.getResponseHeader("Location")
            document.getElementById("loc").innerHTML = locazione
            
        }
    };

    
    reqObj.send(JSON.stringify({ "data": document.getElementById("date").value, "ora": document.getElementById("ora").value, "durata": document.getElementById("durata").value, "maxPers": document.getElementById("maxPers").value,"categoria": document.getElementById("categoria").value, "nomeAtt": document.getElementById("nomeAtt").value, "luogoEv": {"indirizzo": document.getElementById("indirizzo").value, "citta": document.getElementById("Citta").value}}))

};
