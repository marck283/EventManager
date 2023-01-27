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

var limiter = RateLimit ({
    windowMs: 1*60*1000, //1 minute
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
    if(arr != null && arr != undefined && arr.length > 0) {
        let events = map(arr, cat, await getOrgNames(arr));
        events.forEach(e => genArr.push(e));
    }

    console.log(genArr);

    return genArr;
};

router.get("/:data", async (req, res) => {
    var data = req.params.data;
    const v = new Validator({
        utent: req.loggedUser.id || req.loggedUser.sub
    }, {
        utent: 'required|string|minLength:1'
    });
    v.check()
    .then(async matched => {
        if(!matched) {
            res.status(400).json({error: "Richiesta malformata."});
            return;
        }
        var utent = req.loggedUser.id || req.loggedUser.sub, eventList, eventsPers, eventsPriv;
        let obj;

        if(utent === req.loggedUser.id) {
            obj = {organizzatoreID: {$eq: utent}};
        } else {
            utent = await User.findOne({email: {$eq: req.loggedUser.email}});
            console.log(utent);
            obj = {organizzatoreID: {$eq: utent.id}};
        }
        eventList = await findEvents(eventPublic, obj, data);
        eventsPers = await findEvents(eventPers, obj, data);
        eventsPriv = await findEvents(eventPriv, obj, data);

        eventList = await mapAndPush(eventList, [], "pub");
        eventList = await mapAndPush(eventsPers, eventList, "pers");
        eventList = await mapAndPush(eventsPriv, eventList, "priv");

        if(eventList != null && eventList != undefined && eventList.length > 0) {
            res.status(200).json({eventi: eventList}).send();
        } else {
            res.status(404).json({error: "Nessun evento organizzato da questo utente."}).send();
        }
    });
});

export default router;