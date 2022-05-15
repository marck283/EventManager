var showIfChecked = () => {
    if (document.getElementById("buttonSwitch").checked) {
        document.getElementById("calendarWrapper").style.display = "block";
        document.getElementById("divCal").style.display = "block";
        document.getElementById("eventLists").style.display = "none";
    } else {
        document.getElementById("calendarWrapper").style.display = "none";
        document.getElementById("divCal").style.display = "none";
        document.getElementById("eventLists").style.display = "block";
    }
};