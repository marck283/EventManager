var getId = id => document.getElementById(id);

var filtroEventi = (passato, listType) => {
    request(passato, "eventLists", listType, getId("nomeAtt").value, getId("categoria").value, getId("durata").value, getId("indirizzo").value, getId("citta").value);
};

var filtroEventiOrg = (passato, listType) => {
    requestOrg();
    filtroEventi(passato, listType);
}