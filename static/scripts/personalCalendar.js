class Cal {
    constructor(divId) {
        //Memorizza l'id del blocco
        this.divId = divId;
        // Giorni della settimana, a partire da domenica
        this.DaysOfWeek = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
        // Mesi, a partire da gennaio
        this.Months = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio',
            'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
        // Imposta il mese e l'anno correnti
        var d = new Date();
        this.currMonth = d.getMonth();
        this.currYear = d.getFullYear();
        this.currDay = d.getDate();
    }
    // Mostra il mese successivo
    nextMonth() {
        if (this.currMonth == 11) {
            this.currMonth = 0;
            this.currYear = this.currYear + 1;
        }
        else {
            this.currMonth = this.currMonth + 1;
        }
        this.showcurr();
    }
    // Mostra il mese precedente
    previousMonth() {
        if (this.currMonth == 0) {
            this.currMonth = 11;
            this.currYear = this.currYear - 1;
        }
        else {
            this.currMonth = this.currMonth - 1;
        }
        this.showcurr();
    }
    // Mostra il mese corrente
    showcurr() {
        this.showMonth(this.currYear, this.currMonth);
    }
    // Mostra il mese (anno, mese)
    showMonth(y, m) {
        var d = new Date()
            // Primo giorno della settimana nel mese selezionato
            , firstDayOfMonth = new Date(y, m, 1).getDay()
            // Ultimo giorno del mese
            , lastDateOfMonth = new Date(y, m + 1, 0).getDate()
            // Ultimo giorno del mese precedente
            , lastDayOfLastMonth = m == 0 ? new Date(y - 1, 11, 0).getDate() : new Date(y, m, 0).getDate();
        var html = '<table>';
        // Scrivi il mese e l'anno selezionati
        html += '<thead><tr>';
        html += '<td colspan="7">' + this.Months[m] + ' ' + y + '</td>';
        html += '</tr></thead>';
        // Scrivi l'intestazione dei giorni della settimana
        html += '<tr class="days">';
        for (var i of this.DaysOfWeek) {
            html += '<td>' + i + '</td>';
        }
        html += '</tr>';
        // Scrivi i giorni
        var i = 1;
        do {
            var dow = new Date(y, m, i).getDay();
            // Se domenica, inizia una nuova riga
            if (dow == 0) {
                html += '<tr>';
            }


            // Se non è domenica, ma è il primo giorno del mese
            // scriverà gli ultimi giorni del mese precedente
            else if (i == 1) {
                html += '<tr>';
                var k = lastDayOfLastMonth - firstDayOfMonth + 1;
                for (var j = 0; j < firstDayOfMonth; j++) {
                    html += '<td class="not-current">' + k + '</td>';
                    k++;
                }
            }
            // Scrive il giorno corrente nel loop
            var chk = new Date();
            var chkY = chk.getFullYear();
            var chkM = chk.getMonth();
            if (chkY == this.currYear && chkM == this.currMonth && i == this.currDay) {
                html += '<td class="today">';
            } else {
                html += '<td class="normal">';
            }
            if (i < 10) {
                html += '<a href="#" id="0' + i + '">' + i + '</a></td>';
            } else {
                html += '<a href="#" id="' + i + '">' + i + '</a></td>';
            }


            // Se sabato, chiude la riga
            if (dow == 6) {
                html += '</tr>';
            }


            // Se non è sabato, ma è l'ultimo giorno del mese selezionato
            // scriverà i primi giorni del mese successivo
            else if (i == lastDateOfMonth) {
                var k = 1;
                for (dow; dow < 6; dow++) {
                    html += '<td class="not-current">' + k + '</td>';
                    k++;
                }
            }
            i++;
        } while (i <= lastDateOfMonth);
        // Chiude la tabella
        html += '</table>';
        // Scrive il codice HTML appena aggiunto nel blocco padre
        document.getElementById(this.divId).innerHTML = html;

        for (var elem of document.getElementsByTagName("a")) {
            elem.onclick = myPopup.bind(this, [(m + 1).toString().padStart(2, '0'), elem.getAttribute("id"), y.toString()]);
        }
    }
}
// Al caricamento della finestra
window.onload = function () {
    var c = new Cal("divCal");
    c.showcurr();
    getId('btnNext').onclick = function () {
        c.nextMonth();
    };
    getId('btnPrev').onclick = function () {
        c.previousMonth();
    };
    getId("myPopup1").style.display = "none";
}

function getId(id) {
    return document.getElementById(id);
}

var requestWithParams = async (id, day) => {
    getId(id).innerHTML = "";
    getId(id).style.display = "block";

    fetch("/api/v2/eventiCalendarioPersonale/" + day + "?passato=False", {
        method: 'GET',
        headers: {
            'x-access-token': token //Invio il token di accesso attraverso un header della richiesta.
        }
    }).then(resp => {
        switch (resp.status) {
            case 200: {
                resp.json().then(resp => {
                    var categories = []; //Lista di categorie già stampate a video
                    for (var f of resp.eventi) { //f è il singolo evento
                        if (categories.find(e => e == f.category) === undefined) {
                            //Se non trovo la categoria dell'evento considerato all'interno dell'array delle categorie
                            //già stampate a video, la inserisco e stampo tutti gli eventi ad essa appartenenti.
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
                            row.className = "row";
                            row.setAttribute("id", category);
                            li.appendChild(row);
    
                            var jr1 = resp.eventi.filter(item => item.category === category);

                            //Itero sulla risposta JSON filtrata per categoria, ottenendo i valori dei campi desiderati
                            for (var object of jr1) {
                                var col = document.createElement("div");
                                col.className = "col";
                                row.appendChild(col);

                                var card = document.createElement("div");
                                card.className = "card";
                                col.appendChild(card);

                                var h5 = document.createElement("h5");
                                h5.className = "card-title";
                                h5.textContent = object.name;
                                card.appendChild(h5);

                                var a = document.createElement("a");
                                if(object.id == "pers"){
                                    a.href = "layoutPersonale.html";
                                } else {
                                    if(object.id == "pub"){
                                        a.href = "layoutPubblico.html";
                                    } else {
                                        a.href = "layoutPrivato.html";
                                    }
                                }
                                a.href += "?id="+ object.idevent;
                                a.classList = "btn btn-primary";
                                a.setAttribute("name", "cardButton");
                                a.textContent = "Maggiori informazioni...";
                                card.appendChild(a);
                            }
                        }
                    }
                });
                break;
            }

            case 401:
            case 404: {
                //Se non esiste alcun evento per la data selezionata
                resp.json().then(resp => getId(id).textContent = resp.error);
                break;
            }

            default: {
                //Per mostrare altri errori nella Developer Console del browser
                console.log(resp.status);
            }
        }
    }).catch(error => console.log(error));
};

function myPopup(day) {
    var popup = getId("myPopup1");
    popup.style.display = "block";
    console.log(day.join("-"));
    requestWithParams("elencoEventi", day.join("-"));
    popup.classList.toggle("show");
}