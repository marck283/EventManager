import { Router } from 'express';
var router = Router();
import RateLimit from 'express-rate-limit';
import eventPublic from '../collezioni/eventPublic.mjs';
import eventPriv from '../collezioni/eventPrivat.mjs';
import map from './eventsMap.mjs';
import getOrgNames from './OrgNames.mjs';
import { Validator } from 'node-input-validator';

var limiter = RateLimit({
    windowMs: 1 * 20 * 1000, //20 seconds
    max: 1, //Limit each IP to 1 request per 20 seconds
    message: async () => "Hai raggiunto il numero massimo di richieste al minuto.",
    statusCode: 429
});

//Apply rate limiter to all requests
//Avoids Denial of Service attacks by limiting the number of requests per IP
router.use(limiter);

var findEvents = async (arr, obj) => {
    let events = await arr.find(obj);
    return events.filter(e => e.luogoEv != null && e.luogoEv != undefined && e.luogoEv.length > 0);
};

var mapAndPush = async (arr, genArr, cat) => {
    if (arr != null && arr != undefined && arr.length > 0) {
        let events = await map(arr, cat, await getOrgNames(arr));
        for (let e of events) {
            genArr.push(e);
        }
    }

    return genArr;
};

router.get("/:data", async (req, res) => {
    let data = req.params.data, utent = req.loggedUser.id, eventList, eventsPriv;
    let obj = { organizzatoreID: { $eq: utent }, "luogoEv.data": { $eq: data } };

    eventList = findEvents(eventPublic, obj);
    eventsPriv = findEvents(eventPriv, obj);

    eventList = await mapAndPush(await eventList, [], "pub");
    eventList = await mapAndPush(await eventsPriv, eventList, "priv");
    eventsPriv = null;
    obj = null;
    utent = null;

    if (eventList != null && eventList != undefined && eventList.length > 0) {
        res.status(200).json({ eventi: eventList, data: data }).send();
    } else {
        res.status(404).json({ error: "Nessun evento organizzato da questo utente." }).send();
    }
    data = null;
    eventList = null;
    utent = null;
    return;
});

router.get("", async (req, res) => {
    var utent = req.loggedUser.id;

    const v = new Validator({
        nome: req.headers.name
    }, {
        nome: 'string|minLength:1'
    });
    v.check()
        .then(async matched => {
            if (!matched) {
                res.status(400).json({ error: "Richiesta malformata." }).send();
                return;
            }

            let obj = { organizzatoreID: { $eq: utent }, "luogoEv.terminato": {$eq: false} };
            if(req.headers.name != undefined && req.headers.name != null && req.headers.name != "") {
                obj.nomeAtt = {$eq: req.headers.name};
            }
 
            let eventsPub = findEvents(eventPublic, obj),
                eventsPriv = findEvents(eventPriv, obj),
                events = [];

            eventsPub = await mapAndPush(await eventsPub, [], "pub");
            events = await mapAndPush(await eventsPriv, eventsPub, "priv");

            if (events != undefined && events.length > 0) {
                res.status(200).json({ eventi: events }).send();
            } else {
                res.status(404).json({ error: "Nessun evento organizzato da questo utente." }).send();
            }
            eventsPub = null;
            eventsPriv = null;
            events = null;
            obj = null;
            utent = null;
        });

    return;
});

export default router;