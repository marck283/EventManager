var getId = id => document.getElementById(id);

getId("guida").onclick = function () {
    var msgs = ["All'interno di questa pagina è possibile effettuare l'autenticazione o la registrazione dell'utente.", "Al termine dell'autenticazione, l'utente potrà continuare ad utilizzare l'applicazione semplicemente premendo su una delle voci della barra di navigazione. Tuttavia, le funzionalità offerte dal sistema varieranno in base al fatto che l'utente sia autenticato o meno.", "In particolare, la funzione di creazione degli eventi e la visualizzazione del calendario personale, dei dati personali e degli inviti non saranno disponibili per gli utenti non autenticati."];
    var pageComps = [getId("title-card"), getId("second-title-card")];
    getId("title-card").innerHTML = "";
    getId("second-title-card").innerHTML = "";
    showAlert(pageComps, msgs);
}