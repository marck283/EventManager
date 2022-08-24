const express = require('express');
const RateLimit = require('express-rate-limit');
const eventPublic = require('../collezioni/eventPublic.js');
const router = express.Router();
const eventsMap = require('./eventsMap.js');
var jwt = require('jsonwebtoken');
const { Validator } = require('node-input-validator');

var limiter = RateLimit ({
    windowMs: 1*60*1000, //1 minute
    max: 100, //Limit each IP to 10 requests per minute
    message: async () => "Hai raggiunto il numero massimo di richieste al minuto.",
    statusCode: 429
});

//Apply rate limiter to all requests
//Avoids Denial of Service attacks by limiting the number of requests per IP
router.use(limiter);

router.get("", async (req, res) => {
    var token = req.header('x-access-token');
    var autenticato = false;
    var user = "";

    if (token) {
        jwt.verify(token, process.env.SUPER_SECRET, (err, decoded) => {
            if (!err) {
                user = decoded.id;
                autenticato = true;
            }
        });
    }

    var events = await eventPublic.find({});
    if(autenticato) {
        events = events.filter(e => e.partecipantiID.find(e => e == user) == undefined);
    }

    var nomeAtt = req.header("nomeAtt"), categoria = req.header("categoria"), durata = req.header("durata");
    var indirizzo = req.header("indirizzo"), citta = req.header("citta");

    if(nomeAtt != undefined && nomeAtt != "") {
        events = events.filter(e => e.nomeAtt.includes(nomeAtt));
    }
    if(categoria != undefined && categoria != "") {
        events = events.filter(e => e.categoria == categoria);
    }

    const v1 = new Validator({
        durata: durata
    }, {
        durata: 'integer|min:1',
    });
    v1.check()
    .then(matched => {
        if(!matched) {
            res.status(400).json({error: "Richiesta malformata."});
            return;
        } else {
            if(durata != undefined) {
                events = events.filter(e => e.durata == durata);
            }
            if(indirizzo != undefined && indirizzo != "") {
                events = events.filter(e => e.luogoEv.indirizzo == indirizzo);
            }
            if(citta != undefined && citta != "") {
                events = events.filter(e => e.luogoEv.citta == citta);
            }
            if(events.length > 0) {
                res.status(200).json({eventi: eventsMap.map(events, "pub")});
            } else {
                res.status(404).json({ error: "Non sono presenti eventi organizzati." });
            }
        }
    });
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
        //Cerco nel database gli eventi a cui l'utente autenticato non è iscritto
        events = events.filter(e => (e.partecipantiID.find(e => e == user) == undefined));
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