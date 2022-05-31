



//Aziona il filtro dopo il click del bottone "Enter" sulla tastiera.
document.getElementById("input").addEventListener("keydown", (event) => {
    if (event.code === "Enter") {
        //Avvia richiesta di filtrazione degli eventi.
        fetch("../api/v1/Utenti?email=" + document.getElementById("input").value)
            .then(resp => {
                switch (resp.status) {
                    case 200: {
                        //Handle success response
                        resp.json().then(resp => manipulateDom(resp));
                        break;
                    }
                    case 400:
                    case 404:
                    default: {
                        resp.json().then(resp => document.getElementById("result").innerHTMl += "<p>" + resp.error + "</p>");
                        break;
                    }
                }
            })
    }
});

var manipulateDom = resp => {
    document.getElementById("result").innerHTML = "";

    var h3 = document.createElement("h3");
    h3.textContent = "Elenco utenti trovati";
    document.getElementById("result").appendChild(h3);

    var result = document.getElementById("result");
    var list = document.createElement("ul");
    list.classList = "list-group list-group-flush";
    result.appendChild(list);

    var item = document.createElement("li");
    item.className = "list-group-item";
    list.appendChild(item);

    //Creo una riga
    var row = document.createElement("div");
    row.classList = "row row-cols-3";
    item.appendChild(row);
    for (var u of resp.utenti) {
        //Creo una card con Bootstrap
        var col = document.createElement("div");
        col.className = "col";
        row.appendChild(col);

        var card = document.createElement("div");
        card.className = "card";
        col.appendChild(card);

        card.innerHTML = "<button class = \"btn btn-primary\" onclick = \"document.getElementById('posta').value = '" + u.email + "'\">" + u.nome + "</button>" ;


        
    }

}