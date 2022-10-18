var getId = id => document.getElementById(id);

getId("guida").onclick = function () {
    var msgs = ["In questa pagina è possibile visualizzare gli eventi pubblici a cui l'utente non risulta iscritto.", "Utilizzando questo pulsante è possibile cambiare il tipo di visualizzazione degli eventi da lista a calendario e viceversa.", "In questa sezione, invece, è possibile filtrare gli eventi secondo i parametri qui indicati. Gli eventi trovati verranno mostrati sopra."];
    var pageComps = [getId("title-card"), getId("switchViewStyle"), getId("filtro-card")];
    getId("title-card").innerHTML = "";
    getId("switchViewStyle").innerHTML = "";
    getId("filtro-card").innerHTML = "";
    showAlert(pageComps, msgs);
}