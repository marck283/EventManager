var getId = id => document.getElementById(id);

getId("guida").onclick = function () {
    var msgs = ['In questa pagina sono presenti tutte le informazioni sull\'evento privato cercato.', "L'utente organizzatore, inoltre, può modificare le informazioni relative a questo evento premendo su questo bottone."];
    var pageComps = [getId('title'), getId('modificaEvento')];
    getId("title").innerHTML = "";
    getId("modificaEvento").innerHTML = "";
    showAlert(pageComps, msgs);
}