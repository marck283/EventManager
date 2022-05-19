const express = require('express');
const eventPublic = require('../collezioni/eventPublic');
const router = express.Router();
const eventsMap = require('./eventsMap.js');
var jwt = require('jsonwebtoken');

router.get("/:data", async (req, res) => {
    var str = req.params.data.split("-").join("/"); //Il parametro "data" deve essere parte dell'URI sopra indicato se si vuole accedere a questa proprietà.
    var events;
    var obj = {}, token = req.header("x-access-token");

    if(token != "") {
        //Eseguire la funzione verify, poi cercare gli eventi nel database
        events = await eventPublic.find({data: str}); //Se il token non è una stringa vuota, richiedi gli eventi per la data selezionata.
        events = events.filter(e => e.partecipantiID.find(e => e == "6284b7742a0699866a636979") == undefined); //Cambiare l'id del partecipante al momento del merge con il modulo di autenticazione.
    } else {
        events = await eventPublic.find({});
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