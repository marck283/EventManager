import { Router } from 'express';
import RateLimit from 'express-rate-limit';
import eventPublic from '../collezioni/eventPublic.mjs';
const router = Router();
import map from './eventsMap.mjs';
import pkg from 'jsonwebtoken';
const tVerify = pkg.verify;
import { Validator } from 'node-input-validator';
import User from '../collezioni/utenti.mjs';
import verify from '../googleTokenChecker.mjs';
import getOrgNames from './OrgNames.mjs';

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
        arr = arr.filter(cb);
    }
};

var queryEvents = async (events, nomeAtt, categoria, durata, indirizzo, citta, orgName) => {
    const v1 = new Validator({
        durata: durata
    }, {
        durata: 'integer|min:1',
    });

    var events1 = null;

    const matched = await v1.check();
    if (!matched) {
        events1 = 1;
    } else {
        console.log("nomeAtt:", nomeAtt);
        filterCondition(nomeAtt != undefined && nomeAtt != "", events, e => e.nomeAtt.includes(nomeAtt));
        filterCondition(categoria != undefined && categoria != "", events, e => e.categoria == categoria);
        filterCondition(durata != undefined, events, e => e.durata == durata);
        filterCondition(indirizzo != undefined && indirizzo != "", events, e => e.luogoEv.filter(l => l.indirizzo == indirizzo).length > 0);
        filterCondition(citta != undefined && citta != "", events, e => e.luogoEv.filter(l => l.citta == citta).length > 0);
        filterCondition(orgName != null && orgName != "", events, e => e.orgName == orgName);

        //Filter for events happening in the future
        var curr = new Date();

        //Da reinserire quando sarà stata completata la funzionalità di creazione eventi nell'applicazione per Android
        /*events = events.filter(e => {
            e.luogoEv = e.luogoEv.filter(d => new Date(d.data + "Z" + d.ora) >= curr);
            console.log(e.luogoEv.length > 0);
            return e.luogoEv.length > 0;
        });*/
        

        if (events.length > 0) {
            events1 = await map(events, "pub", await getOrgNames(events));
            console.log("numPosti:", events1[0].luogoEv[0].numPostiRimanenti);
            events1.recensioni = events.recensioni; //Mostro le recensioni solo per quegli eventi a cui l'utente non è ancora iscritto

            //Ordina gli eventi ottenuti per valutazione media decrescente dell'utente organizzatore
            events1.sort((e, e1) => {
                var org = User.findById(e.organizzatoreID), org1 = User.findById(e1.organizzatoreID);
                return org.valutazioneMedia < org1.valutazioneMedia;
            });
            console.log(events1.length);
        } else {
            console.log("No events found");
        }
    }
    return events1;
};

var queryWrapper = async (res, events, nomeAtt, categoria, durata, indirizzo, citta) => {
    var events1 = await queryEvents(events, nomeAtt, categoria, durata, indirizzo, citta);

    if(events1 != 1 && events1 != null && events1 != undefined) {
        console.log("Events:", events1[0].luogoEv[0]);
    }
    
    if (events1 != null) {
        if (events1 != 1) {
            res.status(200).json({ eventi: events1 });
        } else {
            res.status(400).json({ error: "Richiesta malformata." });
        }
    } else {
        res.status(404).json({ error: "Non sono presenti eventi organizzati." });
    }
}

router.get("", async (req, res) => {
    var token = req.header('x-access-token');
    var user = "";

    var events = await eventPublic.find({});
    var nomeAtt = req.header("nomeAtt"), categoria = req.header("categoria"), durata = req.header("durata");
    var indirizzo = req.header("indirizzo"), citta = req.header("citta"), orgName = req.header("orgName");

    console.log("nomeAtt1:", nomeAtt);

    //Aggiungere controllo per token != null
    if (token != undefined && token != null && token != "") {
        //Test per token Google
        await verify.verify(token)
            .then(async ticket => {
                //Questo è un token Google valido
                user = ticket.getPayload().email;
                const utente = await User.findOne({ email: { $eq: user } });
                events = events.filter(e => (e.luogoEv.filter(l => !l.partecipantiID.includes(utente.id)) && e.organizzatoreID !== utente.id));

                queryWrapper(res, events, nomeAtt, categoria, durata, indirizzo, citta, orgName);
            })
            .catch(err => {
                //Questo non è un token Google
                tVerify(token, process.env.SUPER_SECRET, (err, decoded) => {
                    console.log(err); //Tutto ok se il token è null, undefined o una stringa vuota, passiamo oltre.
                    if (!err) {
                        user = decoded.id;
                        events = events.filter(e => (e.luogoEv.filter(l => !l.partecipantiID.includes(user)) && e.organizzatoreID !== user));
                    }

                    queryWrapper(res, events, nomeAtt, categoria, durata, indirizzo, citta, orgName);
                });
            });
    } else {
        queryWrapper(res, events, nomeAtt, categoria, durata, indirizzo, citta, orgName);
    }
});

var mapEvents = token => new Promise((resolve, reject) => {
    try {
        return resolve(tVerify(token, process.env.SUPER_SECRET));
    } catch (err) {
        return reject();
    }
});

var setResponse = async (res, events, str) => {
    if (events.length > 0) {
        var orgNames = await getOrgNames(events);
        var eventsAss = map(events, "pub", orgNames);
        res.status(200).json({
            eventi: eventsAss,
            data: str
        }).send();
    } else {
        res.status(404).json({ error: "Non esiste alcun evento legato alla risorsa richiesta." });
    }
    return;
}

router.get("/:data", async (req, res) => {
    var str = req.params.data; //Il parametro "data" deve essere parte dell'URI sopra indicato se si vuole accedere a questa proprietà.    
    var events = [], token = req.header("x-access-token");

    events = await eventPublic.find({});
    if (events.length == 0) {
        res.status(404).json({ error: "Non esiste alcun evento legato alla risorsa richiesta." });
        return;
    }
    events = events.filter(e => e.luogoEv.filter(l => {
        var d = new Date(l.data);
        return str == (d.getMonth() + 1).toString().padStart(2, '0') + "-" + d.getDate().toString().padStart(2, '0') + "-" + d.getFullYear();
    }).length > 0);

    if (token) {
        await mapEvents(token)
            .then(async decoded => {
                events = events.filter(e => e.luogoEv.filter(l => l.partecipantiID.length == 0 || !l.partecipantiID.includes(decoded.id)).length > 0);
                await setResponse(res, events, str);
            })
            .catch(async err => {
                console.log(err);
                //Token non valido; tentiamo con la verifica di Google
                await verify.verify(token)
                    .then(async ticket => {
                        events = events.filter(async e => (!e.partecipantiID.includes(await User.find({
                            email: { $eq: ticket.getPayload().email }
                        }).id)));
                        await setResponse(res, events, str);
                    });
            });
    } else {
        await setResponse(res, events, str);
    }
    return;
});

export default router;