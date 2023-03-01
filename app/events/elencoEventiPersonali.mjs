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

var filterArr = e => e.luogoEv != undefined && e.luogoEv.length > 0;

var findEvent = async (e, eventsPers, eventsPub, eventsPriv, str, userId) => {
    var obj = {_id: {$eq: mongoose.Types.ObjectId(e)}, "luogoEv.data": {$eq: str}, $in: [userId, "$partecipantiID"]};
    let pers = eventPersonal.find(obj);
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

var findPubEvents = async (user) => {
    var eventsPub = await eventPublic.find({});

    //Il motivo per cui qui non restituisce nulla nel caso in cui un utente sia autenticato con Google potrebbe essere che,
    //all'iscrizione dell'utente all'evento, non utilizzo il campo "sub" ma l'id di MongoDB?
    //In tal caso, il problema si potrebbe risolvere semplicemente usando il campo "sub" sia qui che per l'iscrizione all'evento...
    eventsPub = eventsPub.filter(e => (e.luogoEv.filter(l => l.partecipantiID.includes(user)) || e.organizzatoreID == user));
    return eventsPub;
};

var filterEvents = (eventsArr, passato) => {
    var curr = new Date();
    if (passato) {
        return eventsArr.filter(e => new Date(e.data + "Z" + e.ora) < curr);
    }
    return eventsArr.filter(e => new Date(e.data + "Z" + e.ora) >= curr);
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

    eventsPers = await eventPersonal.find({ organizzatoreID: { $eq: user } }); //Richiedi gli eventi personali.
    eventsPub = await findPubEvents(user);
    eventsPriv = await eventPrivate.find({$or: [{organizzatoreID: {$eq: user}}, {$in: [user, '$partecipantiID']}]});
    //eventsPriv = eventsPriv.filter(e => (e.partecipantiID.includes(user) || e.organizzatoreID == user));

    const v = new Validator({
        durata: durata,
        passato: req.query.passato
    }, {
        durata: 'integer|min:1',
        passato: 'required|string|in:True,False'
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

            switch (req.query.passato) {
                case "True": {
                    //Filtro per date passate
                    eventsPers = filterEvents(eventsPers, true);
                    eventsPub = filterEvents(eventsPub, true);
                    eventsPriv = filterEvents(eventsPriv, true);
                    break;
                }
                case "False": {
                    eventsPub = filterEvents(eventsPub, false);
                    eventsPriv = filterEvents(eventsPriv, false);
                    break;
                }
            }

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