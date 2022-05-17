class Cal {
    constructor(divId) {
        //Store div id
        this.divId = divId;
        // Days of week, starting on Sunday
        this.DaysOfWeek = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
        // Months, stating on January
        this.Months = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio',
            'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
        // Set the current month, year
        var d = new Date();
        this.currMonth = d.getMonth();
        this.currYear = d.getFullYear();
        this.currDay = d.getDate();
    }
    // Goes to next month
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
    // Goes to previous month
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
    // Show current month
    showcurr() {
        this.showMonth(this.currYear, this.currMonth);
    }
    // Show month (year, month)
    showMonth(y, m) {
        var d = new Date()
            // First day of the week in the selected month
            , firstDayOfMonth = new Date(y, m, 1).getDay()
            // Last day of the selected month
            , lastDateOfMonth = new Date(y, m + 1, 0).getDate()
            // Last day of the previous month
            , lastDayOfLastMonth = m == 0 ? new Date(y - 1, 11, 0).getDate() : new Date(y, m, 0).getDate();
        var html = '<table>';
        // Write selected month and year
        html += '<thead><tr>';
        html += '<td colspan="7">' + this.Months[m] + ' ' + y + '</td>';
        html += '</tr></thead>';
        // Write the header of the days of the week
        html += '<tr class="days">';
        for (var i of this.DaysOfWeek) {
            html += '<td>' + i + '</td>';
        }
        html += '</tr>';
        // Write the days
        var i = 1;
        do {
            var dow = new Date(y, m, i).getDay();
            // If Sunday, start new row
            if (dow == 0) {
                html += '<tr>';
            }

            // If not Sunday but first day of the month
            // it will write the last days from the previous month
            else if (i == 1) {
                html += '<tr>';
                var k = lastDayOfLastMonth - firstDayOfMonth + 1;
                for (var j = 0; j < firstDayOfMonth; j++) {
                    html += '<td class="not-current"><a href="#" onclick="myPopup(' +  + m + "/" + i + "/" + y + ');">' + k + '</a></td>';
                    k++;
                }
            }
            // Write the current day in the loop
            var chk = new Date();
            var chkY = chk.getFullYear();
            var chkM = chk.getMonth();
            if (chkY == this.currYear && chkM == this.currMonth && i == this.currDay) {
                html += '<td class="today"><a href="#" onclick="myPopup(' +  + m + "/" + i + "/" + y + ');">' + i + '</a></td>';
            } else {
                html += '<td class="normal"><a href="#" onclick="myPopup(' +  + m + "/" + i + "/" + y + ');">' + i + '</a></td>';
            }
            // If Saturday, closes the row
            if (dow == 6) {
                html += '</tr>';
            }


            // If not Saturday, but last day of the selected month
            // it will write the next few days from the next month
            else if (i == lastDateOfMonth) {
                var k = 1;
                for (dow; dow < 6; dow++) {
                    html += '<td class="not-current"><a href="#" onclick="myPopup(' + m + "/" + i + "/" + y + ');">' + k + '</a></td>';
                    k++;
                }
            }
            i++;
        } while (i <= lastDateOfMonth);
        // Closes table
        html += '</table>';
        // Write HTML to the div
        document.getElementById(this.divId).innerHTML = html;
    }
}
// On Load of the window
window.onload = function () {
    // Start calendar
    var c = new Cal("divCal");
    c.showcurr();
    // Bind next and previous button clicks
    getId('btnNext').onclick = function () {
        c.nextMonth();
    };
    getId('btnPrev').onclick = function () {
        c.previousMonth();
    };
}
// Get element by id
function getId(id) {
    return document.getElementById(id);
}

var requestWithParams = async (id, day) => {
    try {
        //SOLO PER LO SVILUPPO IN LOCALE (da commentare quando si eseguirà il deploy su Heroku, sostituendola con l'hostname
        //dell'applicazione su Heroku)
        var HOST_NAME = 'http://localhost:3000';

        var data = { giorno: day }, url = new URL(HOST_NAME + "/api/v1/eventiCalendarioPubblico");
        for (let k in data) {
            url.searchParams.append(k, data[k]);
        }
        fetch(url)
        .then(response => response.json())
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
        });
    } catch (error) {
        console.log(error);
    }
};

function myPopup(day) {
    var popup = document.getElementById("myPopup");
    document.getElementById("myPopup").style.display = "block";
    //Nothing to see here... (inserire gli eventi del giorno selezionato
    //trovati per richiesta GET e query secondo il parametro 'day', espresso come 'giorno/mese/anno').
    requestWithParams("elencoEventi", day); //"day" is undefined. Why?
    popup.classList.toggle("show");
}