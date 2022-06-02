var getId = id => document.getElementById(id);

var request = (passato, idElem, listType, nomeAtt = "", categoria = "", durata = "", indirizzo = "", citta = "") => {  
    var api = "";
    if(listType === "pers") {
        api = "/api/v2/eventiCalendarioPersonale/?passato=" + passato;
    } else {
        api = "/api/v2/eventiCalendarioPubblico/";
    }
    fetch(api, {
        method: 'GET',
        headers: {
            'x-access-token': token,
            'nomeAtt': nomeAtt,
            'categoria': categoria,
            'durata': durata,
            'indirizzo': indirizzo,
            'citta': citta
        }
    })
    .then(resp => {
        switch(resp.status) {
            case 200: {
                resp.json().then(resp => manipulateDom(listType, resp, idElem));
                break;
            }

            case 401: {
                resp.json().then(resp => getId(idElem).textContent = resp.message);
                break;
            }

            case 400:
            case 404: {
                resp.json().then(resp => getId(idElem).textContent = resp.error);
                break;
            }

            default: {
                console.log(resp.status);
            }
        }
    }).catch(error => console.log(error));
};

var showIfChecked = pageType => {
    if (getId("buttonSwitch").checked) {
        getId("calendarWrapper").style.display = "block";
        getId("divCal").style.display = "block";
        getId("eventLists").style.display = "none";
        getId("eventLists").innerHTML = "";
        getId("filtroEventi").style.display = "none";
        getId("nomeAtt").value = "";
        getId("categoria").value = "";
        getId("durata").value = "";
        getId("indirizzo").value = "";
        getId("citta").value = "";

        request("False", "elencoEventi", pageType);

        //Se la chiamata a questa funzione proviene dalla pagina dell'elenco personale di eventi, allora mostro lo storico degli eventi.
        if(pageType == "pers") {
            request("True", "storicoEventi", pageType);
            getId("storicoEventiContainer").style.display = "block";
            getId("storicoEventi").style.display = "block";
        }
    } else {
        request("False", "eventLists", pageType);
        getId("calendarWrapper").style.display = "none";
        getId("divCal").style.display = "none";
        getId("myPopup1").style.display = "none";
        getId("eventLists").style.display = "block";
        getId("filtroEventi").style.display = "block";

        //Se la chiamata a questa funzione proviene dalla pagina dell'elenco personale di eventi, allora nascondo lo storico degli eventi.
        if(pageType == "pers") {
            getId("storicoEventiContainer").style.display = "none";
            getId("storicoEventi").style.display = "none";
            getId("storicoEventi").innerHTML = "";
        }
    }
};

var manipulateDom = (listType, response, id = "eventLists") => {
    var categories = [];
    getId(id).innerHTML = "";
    for (var f of response.eventi) {
        if (categories.find(e => e === f.category) == undefined) {
            categories.push(f.category);
            category = f.category;
            var h3 = document.createElement("h3");
            h3.textContent = category;
            getId(id).appendChild(h3);

            var ul = document.createElement("ul");
            ul.classList = "list-group list-group-flush";
            getId(id).appendChild(ul);

            var li = document.createElement("li");
            li.className = "list-group-item";
            ul.appendChild(li);

            var row = document.createElement("div");
            if(id === "eventLists") {
                row.classList ="row row-cols-4";
            } else {
                row.className = "row";
            }
            row.setAttribute("id", category);
            li.appendChild(row);
            var jr1 = response.eventi.filter(item => item.category === category);

            //Itero sulla risposta JSON filtrata per categoria, ottenendo i valori dei campi desiderati
            for (var object of jr1) {
                var col = document.createElement("div");
                col.className = "col";
                row.appendChild(col);

                var card = document.createElement("div");
                card.className = "card";
                col.appendChild(card);

                var cardTitle = document.createElement("h5");
                cardTitle.className = "card-title";
                cardTitle.textContent = object.name;
                card.appendChild(cardTitle);

                var objectId = document.createElement("a");
                if(listType === "pers") {
                    if (object.id == "pers") {
                        objectId.href = "layoutPersonale.html";
                    } else {
                        if (object.id == "pub") {
                            objectId.href = "layoutPubblico.html";
                        } else {
                            objectId.href = "layoutPrivato.html";
                        }
                    }
                } else {
                    objectId.href = "layoutPubblico.html";
                }
                objectId.href += "?id=" + object.idevent;
                objectId.classList = "btn btn-primary";
                objectId.setAttribute("name", "cardButton");
                objectId.textContent = "Maggiori informazioni...";
                card.appendChild(objectId);
            }
        }
    }
};