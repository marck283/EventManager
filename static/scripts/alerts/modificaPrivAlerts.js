var getId = id => document.getElementById(id);

getId("guida").onclick = function () {
    var msgs = ['In questa pagina è possibile modificare alcune informazioni sull\'evento privato cercato.'];
    var pageComps = [getId('title-card')];
    getId("title-card").innerHTML = "";
    showAlert(pageComps, msgs);
}