var request = () => {
    var reqObj = new XMLHttpRequest(), eventJSONList;
    reqObj.responseType = "json";
    reqObj.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            console.log("Data received.");
            //Popola la pagina con i dati ricevuti
            eventJSONList = this.response; //Cattura la risposta in formato JSON
            for (var f in eventJSONList) {
                document.getElementById("eventLists").innerHTML += "<h3>" + f["category"] + "</h3><ul class=\"list-group list-group-flush\"><li class=\"list-group-item\">";
                for(var item of f["events"]) {
                    document.getElementById("eventLists").innerHTML += "<div class=\"col\"><div class=\"card\">\
                    <img src=\"" + item["imgPath"] + "\" alt=\"immagine evento 1\" class=\"card-img-top\" />\
                    <div class=\"card-body\"><h5 class=\"card-title\">" + item["name"] + "</h5>\
                    <p class=\"card-body\">" + item["description"] + "</p>\
                    <a href=\"#\" class=\"btn btn-primary\" name=\"cardButton\">Maggiori informazioni...</a></div></div></div>";
                }
                document.getElementById("eventLists").innerHTML += "</ul>";
            }
        }
    };

    reqObj.open("GET", "http://localhost:3000/api/v1/events", true);
    reqObj.send();
};