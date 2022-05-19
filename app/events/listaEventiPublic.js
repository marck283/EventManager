const express = require('express');
const eventPublic = require('../collezioni/eventPublic');
const router = express.Router();
const eventsMap = require('./eventsMap.js');
var jwt = require('jsonwebtoken');

router.get("", async (req, res) => {
    var events = await eventPublic.find({});

    var token = req.header("x-access-token");
    if(token != "") {
        events = events.filter(e => e.partecipantiID.find(e => e == "6284b7742a0699866a636979") == undefined); //Cambiare l'id del partecipante al momento del merge con il modulo di autenticazione.
    }

    if(events.length > 0) {
        res.status(200).json(eventsMap.map(events, "layoutPubblico.html", token));
    } else {
        res.status(404).json({"error": "Non sono presenti eventi organizzati."});
    }
});

module.exports = router;