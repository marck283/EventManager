var getId = id => document.getElementById(id);

getId("posta").value = "";
getId("input").value = "";
getId("guida").onclick = function () {
    var msgs = ['In questa pagina sono presenti tutte le informazioni sull\'evento pubblico cercato.', 'Ogni utente organizzatore può modificare un evento cliccando su questo pulsante.', 'Ogni utente organizzatore, inoltre, può cercare utenti da invitare al suo evento tramite questo modulo.', 'Una volta terminata la ricerca, gli utenti trovati compariranno qui e potranno essere invitati premendo sul bottone contenente il loro nome.', 'Gli indirizzi email degli utenti così trovati compariranno qui.'];
    var pageComps = [getId('title'), getId('modificaBlock'), getId('invitoBlock'), getId('resultBlock'), getId('invitoResultBlock')];
    getId("title").innerHTML = "";
    getId("modificaBlock").innerHTML = "";
    getId('invitoBlock').innerHTML = "";
    getId('resultBlock').innerHTML = "";
    getId('invitoResultBlock').innerHTML = "";
    showAlert(pageComps, msgs);
}