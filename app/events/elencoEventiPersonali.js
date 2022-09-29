const express = require('express');
const eventPublic = require('../collezioni/eventPublic.js');
const eventPersonal = require('../collezioni/eventPersonal.js');
const eventPrivate = require('../collezioni/eventPrivat.js');
const router = express.Router();
const eventsMap = require('./eventsMap.js');
const { Validator } = require('node-input-validator');

router.get("/:data", async (req, res) => {
    var str = req.params.data.split("-").join("/"); //Il parametro "data" deve essere parte dell'URI sopra indicato se si vuole accedere a questa proprietà.
    var eventsPers = [], eventsPub = [], eventsPriv = [];
    var obj = {};
    
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
    var curr = new Date();
    return eventsArr.filter(e => {
        var hoursArr = e.ora.split(':'), hoursDB = hoursArr[0], minsDB = hoursArr[1];

        for(let d of e.data) {
            var d1 = new Date(d);
            d1.setHours(hoursDB, minsDB);
            if(d1 < curr) {
                return true;
            }
        }
    });
};

router.get("", async (req, res) => {
    var eventsPers = [], eventsPub = [], eventsPriv = [];
    var user = req.loggedUser.id;
    var nomeAtt = req.header("nomeAtt"), categoria = req.header("categoria"), durata = req.header("durata");
    var indirizzo = req.header("indirizzo"), citta = req.header("citta");

    eventsPers = await eventPersonal.find({organizzatoreID: {$eq: user}}); //Richiedi gli eventi personali.
    eventsPub = await findPubEvents(user);
    eventsPriv = await eventPrivate.find({});
    eventsPriv = eventsPriv.filter(e => (e.partecipantiID.find(e => e == user) != undefined || e.organizzatoreID == user));

    const v = new Validator({
        durata: durata,
        passato: req.query.passato
    }, {
        durata: 'integer|min:1',
        passato: 'required|string|in:True,False'
    });
    v.check()
    .then(matched => {
        if(!matched) {
            res.status(400).json({error: "Richiesta malformata."}).send();
            return;
        }
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

        //Since "durata" is not required, it can still be undefined or an empty value.
        if(durata != undefined && durata != "") {
            eventsPers = eventsPers.filter(e => e.durata == durata);
            eventsPub = eventsPub.filter(e => e.durata == durata);
            eventsPriv = eventsPriv.filter(e => e.durata == durata);
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
    
        switch (req.query.passato) {
            case "True": {
                //Filtro per date passate
                eventsPub = filterEvents(eventsPub);
                eventsPriv = filterEvents(eventsPriv);
                break;
            }
            case "False": {
                break;
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
});

module.exports = router;