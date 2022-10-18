var getId = id => document.getElementById(id);

getId("guida").onclick = function () {
    var msgs = ["In questa pagina è possibile visualizzare tutte le informazioni disponibili sull'utente correntemente autenticato.", "In questa sezione è possibile vedere un elenco di tutti i biglietti relativi agli eventi a cui l'utente è iscritto."];
    var pageComps = [getId("title-card"), getId("biglietti-card")];
    getId("title-card").innerHTML = "";
    getId("biglietti-card").innerHTMl = "";
    showAlert(pageComps, msgs);
}