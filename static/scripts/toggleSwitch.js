var request = async () => {
    try {
        const response = await fetch("/api/v1/listaEventiPublic");
        if (response.ok) {
            var jsonResponse = await response.json();
            var category = jsonResponse[0].category, firstIteration = true;
            for (var f of jsonResponse) {
                if (category !== f.category || firstIteration) {
                    category = f.category;
                    document.getElementById("eventLists").innerHTML += "<h3>" + category + "</h3>\
                    <ul class=\"list-group list-group-flush\"><li class=\"list-group-item\"><div class=\"row row-cols-4\"\
                    id=\"" + category + "\">";
                }
                var jr1 = jsonResponse.filter(item => item.category === category);

                //Itero sulla risposta JSON filtrata per categoria, ottenendo i valori dei campi desiderati
                for (var object of jr1) {
                    document.getElementById(category).innerHTML += "<div class=\"col\"><div class=\"card\">\
                    <h5 class=\"card-title\">" + object.name + "</h5>\
                    <a href=\"" + object.id + "\" class=\"btn btn-primary\" name=\"cardButton\">Maggiori informazioni...</a></div></div>";
                }
                document.getElementById("eventLists").innerHTML += "</div></li></ul>";
            }
        }
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
        document.getElementById("myPopup").style.display = "none";
        document.getElementById("eventLists").style.display = "block";
    }
};