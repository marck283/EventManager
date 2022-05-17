class Cal {
    constructor(divId) {
        //Memorizza l'id dell'elemento HTML
        this.divId = divId;
        // Giorni della settimana, a partire da Domenica
        this.DaysOfWeek = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
        // Mesi
        this.Months = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio',
            'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
        // Imposta il mese e l'anno corrente
        var d = new Date();
        this.currMonth = d.getMonth();
        this.currYear = d.getFullYear();
        this.currDay = d.getDate();
    }
    // Porta al mese successivo
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
    // Porta al mese precedente
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
    // Funzione "mostra mese" (anno, mese)
    showMonth(y, m) {
        var d = new Date()
            // Primo giorno della settimana nel mese selezionato
            , firstDayOfMonth = new Date(y, m, 1).getDay()
            // Ultimo giorno del mese selezionato
            , lastDateOfMonth = new Date(y, m + 1, 0).getDate()
            // Ultimo giorno del mese precedente
            , lastDayOfLastMonth = m == 0 ? new Date(y - 1, 11, 0).getDate() : new Date(y, m, 0).getDate();
        var html = '<table>';
        // Scrivi il mese ed il giorno selezionati
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
            // Inizia una nuova riga se Domenica
            if (dow == 0) {
                html += '<tr>';
            }

            // Se non è domenica, ma è il primo giorno del mese
            // scriverà gli ultimi giorni del mese precedente
            else if (i == 1) {
                html += '<tr>';
                var k = lastDayOfLastMonth - firstDayOfMonth + 1;
                for (var j = 0; j < firstDayOfMonth; j++) {
                    html += '<td class="not-current"><a href="#" onclick="myPopup(\"' + (m - 1) + '/' + k + '/' + y + '\");">' + k + '</a></td>';
                    k++;
                }
            }
            // Scrivi il giorno corrente nel loop
            var chk = new Date();
            var chkY = chk.getFullYear();
            var chkM = chk.getMonth();
            if (chkY == this.currYear && chkM == this.currMonth && i == this.currDay) {
                html += '<td class="today"><a href="#" onclick="myPopup(\"' + m + '/' + i + '/' + y + '\");">' + i + '</a></td>';
            } else {
                html += '<td class="normal"><a href="#" onclick="myPopup(\"' + m + '/' + i + '/' + y + '\");">' + i + '</a></td>';
            }
            // Chiudi la riga se è sabato
            if (dow == 6) {
                html += '</tr>';
            }


            // Se non è sabato, ma è l'ultimo giorno del mese
            // scriverà i giorni iniziali del prossimo mese
            else if (i == lastDateOfMonth) {
                var k = 1;
                for (dow; dow < 6; dow++) {
                    html += '<td class="not-current"><a href="#" onclick="myPopup(\"' + (m + 1) + '/' + k + '/' + y + '\");">' + k + '</a></td>';
                    k++;
                }
            }
            i++;
        } while (i <= lastDateOfMonth);
        // Chiude la tabella
        html += '</table>';
        // Scrivi il codice HTML nel div
        document.getElementById(this.divId).innerHTML = html;
    }
}
// Al caricamento della finestra
window.onload = function () {
    // Inizia il calendario
    var c = new Cal("divCal");
    c.showcurr();
    // Imposta i click sui bottoni "precedente" e "successivo"
    getId('btnNext').onclick = function () {
        c.nextMonth();
    };
    getId('btnPrev').onclick = function () {
        c.previousMonth();
    };
}
// Ottieni l'elemento grazie al suo id
function getId(id) {
    return document.getElementById(id);
}

var requestWithParams = async (id, day) => {
    fetch("/api/v1/eventiCalendario?giorno=" + day)
        .then(response => {
            response.json(); console.log(response)})
        .then(response => {
            console.log(response);
            var category = response[0].category, firstIteration = true;
            for (var f of response) {
                if (category !== f.category || firstIteration) {
                    category = f.category;
                    document.getElementById(id).innerHTML += "<h3>" + category + "</h3>\
                    <ul class=\"list-group list-group-flush\"><li class=\"list-group-item\"><div class=\"row\"\
                    id=\"" + category + "\">";
                }
                var jr1 = response.filter(item => item.category === category);

                //Itero sulla risposta JSON filtrata per categoria, ottenendo i valori dei campi desiderati
                for (var object of jr1) {
                    document.getElementById(category).innerHTML += "<div class=\"col\"><div class=\"card\">\
                    <h5 class=\"card-title\">" + object.name + "</h5>\
                    <a href=\"" + object.id + "\" class=\"btn btn-primary\" name=\"cardButton\">Maggiori informazioni...</a></div></div>";
                }
                document.getElementById(id).innerHTML += "</div></li></ul>";
            }
        }).catch(error => console.log(error));
};

function myPopup(day) {
    var popup = document.getElementById("myPopup");
    document.getElementById("myPopup").style.display = "block";
    //Nothing to see here... (inserire gli eventi del giorno selezionato
    //trovati per richiesta GET e query secondo il parametro 'day', espresso come 'giorno/mese/anno').
    requestWithParams("elencoEventi", day); //"day" is undefined. Why?
    popup.classList.toggle("show");
}