const express = require('express');
const RateLimit = require('express-rate-limit');
const eventPublic = require('../collezioni/eventPublic.js');
const router = express.Router();
const eventsMap = require('./eventsMap.js');
var jwt = require('jsonwebtoken');
const { Validator } = require('node-input-validator');
const User = require('../collezioni/utenti.js');
const verify = require('../googleTokenChecker.js');

var limiter = RateLimit ({
    windowMs: 1*60*1000, //1 minute
    max: 100, //Limit each IP to 10 requests per minute
    message: async () => "Hai raggiunto il numero massimo di richieste al minuto.",
    statusCode: 429
});

//Apply rate limiter to all requests
//Avoids Denial of Service attacks by limiting the number of requests per IP
router.use(limiter);

var filterCondition = (condition, arr, cb) => {
    if(condition) {
        arr.filter(cb);
    }
}

router.get("", async (req, res) => {
    var token = req.header('x-access-token');
    var autenticato = false;
    var user = "";

    var events = await eventPublic.find({});
    var nomeAtt = req.header("nomeAtt"), categoria = req.header("categoria"), durata = req.header("durata");
    var indirizzo = req.header("indirizzo"), citta = req.header("citta");

    if (token) {
        //Ancora da testarne il funzionamento
        if(token.iss === "accounts.google.com" || token.iss === "https://accounts.google.com") {
            //Questo è un token Google
            await verify(token)
            .then(() => {
                user = token.getPayload().sub;
                autenticato = true;
            });
        } else {
            //Questo non è un token Google
            jwt.verify(token, process.env.SUPER_SECRET, (err, decoded) => {
                if (!err) {
                    user = decoded.id;
                    autenticato = true;
                }
            });
        }
        if(autenticato) {
            events = events.filter(e => e.partecipantiID.find(e => e == user) == undefined);
        }
    }

    filterCondition(nomeAtt != undefined && nomeAtt != "", events, e => e.nomeAtt.includes(nomeAtt));
    filterCondition(categoria != undefined && categoria != "", events, e => e.categoria == categoria);

    const v1 = new Validator({
        durata: durata
    }, {
        durata: 'integer|min:1',
    });
    v1.check()
    .then(matched => {
        if(!matched) {
            res.status(400).json({error: "Richiesta malformata."});
        } else {
            filterCondition(durata != undefined, events, e => e.durata == durata);
            filterCondition(indirizzo != undefined && indirizzo != "", events, e => e.luogoEv.indirizzo == indirizzo);
            filterCondition(citta != undefined && citta != "", events, e => e.luogoEv.citta == citta);
            
            if(events.length > 0) {
                var events1 = eventsMap.map(events, "pub");
                events1.recensioni = events.recensioni; //Mostro le recensioni solo per quegli eventi a cui l'utente non è ancora iscritto

                //Ordina gli eventi ottenuti per valutazione media decrescente dell'utente organizzatore
                events1.sort((e, e1) => {
                    var org = User.findById(e.organizzatoreID), org1 = User.findById(e1.organizzatoreID);
                    return org.valutazioneMedia < org1.valutazioneMedia;
                });
                res.status(200).json({eventi: events1});
            } else {
                res.status(404).json({ error: "Non sono presenti eventi organizzati." });
            }
        }
    })
    .catch(err => console.log(err));
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
        res.status(200).json(obj).send();
    } else {
        res.status(404).json({ error: "Non esiste alcun evento legato alla risorsa richiesta." }).send();
    }
});

module.exports = router;