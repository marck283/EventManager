const express = require('express');
const eventPublic = require('../collezioni/eventPublic.js');
const eventPersonal = require('../collezioni/eventPersonal.js');
const router = express.Router();
const eventsMap = require('./eventsMap.js');
var jwt = require('jsonwebtoken');

router.get("/:data", async (req, res) => {
    var str = req.params.data.split("-").join("/"); //Il parametro "data" deve essere parte dell'URI sopra indicato se si vuole accedere a questa proprietà.
    var eventsPers = [], eventsPub = [];
    var obj = {}, token = req.header("x-access-token");
    
    
    var user = req.loggedUser.id;


    //Eseguire la funzione verify, poi cercare gli eventi nel database
    eventsPers = await eventPersonal.find({organizzatoreID: user}); //Richiedi gli eventi personali per la data selezionata.
    eventsPers = eventsPers.filter(e => e.data.includes(str));
    eventsPub = await eventPublic.find({});
    eventsPub = eventsPub.filter(e => (e.partecipantiID.find(e => e == user) != undefined || (e.organizzatoreID == user)) && e.data.includes(str)); //Cambiare l'id del partecipante al momento del merge con il modulo di autenticazione.
    

    if(eventsPers.length > 0 || eventsPub.length > 0) {
        eventsPers = eventsMap.map(eventsPers, "pers");
        eventsPub = eventsMap.map(eventsPub, "pub");
        eventsPub.forEach(e => eventsPers.push(e));
        obj.eventi = eventsPers;
        obj.data = str;
        res.status(200).json(obj);
    } else {
        res.status(404).json({"error": "Non esiste alcun evento programmato per la giornata selezionata."});
    }
});

router.get("", async (req, res) => {
    var eventsPers = [], eventsPub = [];
    var obj = {}, token = req.header("x-access-token");
    
    
    var user = req.loggedUser.id;
    var nomeAtt = req.headers.nomeAtt, categoria = req.headers.categoria, durata = req.headers.durata;
    var indirizzo = req.headers.indirizzo, citta = req.headers.citta;

    
    //Eseguire la funzione verify, poi cercare gli eventi nel database
    eventsPers = await eventPersonal.find({organizzatoreID: user}); //Richiedi gli eventi personali per la data selezionata.
    eventsPub = await eventPublic.find({});
    eventsPub = eventsPub.filter(e => e.partecipantiID.find(e => e == user) != undefined || e.organizzatoreID == user);

    if(nomeAtt != undefined && nomeAtt != "") {
        eventsPers = eventsPers.filter(e => e.nomeAtt.includes(nomeAtt));
        eventsPub = eventsPub.filter(e => e.nomeAtt.includes(nomeAtt));
    }
    if(categoria != undefined && categoria != "") {
        eventsPers = eventsPers.filter(e => e.categoria == categoria);
        eventsPub = eventsPub.filter(e => e.categoria == categoria);
    }
    if(durata != undefined && durata != "") {
        eventsPers = eventsPers.filter(e => e.durata == durata);
        eventsPub = eventsPub.filter(e => e.durata == durata);
    }
    if(indirizzo != undefined && indirizzo != "") {
        eventsPers = eventsPers.filter(e => e.indirizzo == indirizzo);
        eventsPub = eventsPub.filter(e => e.indirizzo == indirizzo);
    }
    if(citta != undefined && citta != "") {
        eventsPers = eventsPers.filter(e => e.citta == citta);
        eventsPub = eventsPub.filter(e => e.citta == citta);
    }

    if(eventsPers.length > 0 || eventsPub.length > 0) {
        eventsPers = eventsMap.map(eventsPers, "pers");
        eventsPub = eventsMap.map(eventsPub, "pub");
        eventsPub.forEach(e => eventsPers.push(e));
        
        obj.eventi = eventsPers;
        res.status(200).json(obj);
    } else {
        res.status(404).json({"error": "Non esiste alcun evento programmato."});
    }
});

module.exports = router;