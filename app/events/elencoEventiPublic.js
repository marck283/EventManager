const express = require('express');
const eventPublic = require('../collezioni/eventPublic');
const router = express.Router();
const eventsMap = require('./eventsMap.js');
var jwt = require('jsonwebtoken');

router.get("/:data", async (req, res) => {
    var str = req.params.data.split("-").join("/"); //Il parametro "data" deve essere parte dell'URI sopra indicato se si vuole accedere a questa proprietà.    
    var events;
    var obj = {}, token = req.header("x-access-token");

    var user = "6284b7742a0699866a636979"; //Utente di prova

    events = await eventPublic.find({});
    if(token != "") {
        //Eseguire la funzione verify, poi cercare gli eventi nel database
        events = events.filter(e => e.partecipantiID.find(e => e == user) == undefined && e.data.includes(str)); //Cambiare l'id del partecipante al momento del merge con il modulo di autenticazione.
    }

    if(events.length > 0) {
        obj.eventi = eventsMap.map(events, "layoutPubblico.html", token);
        obj.data = str;
        res.status(200).json(obj);
    } else {
        res.status(404).json({"error": "Non esiste alcun evento legato alla risorsa richiesta."});
    }
});

module.exports = router;