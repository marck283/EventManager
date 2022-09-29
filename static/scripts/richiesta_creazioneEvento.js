var checkDateArr = (dateArr, temp_poz, d, str1, str2) => {
    if (dateArr.includes(temp_poz) && (Number(str1) < d.getHours() || (Number(str1) == d.getHours() && Number(str2) < d.getMinutes()))) {
        alert("Inserisci orario corretto.");
        return true;
    }
    return false;
};

var checkSendCondition = (condition, errorText) => {
    if (condition) {
        alert(errorText);
        return false;
    }
    return true;
}

var getFileExtension = fileName => {
    var ext = fileName.split('.').pop();
    return (ext == fileName) ? "" : ext;
}

var checkFormatCompatibility = format => {
    var formatSpecIndex = 0;
    switch (format) {
        case "jpg": {
            formatSpecIndex = 23;
            break;
        }
        default: {
            alert("Formato file non supportato.");
            break;
        }
    }
    return formatSpecIndex;
}

var requestPu = () => { //funzione che mi permette di fare i vari controlli delle info per creare un certo evento pubblico date 
    //in input nella pagina e poi mi permette di fare un richiesta al server. La risposta la gestisco stampandomi il percorso per quella risorsa
    var inviare = checkSendCondition(dateEv.length === 0, "Inserire una data"), reg = /^(((0|1)[0-9])|2[0-3]):[0-5][0-9]$/;
    if (inviare) {
        if (getId("ora").value == "" || !reg.test(getId("ora").value)) {
            alert("Inserire un orario nel formato ore:minuti");
            inviare = false;
        } else {
            var str = getId("ora").value.split(":"), d = new Date();

            if (dateEv.length === 0) {
                var mm = d.getMonth() + 1, dd = d.getDate(), yy = d.getFullYear();
                console.log(dd);
                var temp_poz = String(mm).padStart(2, '0') + '-' + String(dd).padStart(2, '0') + '-' + yy;

                (checkDateArr(dateEv, temp_poz, d, str[0], str[1])) ? inviare = false : inviare = true;
            }
        }
    }

    inviare = checkSendCondition(getId("nomeAtt").value == "", "Inserire nome attivit&agrave;") ||
        checkSendCondition(getId("indirizzo").value == "", "Inserire indirizzo") ||
        checkSendCondition(getId("Citta").value == "", "Inserire citt&agrave;") ||
        checkSendCondition(getId("durata").value == "" || Number.isNaN(parseInt(getId("durata").value)) || Number(getId("durata").value) <= 0, "Inserire durata corretta") ||
        checkSendCondition(getId("maxPers").value == "" || Number.isNaN(parseInt(getId("maxPers").value)) || Number(getId("maxPers").value) < 2, "Inserire numero massimo persone corretto");

    var file = new FileReader(), realFile = document.querySelector("input[type=file]").files[0],
        format = getFileExtension(realFile.name);
    file.onloadend = () => {
        if (format != 0 && inviare) {
            var eventJSONList, formatSpecIndex = checkFormatCompatibility(format);
            console.log(getId("ora").value);
            fetch("/api/v2/EventiPubblici", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token
                },
                body: JSON.stringify({
                    data: dateEv,
                    ora: getId("ora").value,
                    durata: Number(getId("durata").value),
                    maxPers: Number(getId("maxPers").value),
                    categoria: getId("categoria").value,
                    nomeAtt: getId("nomeAtt").value,
                    luogoEv: {
                        indirizzo: getId("indirizzo").value,
                        citta: getId("Citta").value
                    },
                    eventPic: file.result.substring(formatSpecIndex)
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
    }
    if (realFile) {
        file.readAsDataURL(realFile);
    }
};

//funzione che mi permette di fare i vari controlli delle info per creare un certo evento personale date 
//in input nella pagina e poi mi permette di fare un richiesta al server. La risposta la gestisco stampandomi il percorso per quella risorsa

var requestPe = () => {
    //reqObj.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    var inviare = checkSendCondition(dateEv.length === 0, "vuotoDa", "Inserire una data");
    if (getId("ora").value == "") {
        getId("vuotoO").textContent = "inserire Ora";
        inviare = false;
    } else {
        var reg = /^(((0|1)[0-9])|2[0-3]):[0-5][0-9]$/;
        if (reg.test(getId("ora").value)) {
            strin = getId("ora").value.split(":");
            str1 = strin[0];
            str2 = strin[1];
            var d = new Date();

            if (dateEv.length === 0) {
                var mm = d.getMonth() + 1;
                var dd = d.getDate();
                var yy = d.getFullYear();

                var giorno = String(dd).padStart(2, '0'), mese = String(mm).padStart(2, '0'), anno = "" + yy;

                var temp_poz = mese + '-' + giorno + '-' + anno;

                (checkDateArr(dateEv, temp_poz, d, str1, str2)) ? inviare = false : inviare = true;
            }
        } else {
            getId("vuotoO").textContent = "formato ora: hh:mm";
            inviare = false;
        }
    }
    if (getId("nomeAtt").value == "") {
        getId("vuotoN").textContent = "inserire nome attività";
        inviare = false;
    } else {
        getId("vuotoN").textContent = "";
    }
    if (getId("indirizzo").value == "") {
        getId("vuotoI").textContent = "inserire indirizzo";
        inviare = false;
    } else {
        getId("vuotoI").textContent = "";
    }
    if (getId("Citta").value == "") {
        getId("vuotoCi").textContent = "inserire città";
        inviare = false;
    } else {
        getId("vuotoCi").textContent = "";
    }
    if (getId("durata").value == "" || Number.isNaN(parseInt(getId("durata").value)) || Number(getId("durata").value) <= 0) {
        getId("vuotoDu").textContent = "inserire durata corretta";
        inviare = false;
    } else {
        getId("vuotoDu").textContent = "";
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
                data: dateEv,
                ora: getId("ora").value,
                durata: Number(getId("durata").value),
                categoria: getId("categoria").value,
                nomeAtt: getId("nomeAtt").value,
                luogoEv: {
                    indirizzo: getId("indirizzo").value,
                    citta: getId("Citta").value
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
    if (dateEv.length === 0) {
        getId("vuotoDa").textContent = "Inserire una data";
        inviare = false;
    } else {
        getId("vuotoDa").textContent = "";
    }
    if (getId("ora").value == "") {

        getId("vuotoO").textContent = "inserire Ora";
        inviare = false;
    } else {
        var reg = /^(((0|1)[0-9])|2[0-3]):[0-5][0-9]$/;
        if (reg.test(getId("ora").value)) {
            strin = getId("ora").value.split(":");
            str1 = strin[0];
            str2 = strin[1];
            var d = new Date();

            if (dateEv.length === 0) {
                var mm = d.getMonth() + 1
                var dd = d.getDate()
                var yy = d.getFullYear()

                var giorno = String(dd).padStart(2, '0'), mese = String(mm).padStart(2, '0'), anno = yy;

                var temp_poz = mese + '-' + giorno + '-' + anno;

                (checkDateArr(dateEv, temp_poz, d, str1, str2)) ? inviare = false : inviare = true;
            }
        } else {
            getId("vuotoO").textContent = "formato ora: hh:mm";
            inviare = false;
        }
    }
    if (getId("nomeAtt").value == "") {
        getId("vuotoN").textContent = "inserire nome attività";
        inviare = false;
    } else {
        getId("vuotoN").textContent = "";
    }
    if (getId("indirizzo").value == "") {
        getId("vuotoI").textContent = "inserire indirizzo";
        inviare = false;
    } else {
        getId("vuotoI").textContent = "";
    }
    if (getId("Citta").value == "") {
        getId("vuotoCi").textContent = "inserire città";
        inviare = false;
    } else {
        getId("vuotoCi").textContent = "";
    }
    if (getId("durata").value == "" || Number.isNaN(parseInt(getId("durata").value)) || Number(getId("durata").value) <= 0) {
        getId("vuotoDu").textContent = "inserire durata corretta";
        inviare = false;
    } else {
        getId("vuotoDu").textContent = "";
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
                data: dateEv,
                ora: getId("ora").value,
                durata: Number(getId("durata").value),
                categoria: getId("categoria").value,
                nomeAtt: getId("nomeAtt").value,
                luogoEv: {
                    indirizzo: getId("indirizzo").value,
                    citta: getId("Citta").value
                },
                ElencoEmailInviti: guest
            })
        })
            .then(resp => {
                switch (resp.status) {
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
