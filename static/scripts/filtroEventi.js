var getId = id => document.getElementById(id);

var filtroEventi = listType => {
    request(listType, getId("nomeAtt").value, getId("categoria").value, getId("durata").value, getId("indirizzo").value, getId("citta").value);
};