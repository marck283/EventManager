import eventPublic from '../collezioni/eventPublic.mjs';
import eventPersonal from '../collezioni/eventPersonal.mjs';
import eventPrivate from '../collezioni/eventPrivat.mjs';
import map from '../events/eventsMap.mjs';
import User from '../collezioni/utenti.mjs';
import getOrgNames from '../events/OrgNames.mjs';
import returnUser from '../findUser.mjs';

var findEvents = async (eventType, user) => await eventType.find({ $or: [{ "luogoEv.partecipantiID": { $in: [user] } }, { "organizzatoreID": { $eq: user } }] });

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

var filterAndListPersonalEvents = async (req, res) => {
    var eventsPers = [], eventsPub = [], eventsPriv = [];
    var user = req.loggedUser.id || req.loggedUser.sub;
    var nomeAtt = req.headers?.nomeAtt, categoria = req.headers?.categoria, durata = req.headers?.durata;
    var indirizzo = req.headers?.indirizzo, citta = req.headers?.citta;

    if (user === req.loggedUser.sub) {
        //Se l'utente è autenticato con Google, allora devo prima trovare il documento dell'utente nel database, per poi
        //ottenere l'id di MongoDB e utilizzarlo per cercare gli eventi pubblici a cui l'utente è iscritto.
        user = (await User.findOne({ email: { $eq: req.loggedUser.email } })).id;
    }

    eventsPers = await eventPersonal.find({ "organizzatoreID": { $eq: user } }); //Richiedi gli eventi personali.
    eventsPub = await findEvents(eventPublic, user);
    eventsPriv = await findEvents(eventPrivate, user);

    let events = arrFilter([eventsPers, eventsPub, eventsPriv], [{
        cond: nomeAtt != undefined,
        cb: e1 => e1.nomeAtt.includes(nomeAtt)
    }, {
        cond: categoria != undefined,
        cb: e1 => e1.categoria == categoria
    }, {
        cond: durata != undefined,
        cb: e1 => e1.durata == durata
    }, {
        cond: indirizzo != undefined,
        cb: e1 => e1.luogoEv.indirizzo == indirizzo
    }, {
        cond: citta != undefined,
        cb: e1 => e1.luogoEv.citta == citta
    }]);
    eventsPers = events[0];
    eventsPub = events[1];
    eventsPriv = events[2];

    var passato = req.query.passato;
    if (passato == "false") {
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
};

var filterLuogoEv = e => e.luogoEv != undefined && e.luogoEv.length > 0;

var findEvent = async (e, eventsPers, eventsPub, eventsPriv, str, userId) => {
    var obj = { _id: { $eq: new mongoose.Types.ObjectId(e) }, "luogoEv.data": { $eq: str }, "luogoEv.partecipantiID": { $in: [userId] } };
    var org = { _id: { $eq: new mongoose.Types.ObjectId(e) }, "luogoEv.data": { $eq: str }, organizzatoreID: { $eq: userId } };
    let pers = eventPersonal.find(org);
    let pub = eventPublic.find(obj);
    let priv = eventPrivate.find(obj);

    let persVal = await pers, pubVal = await pub, privVal = await priv;
    if (persVal != undefined && persVal[0] != undefined && filterLuogoEv(persVal[0])) {
        eventsPers.push(persVal[0]);
    }

    if (pubVal != undefined && pubVal[0] != undefined && filterLuogoEv(pubVal[0])) {
        eventsPub.push(pubVal[0]);
    }

    if (privVal != undefined && privVal[0] != undefined && filterLuogoEv(privVal[0])) {
        eventsPriv.push(privVal[0]);
    } else {
        console.log("uh oh");
    }
    return;
};

var listPersonalEventsByData = async (req, res) => {
    var str = req.params.data;

    console.log("data:", str);

    var eventsPers = [], eventsPub = [], eventsPriv = [], user1 = await returnUser(req);

    for (let e of user1.EventiIscrtto) {
        await findEvent(e, eventsPers, eventsPub, eventsPriv, str, user1.id);
    }
    console.log(eventsPers.length, eventsPub.length, eventsPriv.length);

    if (eventsPers.length == 0 && eventsPub.length == 0 && eventsPriv.length == 0) {
        res.status(404).json({ error: "Non esiste alcun evento programmato per la giornata selezionata." });
        return;
    }
    eventsPub = map(eventsPub, "pub", await getOrgNames(eventsPub));
    eventsPriv = map(eventsPriv, "priv", await getOrgNames(eventsPriv));

    let eventsPersVal = eventsPers, eventsPubVal = await eventsPub, eventsPrivVal = await eventsPriv;
    for (let e of eventsPubVal) {
        eventsPersVal.push(e);
    }
    for (let e of eventsPrivVal) {
        eventsPersVal.push(e);
    }
    res.status(200).json({ eventi: eventsPersVal, data: str });
};

export { filterAndListPersonalEvents, listPersonalEventsByData };