var getId = id => document.getElementById(id);

getId("guida").onclick = function () {
    var msgs = ["In questa pagina è possibile visualizzare gli inviti agli eventi pubblici, privati e personali a cui l'utente risulta invitato."];
    var pageComps = [getId("title-card")];
    getId("title-card").innerHTML = "";
    showAlert(pageComps, msgs);
}