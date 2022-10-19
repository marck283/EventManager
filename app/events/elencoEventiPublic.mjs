import { Router } from 'express';
import RateLimit from 'express-rate-limit';
import eventPublic from '../collezioni/eventPublic.mjs';
const router = Router();
import { map } from './eventsMap.mjs';
import pkg from 'jsonwebtoken';
const tVerify = pkg.verify;
import { Validator } from 'node-input-validator';
import User from '../collezioni/utenti.mjs';
import verify from '../googleTokenChecker.mjs';

var limiter = RateLimit({
    windowMs: 1 * 60 * 1000, //1 minute
    max: 100, //Limit each IP to 10 requests per minute
    message: async () => "Hai raggiunto il numero massimo di richieste al minuto.",
    statusCode: 429
});

//Apply rate limiter to all requests
//Avoids Denial of Service attacks by limiting the number of requests per IP
router.use(limiter);

var filterCondition = (condition, arr, cb) => {
    if (condition) {
        arr.filter(cb);
    }
}

router.get("", async (req, res) => {
    var token = req.header('x-access-token');
    var user = "";

    var events = await eventPublic.find({});
    var nomeAtt = req.header("nomeAtt"), categoria = req.header("categoria"), durata = req.header("durata");
    var indirizzo = req.header("indirizzo"), citta = req.header("citta");

    if (token != undefined && token != "") {
        //Test per token Google
        await verify(token)
            .then(async ticket => {
                //Questo è un token Google valido
                user = ticket.getPayload().email;
                const utente = await User.findOne({ email: { $eq: user } });
                events = events.filter(e => (!e.partecipantiID.includes(utente.id) && e.organizzatoreID !== utente.id));

                filterCondition(nomeAtt != undefined && nomeAtt != "", events, e => e.nomeAtt.includes(nomeAtt));
                filterCondition(categoria != undefined && categoria != "", events, e => e.categoria == categoria);

                const v1 = new Validator({
                    durata: durata
                }, {
                    durata: 'integer|min:1',
                });
                v1.check()
                    .then(matched => {
                        if (!matched) {
                            res.status(400).json({ error: "Richiesta malformata." });
                        } else {
                            filterCondition(durata != undefined, events, e => e.durata == durata);
                            filterCondition(indirizzo != undefined && indirizzo != "", events, e => e.luogoEv.indirizzo == indirizzo);
                            filterCondition(citta != undefined && citta != "", events, e => e.luogoEv.citta == citta);

                            if (events.length > 0) {
                                var events1 = map(events, "pub");
                                events1.recensioni = events.recensioni; //Mostro le recensioni solo per quegli eventi a cui l'utente non è ancora iscritto

                                //Ordina gli eventi ottenuti per valutazione media decrescente dell'utente organizzatore
                                events1.sort((e, e1) => {
                                    var org = User.findById(e.organizzatoreID), org1 = User.findById(e1.organizzatoreID);
                                    return org.valutazioneMedia < org1.valutazioneMedia;
                                });
                                console.log(events1);
                                res.status(200).json({ eventi: events1 });
                            } else {
                                res.status(404).json({ error: "Non sono presenti eventi organizzati." });
                            }
                        }
                    })
                    .catch(err => console.log(err));
            })
            .catch(err => {
                //Questo non è un token Google
                tVerify(token, process.env.SUPER_SECRET, (err, decoded) => {
                    console.log(err); //Tutto ok se il token è null, undefined o una stringa vuota, passiamo oltre.
                    if (!err) {
                        user = decoded.id;
                        events = events.filter(e => (!e.partecipantiID.includes(user) && e.organizzatoreID !== user));
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
                            if (!matched) {
                                res.status(400).json({ error: "Richiesta malformata." });
                            } else {
                                filterCondition(durata != undefined, events, e => e.durata == durata);
                                filterCondition(indirizzo != undefined && indirizzo != "", events, e => e.luogoEv.indirizzo == indirizzo);
                                filterCondition(citta != undefined && citta != "", events, e => e.luogoEv.citta == citta);

                                if (events.length > 0) {
                                    var events1 = map(events, "pub");
                                    events1.recensioni = events.recensioni; //Mostro le recensioni solo per quegli eventi a cui l'utente non è ancora iscritto

                                    //Ordina gli eventi ottenuti per valutazione media decrescente dell'utente organizzatore
                                    events1.sort((e, e1) => {
                                        var org = User.findById(e.organizzatoreID), org1 = User.findById(e1.organizzatoreID);
                                        return org.valutazioneMedia < org1.valutazioneMedia;
                                    });
                                    res.status(200).json({ eventi: events1 });
                                } else {
                                    res.status(404).json({ error: "Non sono presenti eventi organizzati." });
                                }
                            }
                        })
                        .catch(err => console.log(err));
                });
            });
    } else {
        filterCondition(nomeAtt != undefined && nomeAtt != "", events, e => e.nomeAtt.includes(nomeAtt));
        filterCondition(categoria != undefined && categoria != "", events, e => e.categoria == categoria);

        const v1 = new Validator({
            durata: durata
        }, {
            durata: 'integer|min:1',
        });
        v1.check()
            .then(matched => {
                if (!matched) {
                    res.status(400).json({ error: "Richiesta malformata." });
                } else {
                    filterCondition(durata != undefined, events, e => e.durata == durata);
                    filterCondition(indirizzo != undefined && indirizzo != "", events, e => e.luogoEv.indirizzo == indirizzo);
                    filterCondition(citta != undefined && citta != "", events, e => e.luogoEv.citta == citta);

                    if (events.length > 0) {
                        var events1 = map(events, "pub");
                        events1.recensioni = events.recensioni; //Mostro le recensioni solo per quegli eventi a cui l'utente non è ancora iscritto

                        //Ordina gli eventi ottenuti per valutazione media decrescente dell'utente organizzatore
                        events1.sort((e, e1) => {
                            var org = User.findById(e.organizzatoreID), org1 = User.findById(e1.organizzatoreID);
                            return org.valutazioneMedia < org1.valutazioneMedia;
                        });
                        res.status(200).json({ eventi: events1 });
                    } else {
                        res.status(404).json({ error: "Non sono presenti eventi organizzati." });
                    }
                }
            })
            .catch(err => console.log(err));
    }

});

router.get("/:data", async (req, res) => {
    var str = req.params.data.split("-").join("/"); //Il parametro "data" deve essere parte dell'URI sopra indicato se si vuole accedere a questa proprietà.    
    var events;
    var obj = {}, token = req.header("x-access-token");
    var autenticato = false;
    var user = "";

    if (token) {
        tVerify(token, process.env.SUPER_SECRET, function (err, decoded) {
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
        obj.eventi = map(events, "pub");
        obj.data = str;
        res.status(200).json(obj).send();
    } else {
        res.status(404).json({ error: "Non esiste alcun evento legato alla risorsa richiesta." }).send();
    }
});

export default router;