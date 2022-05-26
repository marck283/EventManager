const express = require('express');
const eventPublic = require('../collezioni/eventPublic.js');
const router = express.Router();
const eventsMap = require('./eventsMap.js');
var jwt = require('jsonwebtoken');

var findPubEvents = async (auth, res, user = "") => {
    var events = await eventPublic.find({});
    if(auth) {
        events = events.filter(e => e.partecipantiID.find(e => e == user) == undefined);
    }
    if (events.length > 0) {
        res.status(200).json(eventsMap.map(events, "pub"));
    } else {
        res.status(404).json({ error: "Non sono presenti eventi organizzati." });
    }
}

router.get("", async (req, res) => {
    var token = req.header('x-access-token');


    var autenticato = false;
    var user = "";

    if (token) {


        jwt.verify(token, process.env.SUPER_SECRET, function (err, decoded) {

            if (!err) {
                user = decoded.id;
                autenticato = true;
            }

        });


    }

    if (autenticato == true) {
        var passato = req.query.passato;
        switch (passato) {
            case "True": {
                //Filtro per date passate
                var eventsS = await eventPublic.find({});
                eventsS = eventsS.filter(e => {
                    var dateStr = e.data, hoursArr = e.ora.split(':'), hoursDB = hoursArr[0], minsDB = hoursArr[1];
                    dateStr = dateStr.split('/').join('-');
                    d = new Date(dateStr), curr = new Date();
                    d.setHours(hoursDB);
                    d.setMinutes(minsDB);
                    return d.getTime() < curr.getTime();
                });
                if (eventsS.length > 0) {
                    res.status(200).json(eventsMap.map(eventsS, "pub"));
                } else {
                    res.status(404).json({ error: "Non sono presenti eventi passati." });
                }
                return;
            }
            case "False": {
                findPubEvents(true, res, user);
                return;
            }
            default: {
                res.status(400).json({ error: "Richiesta malformata." }); //Invia un errore 400 quando la richiesta comprende un valore non corretto per il parametro "passato".
            }
        }
    } else {
        findPubEvents(false, res);
    }
    return;
});

router.get("/:data", async (req, res) => {
    var str = req.params.data.split("-").join("/"); //Il parametro "data" deve essere parte dell'URI sopra indicato se si vuole accedere a questa proprietà.    
    var events;
    var obj = {}, token = req.header("x-access-token");



    var autenticato = false;
    var user = "";

    if (token) {


        jwt.verify(token, process.env.SUPER_SECRET, function (err, decoded) {

            if (!err) {
                user = decoded.id;
                autenticato = true;
            }

        });


    }


    events = await eventPublic.find({});
    events = events.filter(e => e.data.includes(str));
    if (autenticato) {
        //Eseguire la funzione verify, poi cercare gli eventi nel database
        events = events.filter(e => (e.partecipantiID.find(e => e == user) == undefined)); //Cambiare l'id del partecipante al momento del merge con il modulo di autenticazione.
    }

    if (events.length > 0) {
        obj.eventi = eventsMap.map(events, "pub");
        obj.data = str;
        res.status(200).json(obj);
    } else {
        res.status(404).json({ error: "Non esiste alcun evento legato alla risorsa richiesta." });
    }
});

module.exports = router;