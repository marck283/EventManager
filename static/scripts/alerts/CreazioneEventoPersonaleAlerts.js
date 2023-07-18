var getId = id => document.getElementById(id);

getId("guida").onclick = function () {
    var msgs = ["In questa pagina è possibile inserire informazioni per la creazione di un evento personale."];
    var pageComps = [getId("title-card")];
    getId("title-card").innerHTML = "";
    showAlert(pageComps, msgs);
}