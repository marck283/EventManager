var getId = elemId => document.getElementById(elemId);
getId("etaMinGroup").style.display = "none";
getId("etaMaxGroup").style.display = "none";
getId("flexCheckEtaMin").onclick = () => {
    if (getId("flexCheckEtaMin").checked) {
        getId("etaMinGroup").style.display = "block";
    } else {
        getId("etaMinGroup").value = "";
        getId("etaMinGroup").style.display = "none";
    }
}
getId("flexCheckEtaMax").onclick = () => {
    if (getId("flexCheckEtaMax").checked) {
        getId("etaMaxGroup").style.display = "block";
    } else {
        getId("etaMaxGroup").value = "";
        getId("etaMaxGroup").style.display = "none";
    }
}