import { Router } from 'express';
var router = Router();
import { Validator } from 'node-input-validator';
import RateLimit from 'express-rate-limit';
import eventPublic from '../collezioni/eventPublic.mjs';
import eventPers from '../collezioni/eventPersonal.mjs';
import eventPriv from '../collezioni/eventPrivat.mjs';
import map from './eventsMap.mjs';
import User from '../collezioni/utenti.mjs';
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

var findEvents = async (arr, obj, data) => {
    let events = await arr.find(obj);
    return events.filter(e => e.luogoEv.filter(l => data == l.data).length > 0);
};

var mapAndPush = async (arr, genArr, cat) => {
    if (arr != null && arr != undefined && arr.length > 0) {
        let events = map(arr, cat, await getOrgNames(arr));
        events.forEach(e => genArr.push(e));
    }

    console.log(genArr);

    return genArr;
};

router.get("/:data", async (req, res) => {
    var data = req.params.data;
    var utent = req.loggedUser.id || req.loggedUser.sub, eventList, eventsPers, eventsPriv;
    let obj;

    console.log("User1:", utent);
    if (utent !== req.loggedUser.id) {
        utent = (await User.findOne({ email: { $eq: req.loggedUser.email } })).id;
    }
    obj = { organizzatoreID: { $eq: utent } };

    eventList = await findEvents(eventPublic, obj, data);
    eventsPers = await findEvents(eventPers, obj, data);
    eventsPriv = await findEvents(eventPriv, obj, data);

    eventList = await mapAndPush(eventList, [], "pub");
    eventList = await mapAndPush(eventsPers, eventList, "pers");
    eventList = await mapAndPush(eventsPriv, eventList, "priv");

    if (eventList != null && eventList != undefined && eventList.length > 0) {
        res.status(200).json({ eventi: eventList }).send();
    } else {
        res.status(404).json({ error: "Nessun evento organizzato da questo utente." }).send();
    }
});

router.get("", async (req, res) => {
    var utent = req.loggedUser.id || req.loggedUser.sub;

    if (utent !== req.loggedUser.id) {
        utent = (await User.findOne({ email: { $eq: req.loggedUser.email } })).id;
    }
    obj = { organizzatoreID: { $eq: utent } };

    let eventsPub = await eventPublic.find(obj), eventsPriv = await eventPriv.find(obj),
        eventsPers = await eventPers.find(obj), events = [];

    eventsPub = eventsPub.filter(e => e.luogoEv.filter(l => l.data >= new Date()).length > 0);
    eventsPers = eventsPers.filter(e => e.luogoEv.filter(l => l.data >= new Date()).length > 0);
    eventsPriv = eventsPriv.filter(e => e.luogoEv.filter(l => l.data >= new Date()).length > 0);
    
    eventsPub = await mapAndPush(eventsPub, [], "pub");
    eventsPers = await mapAndPush(eventsPers, eventsPub, "pers");
    events = await mapAndPush(eventsPriv, eventsPers, "priv");

    if (events != null && events != undefined && events.length > 0) {
        res.status(200).json({ eventi: events }).send();
    } else {
        res.status(404).json({ error: "Nessun evento organizzato da questo utente." }).send();
    }
});

export default router;