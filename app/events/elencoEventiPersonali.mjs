import { Router } from 'express';
import eventPublic from '../collezioni/eventPublic.mjs';
import eventPersonal from '../collezioni/eventPersonal.mjs';
import eventPrivate from '../collezioni/eventPrivat.mjs';
const router = Router();
import map from './eventsMap.mjs';
import { Validator } from 'node-input-validator';
import User from '../collezioni/utenti.mjs';
import getOrgNames from './OrgNames.mjs';

var filterArr = (e, str) => e.dataOra.filter(d => d.toISOString().split("T").includes(str.split("T")[0])).length > 0;

function isEmpty(o) {
    for(var i in o){
        if(o.hasOwnProperty(i)) {
            return false;
        }
    }
    return true;
}

var findEvent = async (e, eventsPers, eventsPub, eventsPriv, str) => {
    let pers = await eventPersonal.findById(e);
    let pub = await eventPublic.findById(e);
    let priv = await eventPrivate.findById(e);
    
    if (pers != null && pers != undefined && !isEmpty(pers) && filterArr(pers, str)) {
        eventsPers.push(pers);
    }

    if (pub != null && pub != undefined && !isEmpty(pub) && filterArr(pub, str)) {
        eventsPub.push(pub);
    }

    if (priv != null && priv != undefined && !isEmpty(priv)) {
        if (filterArr(priv, str)) {
            eventsPriv.push(priv);
        }
    } else {
        console.log("uh oh");
    }
    return;
}

router.get("/:data", async (req, res) => {
    var str = new Date(req.params.data); //Il parametro "data" deve essere parte dell'URI sopra indicato se si vuole accedere a questa proprietà.

    if (str == "Invalid Date") {
        res.status(400).json({ error: "Data non valida" });
        return;
    }
    str.setDate(str.getDate() + 1);
    str = str.toISOString();

    var eventsPers = [], eventsPub = [], eventsPriv = [];

    var user = req.loggedUser.id || req.loggedUser.sub, user1;
    if (user === req.loggedUser.sub) {
        user1 = await User.findOne({ email: { $eq: req.loggedUser.email } });
    } else {
        user1 = await User.findById(user);
    }

    for (let e of user1.EventiCreati) {
        await findEvent(e, eventsPers, eventsPub, eventsPriv, str);
    }

    for (let e of user1.EventiIscrtto) {
        await findEvent(e, eventsPers, eventsPub, eventsPriv, str);
    }
    console.log(eventsPers.length, eventsPub.length, eventsPriv.length);

    if (eventsPers.length > 0 || eventsPub.length > 0 || eventsPriv.length > 0) {
        eventsPers = map(eventsPers, "pers", await getOrgNames(eventsPers));
        eventsPub = map(eventsPub, "pub", await getOrgNames(eventsPub));
        eventsPriv = map(eventsPriv, "priv", await getOrgNames(eventsPriv));
        eventsPub.forEach(e => eventsPers.push(e));
        eventsPriv.forEach(e => eventsPers.push(e));
        res.status(200).json({ eventi: eventsPers, data: str });
    } else {
        res.status(404).json({ error: "Non esiste alcun evento programmato per la giornata selezionata." });
    }
    return; //This, along with the elimination of the "send()" call, should avoid the "[ERR_HTTP_HEADERS_SENT]" errors.
});

var findPubEvents = async (user) => {
    var eventsPub = await eventPublic.find({});

    //Il motivo per vui qui non restituisce nulla nel caso in cui un utente sia autenticato con Google potrebbe essere che,
    //all'iscrizione dell'utente all'evento, non utilizzo il campo "sub" ma l'id di MongoDB?
    //In tal caso, il problema si potrebbe risolvere semplicemente usando il campo "sub" sia qui che per l'iscrizione all'evento...
    eventsPub = eventsPub.filter(e => (e.partecipantiID.includes(user) || e.organizzatoreID == user));
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
        user = await User.findOne({ email: { $eq: req.loggedUser.email } });
        user = user.id;
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