import { Router } from 'express';
import eventPublic from '../collezioni/eventPublic.mjs';
import eventPersonal from '../collezioni/eventPersonal.mjs';
import eventPrivate from '../collezioni/eventPrivat.mjs';
const router = Router();
import map from './eventsMap.mjs';
import { Validator } from 'node-input-validator';
import User from '../collezioni/utenti.mjs';
import getOrgNames from './OrgNames.mjs';
import returnUser from '../findUser.mjs';
import mongoose from 'mongoose';
import RateLimit from 'express-rate-limit';

var limiter = RateLimit({
    windowMs: 1 * 20 * 1000, //20 seconds
    max: 10, //Limit each IP to a certain number of requests per 20 seconds
    message: async () => "Hai raggiunto il numero massimo di richieste al minuto.",
    statusCode: 429
});

//Apply rate limiter to all requests
//Avoids Denial of Service attacks by limiting the number of requests per IP
router.use(limiter);

var filterArr = e => e.luogoEv != undefined && e.luogoEv.length > 0;

var findEvent = async (e, eventsPers, eventsPub, eventsPriv, str, userId) => {
    var obj = {_id: {$eq: new mongoose.Types.ObjectId(e)}, "luogoEv.data": {$eq: str}, "luogoEv.partecipantiID": {$in: [userId]}};
    var org = {_id: {$eq: new mongoose.Types.ObjectId(e)}, "luogoEv.data": {$eq: str}, organizzatoreID: {$eq: userId}};
    let pers = eventPersonal.find(org);
    let pub = eventPublic.find(obj);
    let priv = eventPrivate.find(obj);
    
    let persVal = await pers, pubVal = await pub, privVal = await priv;
    if (persVal != undefined && persVal[0] != undefined && filterArr(persVal[0])) {
        eventsPers.push(persVal[0]);
    }

    if (pubVal != undefined && pubVal[0] != undefined && filterArr(pubVal[0])) {
        eventsPub.push(pubVal[0]);
    }

    if (privVal != undefined && privVal[0] != undefined && filterArr(privVal[0])) {
        eventsPriv.push(privVal[0]);
    } else {
        console.log("uh oh");
    }
    return;
}

router.get("/:data", async (req, res) => {
    var str = req.params.data; //Il parametro "data" deve essere parte dell'URI sopra indicato se si vuole accedere a questa proprietà.

    if (str == "Invalid Date") {
        res.status(400).json({ error: "Data non valida" });
        return;
    }

    console.log("data:", str);

    var eventsPers = [], eventsPub = [], eventsPriv = [], user1 = await returnUser(req);

    for (let e of user1.EventiIscrtto) {
        await findEvent(e, eventsPers, eventsPub, eventsPriv, str, user1.id);
    }
    console.log(eventsPers.length, eventsPub.length, eventsPriv.length);

    if (eventsPers.length > 0 || eventsPub.length > 0 || eventsPriv.length > 0) {
        eventsPub = map(eventsPub, "pub", await getOrgNames(eventsPub));
        eventsPriv = map(eventsPriv, "priv", await getOrgNames(eventsPriv));

        let eventsPersVal = eventsPers, eventsPubVal = await eventsPub, eventsPrivVal = await eventsPriv;
        for(let e of eventsPubVal) {
            eventsPersVal.push(e);
        }
        for(let e of eventsPrivVal) {
            eventsPersVal.push(e);
        }
        res.status(200).json({ eventi: eventsPersVal, data: str });
    } else {
        res.status(404).json({ error: "Non esiste alcun evento programmato per la giornata selezionata." });
    }
    return; //This, along with the elimination of the "send()" call, should avoid the "[ERR_HTTP_HEADERS_SENT]" errors.
});

var findEvents = async (eventType, user) => await eventType.find({$or: [{"luogoEv.partecipantiID": {$in: [user]}}, {"organizzatoreID": {$eq: user}}]});

var filterEvents = (eventsArr, passato) => {
    var curr = new Date();
    if (passato) {
        return eventsArr.filter(e => e.luogoEv.filter(l => new Date(l.data + "Z" + l.ora) < curr).length > 0);
    }
    return eventsArr.filter(e => e.luogoEv.filter(l => new Date(l.data + "Z" + l.ora) >= curr).length > 0);
};

/**
 * This function filters an array of arrays of events by the conditions that the user has specified as parameter.
 * The parameters of the object that specifies the conditions upon which to filter the events are:
 * - cond: the condition to verify in order to filter the events. It can be any boolean value;
 * - cb: the callback function that will be executed if the condition is verified. It must contain a condition that relates to the object that is being filtered. 
 * @param {Array<Array<>>} val The array of arrays to filter
 * @param {Array<Object>} arr The array of conditions to filter the events, together with a callback function that specifies the conditions to filter the elements of an array.
 * @returns The filtered array of arrays of events
 */
var arrFilter = (val, arr) => {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].cond) {
            for (let j = 0; j < val.length; j++) {
                val[j].filter(arr[i].cb);
            }
        }
    }

    return val;
}

router.get("", async (req, res) => {
    var eventsPers = [], eventsPub = [], eventsPriv = [];
    var user = req.loggedUser.id || req.loggedUser.sub;
    var nomeAtt = req.header("nomeAtt"), categoria = req.header("categoria"), durata = req.header("durata");
    var indirizzo = req.header("indirizzo"), citta = req.header("citta");

    if (user === req.loggedUser.sub) {
        //Se l'utente è autenticato con Google, allora devo prima trovare il documento dell'utente nel database, per poi
        //ottenere l'id di MongoDB e utilizzarlo per cercare gli eventi pubblici a cui l'utente è iscritto.
        user = (await User.findOne({ email: { $eq: req.loggedUser.email } })).id;
    }

    eventsPers = await eventPersonal.find({ "organizzatoreID": { $eq: user } }); //Richiedi gli eventi personali.
    eventsPub = await findEvents(eventPublic, user);
    eventsPriv = await findEvents(eventPrivate, user);

    const v = new Validator({
        durata: durata,
        passato: req.query.passato
    }, {
        durata: 'integer|min:1',
        passato: 'required|boolean|in:true,false'
    });
    v.check()
        .then(matched => {
            if (!matched) {
                res.status(400).json({ error: "Richiesta malformata." }).send();
                return;
            }

            let events = arrFilter([eventsPers, eventsPub, eventsPriv], [{
                cond: nomeAtt != undefined && nomeAtt != "",
                cb: e1 => e1.nomeAtt.includes(nomeAtt)
            }, {
                cond: categoria != undefined && categoria != "",
                cb: e1 => e1.categoria == categoria
            }, {
                cond: durata != undefined && durata != "",
                cb: e1 => e1.durata == durata
            }, {
                cond: indirizzo != undefined && indirizzo != "",
                cb: e1 => e1.luogoEv.indirizzo == indirizzo
            }, {
                cond: citta != undefined && citta != "",
                cb: e1 => e1.luogoEv.citta == citta
            }]);
            eventsPers = events[0];
            eventsPub = events[1];
            eventsPriv = events[2];

            var passato = req.query.passato;
            if(passato == "false") {
                passato == "";
            }
            eventsPers = filterEvents(eventsPers, Boolean(passato));
            eventsPub = filterEvents(eventsPub, Boolean(passato));
            eventsPriv = filterEvents(eventsPriv, Boolean(passato));

            if (eventsPers.length > 0 || eventsPub.length > 0 || eventsPriv.length > 0) {
                eventsPers = map(eventsPers, "pers", getOrgNames(eventsPers));
                eventsPub = map(eventsPub, "pub", getOrgNames(eventsPub));
                eventsPub.forEach(e => eventsPers.push(e));
                eventsPriv = map(eventsPriv, "priv", getOrgNames(eventsPriv));
                eventsPriv.forEach(e => eventsPers.push(e));

                res.status(200).json({ eventi: eventsPers });
            } else {
                res.status(404).json({ error: "Non esiste alcun evento programmato." });
            }
        });
});

export default router;