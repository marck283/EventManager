var getId = id => document.getElementById(id);

getId("guida").onclick = function () {
    var msgs = ["In questa pagina √® possibile inserire informazioni per la creazione di un evento privato.", "In questa sezione, invece, √® possibile invitare altri utenti al proprio evento. Si noti che, oltre a questa, non vi saranno altre possibilit√† per invitare utenti all'evento privato che si vuole creare."];
    var pageComps = [getId("title-card"), getId("ricUtenti")];
    getId("title-card").innerHTML = "";
    getId("ricUtenti").innerHTML = "";
    showAlert(pageComps, msgs);
}