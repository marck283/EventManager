var checkDateArr = (dateArr, temp_poz, d, str1, str2) => {
    if (dateArr.includes(temp_poz)) {
        if (Number(str1) < d.getHours() || (Number(str1) == d.getHours() && Number(str2) < d.getMinutes())) {
            document.getElementById("vuotoO").textContent = "Inserisci orario corretto";
            return true;
        } else {
            document.getElementById("vuotoO").textContent = "";
        }
    }
    return false;
};

var checkSendCondition = (condition, fieldName, errorText) => {
    if (condition) {
        document.getElementById(fieldName).textContent = errorText;
        return false;
    } else {
        document.getElementById(fieldName).textContent = "";
    }
    return true;
}

var requestPu = () => { //funzione che mi permette di fare i vari controlli delle info per creare un certo evento pubblico date 
    //in input nella pagina e poi mi permette di fare un richiesta al server. La risposta la gestisco stampandomi il percorso per quella risorsa
    var inviare = checkSendCondition(ElencoDate == "", "vuotoDa", "Inserire una data");
    if (inviare) {
        if (document.getElementById("ora").value == "") {
            document.getElementById("vuotoO").textContent = "Inserire un orario nel formato ore:minuti";
            inviare = false;
        } else {
            var reg = /^(((0|1)[0-9])|2[0-3]):[0-5][0-9]$/;
            if (reg.test(document.getElementById("ora").value)) {
                var str = document.getElementById("ora").value.split(":"), str1 = str[0], str2 = str[1];
                var d = new Date();

                if (ElencoDate != "") {
                    var mm = d.getMonth() + 1;
                    var dd = d.getDate();
                    var yy = d.getFullYear();

                    var giorno = String(dd).padStart(2, '0'), mese = String(mm).padStart(2, '0'), anno = "" + yy;

                    var temp_poz = mese + '/' + giorno + '/' + anno;

                    (checkDateArr(ElencoDate, temp_poz, d, str1, str2)) ? inviare = false : inviare = true;
                }
            } else {
                document.getElementById("vuotoO").textContent = "Inserire un orario nel formato ore:minuti";
                inviare = false;
            }
        }
    }

    inviare = checkSendCondition(document.getElementById("nomeAtt").value == "", "vuotoN", "Inserire nome attivit&agrave;") ||
        checkSendCondition(document.getElementById("indirizzo").value == "", "vuotoI", "Inserire indirizzo") ||
        checkSendCondition(document.getElementById("Citta").value == "", "vuotoCi", "Inserire citt&agrave;") ||
        checkSendCondition(document.getElementById("durata").value == "" || Number.isNaN(parseInt(document.getElementById("durata").value)) || Number(document.getElementById("durata").value) <= 0, "vuotoDu", "Inserire durata corretta") ||
        checkSendCondition(document.getElementById("maxPers").value == "" || Number.isNaN(parseInt(document.getElementById("maxPers").value)) || Number(document.getElementById("maxPers").value) < 2, "vuotoM", "Inserire numero massimo persone corretto");

    if (inviare) {
        var Token = token, eventJSONList;
        fetch("/api/v2/EventiPubblici", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': Token
            },
            body: JSON.stringify({
                data: ElencoDate,
                ora: document.getElementById("ora").value,
                durata: Number(document.getElementById("durata").value),
                maxPers: Number(document.getElementById("maxPers").value),
                categoria: document.getElementById("categoria").value,
                nomeAtt: document.getElementById("nomeAtt").value,
                luogoEv: {
                    indirizzo: document.getElementById("indirizzo").value,
                    citta: document.getElementById("Citta").value
                }
            })
        })
            .then(resp => {
                switch (resp.status) {
                    case 201: {
                        eventJSONList = resp;
                        locazione = resp.headers.get("Location");
                        alert("Evento pubblico creato con successo.");
                        break;
                    }
                    case 500: {
                        resp.json().then(data => {
                            eventJSONList = data;
                            locazione = resp.headers.get("Location");
                            alert(eventJSONList.error);
                        });
                        break;
                    }
                    case 404:
                    case 403:
                    case 400: {
                        //Popola la pagina con i dati ricevuti
                        resp.json().then(data => {
                            eventJSONList = data;
                            alert(eventJSONList.error);
                        }); //Cattura la risposta in formato JSON
                        break;
                    }
                    case 401: {
                        //Popola la pagina con i dati ricevuti
                        resp.json().then(data => {
                            eventJSONList = data;
                            alert(eventJSONList.message);
                        }); //Cattura la risposta in formato JSON
                        break;
                    }
                }
            });
    }
};

//funzione che mi permette di fare i vari controlli delle info per creare un certo evento personale date 
//in input nella pagina e poi mi permette di fare un richiesta al server. La risposta la gestisco stampandomi il percorso per quella risorsa

var requestPe = () => {
    //reqObj.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    var inviare = checkSendCondition(ElencoDate == "", "vuotoDa", "Inserire una data");
    if (document.getElementById("ora").value == "") {
        document.getElementById("vuotoO").textContent = "inserire Ora";
        inviare = false;
    } else {
        var reg = /^(((0|1)[0-9])|2[0-3]):[0-5][0-9]$/;
        if (reg.test(document.getElementById("ora").value)) {
            strin = document.getElementById("ora").value.split(":");
            str1 = strin[0];
            str2 = strin[1];
            var d = new Date();

            if (ElencoDate != "") {
                var mm = d.getMonth() + 1;
                var dd = d.getDate();
                var yy = d.getFullYear();

                var giorno = String(dd).padStart(2, '0'), mese = String(mm).padStart(2, '0'), anno = "" + yy;

                var temp_poz = mese + '/' + giorno + '/' + anno;

                (checkDateArr(ElencoDate, temp_poz, d, str1, str2)) ? inviare = false : inviare = true;
            }
        } else {
            document.getElementById("vuotoO").textContent = "formato ora: hh:mm";
            inviare = false;
        }
    }
    if (document.getElementById("nomeAtt").value == "") {
        document.getElementById("vuotoN").textContent = "inserire nome attività";
        inviare = false;
    } else {
        document.getElementById("vuotoN").textContent = "";
    }
    if (document.getElementById("indirizzo").value == "") {
        document.getElementById("vuotoI").textContent = "inserire indirizzo";
        inviare = false;
    } else {
        document.getElementById("vuotoI").textContent = "";
    }
    if (document.getElementById("Citta").value == "") {
        document.getElementById("vuotoCi").textContent = "inserire città";
        inviare = false;
    } else {
        document.getElementById("vuotoCi").textContent = "";
    }
    if (document.getElementById("durata").value == "" || Number.isNaN(parseInt(document.getElementById("durata").value)) || Number(document.getElementById("durata").value) <= 0) {
        document.getElementById("vuotoDu").textContent = "inserire durata corretta";
        inviare = false;
    } else {
        document.getElementById("vuotoDu").textContent = "";
    }
    if (inviare) {
        var Token = token, eventJSONList;
        fetch('/api/v2/EventiPersonali', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': Token
            },
            body: JSON.stringify({
                data: ElencoDate,
                ora: document.getElementById("ora").value,
                durata: Number(document.getElementById("durata").value),
                categoria: document.getElementById("categoria").value,
                nomeAtt: document.getElementById("nomeAtt").value,
                luogoEv: {
                    indirizzo: document.getElementById("indirizzo").value,
                    citta: document.getElementById("Citta").value
                }
            })
        })
            .then(resp => {
                switch (resp.status) {
                    case 201: {
                        eventJSONList = resp;
                        locazione = resp.headers.get("Location");
                        alert("Evento personale creato con successo.");
                        break;
                    }
                    case 500: {
                        resp.json().then(data => {
                            eventJSONList = data;
                            locazione = resp.headers.get("Location");
                            alert(eventJSONList.error);
                        });
                        break;
                    }
                    case 404:
                    case 403:
                    case 400: {
                        resp.json().then(data => {
                            eventJSONList = data;
                            alert(eventJSONList.error);
                        });
                        break;
                    }
                    case 401: {
                        resp.json().then(data => {
                            eventJSONList = data;
                            alert(eventJSONList.message);
                        });
                        break;
                    }
                }
            });
    }
};

var requestPr = () => {
    //reqObj.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    var inviare = checkSendCondition(guest.length == 0, "vuotoIn", "Inserire invitato");

    //Non si potrebbe andare avanti a semplificare come sopra?
    if (ElencoDate == "") {
        document.getElementById("vuotoDa").textContent = "Inserire una data";
        inviare = false;
    } else {
        document.getElementById("vuotoDa").textContent = "";
    }
    if (document.getElementById("ora").value == "") {

        document.getElementById("vuotoO").textContent = "inserire Ora";
        inviare = false;
    } else {
        var reg = /^(((0|1)[0-9])|2[0-3]):[0-5][0-9]$/;
        if (reg.test(document.getElementById("ora").value)) {
            strin = document.getElementById("ora").value.split(":");
            str1 = strin[0];
            str2 = strin[1];
            var d = new Date();

            if (ElencoDate != "") {
                var mm = d.getMonth() + 1
                var dd = d.getDate()
                var yy = d.getFullYear()

                var giorno = String(dd).padStart(2, '0'), mese = String(mm).padStart(2, '0'), anno = yy;

                var temp_poz = mese + '/' + giorno + '/' + anno;

                (checkDateArr(ElencoDate, temp_poz, d, str1, str2)) ? inviare = false : inviare = true;
            }
        } else {
            document.getElementById("vuotoO").textContent = "formato ora: hh:mm";
            inviare = false;
        }
    }
    if (document.getElementById("nomeAtt").value == "") {
        document.getElementById("vuotoN").textContent = "inserire nome attività";
        inviare = false;
    } else {
        document.getElementById("vuotoN").textContent = "";
    }
    if (document.getElementById("indirizzo").value == "") {
        document.getElementById("vuotoI").textContent = "inserire indirizzo";
        inviare = false;
    } else {
        document.getElementById("vuotoI").textContent = "";
    }
    if (document.getElementById("Citta").value == "") {
        document.getElementById("vuotoCi").textContent = "inserire città";
        inviare = false;
    } else {
        document.getElementById("vuotoCi").textContent = "";
    }
    if (document.getElementById("durata").value == "" || Number.isNaN(parseInt(document.getElementById("durata").value)) || Number(document.getElementById("durata").value) <= 0) {
        document.getElementById("vuotoDu").textContent = "inserire durata corretta";
        inviare = false;
    } else {
        document.getElementById("vuotoDu").textContent = "";
    }
    if (inviare) {
        //riscrivere richiesta utilizzando la Fetch API
        var Token = token, eventJSONList;
        fetch('/api/v2/EventiPrivati', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': Token
            },
            body: JSON.stringify({
                data: ElencoDate,
                ora: document.getElementById("ora").value,
                durata: Number(document.getElementById("durata").value),
                categoria: document.getElementById("categoria").value,
                nomeAtt: document.getElementById("nomeAtt").value,
                luogoEv: {
                    indirizzo: document.getElementById("indirizzo").value,
                    citta: document.getElementById("Citta").value
                },
                ElencoEmailInviti: guest
            })
        })
        .then(resp => {
            switch(resp.status) {
                case 201: {
                    eventJSONList = resp;
                    locazione = resp.headers.get("Location");
                    alert("Evento privato creato con successo.");
                    break;
                }
                case 500: {
                    resp.json().then(data => {
                        eventJSONList = data;
                        locazione = resp.headers.get("Location");
                        alert(eventJSONList.error);
                    });
                    break;
                }
                case 404:
                case 403:
                case 400: {
                    resp.json().then(data => {
                        eventJSONList = data;
                        alert(eventJSONList.error);
                    });
                    break;
                }
                case 401: {
                    resp.json().then(data => {
                        eventJSONList = data;
                        locazione = resp.headers.get("Location");
                        alert(eventJSONList.message);
                    });
                }
            }
        })
        .catch(err => console.log(err));
    }
};
