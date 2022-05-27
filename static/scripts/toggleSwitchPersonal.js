var request = (passato, idElem) => {    
    fetch("/api/v1/eventiCalendarioPersonale/?passato=" + passato, {
        method: 'GET',
        headers: {
            'x-access-token': token
        }
    })
    .then(resp => {
        switch(resp.status) {
            case 200: {
                resp.json().then(resp => manipulateDom(resp, idElem));
                break;
            }

            case 401: {
                resp.json().then(resp => document.getElementById("eventLists").textContent = resp.message);
                break;
            }

            case 404: {
                resp.json().then(resp => document.getElementById("eventLists").textContent = resp.error);
                break;
            }

            default: {
                console.log(resp.status);
            }
        }
    }).catch(error => console.log(error));
};

var getId = id => document.getElementById(id);

var showIfChecked = () => {
    if (getId("buttonSwitch").checked) {
        request("True", "storicoEventi");
        getId("calendarWrapper").style.display = "block";
        getId("divCal").style.display = "block";
        getId("eventLists").style.display = "none";
        getId("eventLists").innerHTML = "";
        getId("storicoEventiContainer").style.display = "block";
        getId("storicoEventi").style.display = "block";
    } else {
        request("False", "eventLists");
        getId("calendarWrapper").style.display = "none";
        getId("divCal").style.display = "none";
        getId("myPopup1").style.display = "none";
        getId("eventLists").style.display = "block";
        getId("storicoEventiContainer").style.display = "none";
        getId("storicoEventi").style.display = "none";
        getId("storicoEventi").innerHTML = "";
    }
};

var manipulateDom = (response, id = "eventLists") => {
    var categories = [];
    for (var f of response.eventi) {
        if (categories.find(e => e === f.category) == undefined) {
            categories.push(f.category);
            category = f.category;
            var h3 = document.createElement("h3");
            h3.textContent = category;
            document.getElementById(id).appendChild(h3);

            var ul = document.createElement("ul");
            ul.classList = "list-group list-group-flush";
            document.getElementById(id).appendChild(ul);

            var li = document.createElement("li");
            li.className = "list-group-item";
            ul.appendChild(li);

            var row = document.createElement("div");
            if(id === "eventLists") {
                row.classList ="row row-cols-3";
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
                if(object.id == "pers") {
                    objectId.href = "layoutPersonale.html?id="+object.idevent+"&token="+token;
                }
                if(object.id == "pub") {
                    objectId.href = "layoutPubblico.html?id="+object.idevent+"&token="+token;
                }
                objectId.classList = "btn btn-primary";
                objectId.setAttribute("name", "cardButton");
                objectId.textContent = "Maggiori informazioni...";
                card.appendChild(objectId);
            }
        }
    }
};