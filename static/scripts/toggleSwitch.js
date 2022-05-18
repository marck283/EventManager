var request = () => {
    try {
        fetch("/api/v1/EventiPubblici")
        .then(resp => resp.json())
        .then(resp => manipulateDom(resp));
    } catch (error) {
        console.log(error);
    }
};

var showIfChecked = () => {
    if (document.getElementById("buttonSwitch").checked) {
        document.getElementById("calendarWrapper").style.display = "block";
        document.getElementById("divCal").style.display = "block";
        document.getElementById("eventLists").style.display = "none";
        document.getElementById("eventLists").innerHTML = "";
    } else {
        request();
        document.getElementById("calendarWrapper").style.display = "none";
        document.getElementById("divCal").style.display = "none";
        document.getElementById("myPopup1").style.display = "none";
        document.getElementById("eventLists").style.display = "block";
    }
};

var manipulateDom = (response, id = "eventLists") => {
    var category = response[0].category, firstIteration = true;
    for (var f of response) {
        if (category !== f.category || firstIteration) {
            firstIteration = false;
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
                row.classList ="row row-cols-4";
            } else {
                row.className = "row";
            }
            row.setAttribute("id", category);
            li.appendChild(row);
            var jr1 = response.filter(item => item.category === category);

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
                objectId.href = object.id;
                objectId.classList = "btn btn-primary";
                objectId.setAttribute("name", "cardButton");
                objectId.textContent = "Maggiori informazioni...";
                card.appendChild(objectId);
            }
        }
    }
};