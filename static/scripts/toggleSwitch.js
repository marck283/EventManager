var request = () => {
    var reqObj = new XMLHttpRequest(), eventJSONList;
    reqObj.responseType = "json";
    reqObj.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            //Popola la pagina con i dati ricevuti
            eventJSONList = this.response; //Cattura la risposta in formato JSON
            for (var f of eventJSONList.listForCategory) {
                document.getElementById("eventLists").innerHTML += "<h3>" + f.category + "</h3>\
                <ul class=\"list-group list-group-flush\"><li class=\"list-group-item\"><div class=\"row row-cols-4\"\
                id=\"" + f.category + "\">";
                for (var item of f.events) {
                    document.getElementById(f.category).innerHTML += "<div class=\"col\"><div class=\"card\">\
                    <h5 class=\"card-title\">" + item.name + "</h5>\
                    <p class=\"card-body\">" + item.description + "</p>\
                    <a href=\"#\" class=\"btn btn-primary\" name=\"cardButton\">Maggiori informazioni...</a></div></div>";
                }
                document.getElementById("eventLists").innerHTML += "</div></li></ul>";
            }
        }
    };

    reqObj.open("GET", "/api/v1/events", true); //Invio una richiesta asincrona al server Node.js
    reqObj.send();
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
        document.getElementById("eventLists").style.display = "block";
    }
};