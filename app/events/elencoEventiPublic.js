const express = require('express');
const eventPublic = require('../collezioni/eventPublic.js');
const router = express.Router();
const eventsMap = require('./eventsMap.js');
var jwt = require('jsonwebtoken');

router.get("", async (req, res) => {
    var events = await eventPublic.find({});

    var token = req.header('x-access-token');
    

    var autenticato = false;
    var user = "";

    if (token) {
        
    
        jwt.verify(token, process.env.SUPER_SECRET, function(err, decoded){

            if (!err) {
                user = decoded.id;
                autenticato = true;
            }

        });


    }

    if(autenticato == true){
        events = events.filter(e => e.partecipantiID.find(e => e == user) == undefined); //Cambiare l'id del partecipante al momento del merge con il modulo di autenticazione.
        
        
    }

    if(events.length > 0) {
        res.status(200).json(eventsMap.map(events, "pub"));
    } else {
        res.status(404).json({"error": "Non sono presenti eventi organizzati."});
    }
});

router.get("/:data", async (req, res) => {
    var str = req.params.data.split("-").join("/"); //Il parametro "data" deve essere parte dell'URI sopra indicato se si vuole accedere a questa proprietà.    
    var events;
    var obj = {}, token = req.header("x-access-token");
    
    

    var autenticato = false;
    var user = "";

    if (token) {
        
    
        jwt.verify(token, process.env.SUPER_SECRET, function(err, decoded){

            if (!err) {
                user = decoded.id;
                autenticato = true;
            }

        });


    }
    

    events = await eventPublic.find({});
    events = events.filter(e => e.data.includes(str));
    if(autenticato) {
        //Eseguire la funzione verify, poi cercare gli eventi nel database
        events = events.filter(e => (e.partecipantiID.find(e => e == user) == undefined)); //Cambiare l'id del partecipante al momento del merge con il modulo di autenticazione.
    }

    if(events.length > 0) {
        obj.eventi = eventsMap.map(events, "pub");
        obj.data = str;
        res.status(200).json(obj);
    } else {
        res.status(404).json({"error": "Non esiste alcun evento programmato per la giornata selezionata."});
    }
});

module.exports = router;