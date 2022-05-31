const express = require('express');
const eventPublic = require('../collezioni/eventPublic.js');
const eventPersonal = require('../collezioni/eventPersonal.js');
const eventPrivate = require('../collezioni/eventPrivat.js');
const router = express.Router();
const eventsMap = require('./eventsMap.js');
var jwt = require('jsonwebtoken');

router.get("/:data", async (req, res) => {
    var str = req.params.data.split("-").join("/"); //Il parametro "data" deve essere parte dell'URI sopra indicato se si vuole accedere a questa proprietà.
    var eventsPers = [], eventsPub = [], eventsPriv = [];
    var obj = {}, token = req.header("x-access-token");
    
    
    var user = req.loggedUser.id;


    //Eseguire la funzione verify, poi cercare gli eventi nel database
    eventsPers = await eventPersonal.find({organizzatoreID: user}); //Richiedi gli eventi personali per la data selezionata.
    eventsPers = eventsPers.filter(e => e.data.includes(str));
    eventsPub = await eventPublic.find({});
    eventsPub = eventsPub.filter(e => (e.partecipantiID.find(e => e == user) != undefined || (e.organizzatoreID == user)) && e.data.includes(str));
    eventsPriv = await eventPrivate.find({});
    eventsPriv = eventsPriv.filter(e => (e.partecipantiID.find(e => e == user) != undefined || (e.organizzatoreID == user)) && e.data.includes(str));
    
    if(eventsPers.length > 0 || eventsPub.length > 0 || eventsPriv.length > 0) {
        eventsPers = eventsMap.map(eventsPers, "pers");
        eventsPub = eventsMap.map(eventsPub, "pub");
        eventsPriv = eventsMap.map(eventsPriv, "priv");
        eventsPub.forEach(e => eventsPers.push(e));
        eventsPriv.forEach(e => eventsPers.push(e));
        obj.eventi = eventsPers;
        obj.data = str;
        res.status(200).json(obj);
    } else {
        res.status(404).json({"error": "Non esiste alcun evento programmato per la giornata selezionata."});
    }
});

var findPubEvents = async (user) => {
    var eventsPub = await eventPublic.find({});
    eventsPub = eventsPub.filter(e => e.partecipantiID.find(e => e == user) != undefined || e.organizzatoreID == user);
    return eventsPub;
};

var filterEvents = eventsArr => {
    return eventsArr.filter(e => {
        var dateStr = e.data, hoursArr = e.ora.split(':'), hoursDB = hoursArr[0], minsDB = hoursArr[1];
        //dateStr = dateStr.split('/').join('-');
        var d = new Date(dateStr), curr = new Date();
        d.setHours(hoursDB);
        d.setMinutes(minsDB);
        return d.getTime() < curr.getTime();
    });
}

router.get("", async (req, res) => {
    var eventsPers = [], eventsPub = [], eventsPriv = [];
    var obj = {}, token = req.header("x-access-token");
    
    var user = req.loggedUser.id;
    var nomeAtt = req.header("nomeAtt"), categoria = req.header("categoria"), durata = req.header("durata");
    var indirizzo = req.header("indirizzo"), citta = req.header("citta");

    eventsPers = await eventPersonal.find({organizzatoreID: user}); //Richiedi gli eventi personali.
    eventsPub = await findPubEvents(user);
    eventsPriv = await eventPrivate.find({});
    eventsPriv = eventsPriv.filter(e => (e.partecipantiID.find(e => e == user) != undefined || e.organizzatoreID == user));

    if(nomeAtt != undefined && nomeAtt != "") {
        eventsPers = eventsPers.filter(e => e.nomeAtt.includes(nomeAtt));
        eventsPub = eventsPub.filter(e => e.nomeAtt.includes(nomeAtt));
        eventsPriv = eventsPriv.filter(e => e.nomeAtt.includes(nomeAtt));
    }
    if(categoria != undefined && categoria != "") {
        eventsPers = eventsPers.filter(e => e.categoria == categoria);
        eventsPub = eventsPub.filter(e => e.categoria == categoria);
        eventsPriv = eventsPriv.filter(e => e.categoria == categoria);
    }
    if(durata != undefined && durata != "") {
        const duration = parseInt(durata);
        if(!Number.isNaN(duration)) {
            eventsPers = eventsPers.filter(e => e.durata == duration);
            eventsPub = eventsPub.filter(e => e.durata == duration);
            eventsPriv = eventsPriv.filter(e => e.durata == duration);
        } else {
            res.status(400).json({error: "Richiesta malformata."});
            return;
        }
    }
    if(indirizzo != undefined && indirizzo != "") {
        eventsPers = eventsPers.filter(e => e.luogoEv.indirizzo == indirizzo);
        eventsPub = eventsPub.filter(e => e.luogoEv.indirizzo == indirizzo);
        eventsPriv = eventsPriv.filter(e => e.luogoEv.indirizzo == indirizzo);
    }
    if(citta != undefined && citta != "") {
        eventsPers = eventsPers.filter(e => e.luogoEv.citta == citta);
        eventsPub = eventsPub.filter(e => e.luogoEv.citta == citta);
        eventsPriv = eventsPriv.filter(e => e.luogoEv.citta == citta);
    }

    var passato = req.query.passato;
    switch (passato) {
        case "True": {
            //Filtro per date passate
            eventsPub = filterEvents(eventsPub);
            eventsPriv = filterEvents(eventsPriv);
            break;
        }
        case "False": {
            break;
        }
        default: {
            res.status(400).json({ error: "Richiesta malformata." }); //Invia un errore 400 quando la richiesta comprende un valore non corretto per il parametro "passato".
        }
    }

    if(eventsPers.length > 0 || eventsPub.length > 0 || eventsPriv.length > 0) {
        eventsPers = eventsMap.map(eventsPers, "pers");
        eventsPub = eventsMap.map(eventsPub, "pub");
        eventsPub.forEach(e => eventsPers.push(e));
        eventsPriv = eventsMap.map(eventsPriv, "priv");
        eventsPriv.forEach(e => eventsPers.push(e));

        res.status(200).json({eventi: eventsPers});
    } else {
        res.status(404).json({error: "Non esiste alcun evento programmato."});
    }
});

module.exports = router;