import { Router } from 'express';
var router = Router();
import { Validator } from 'node-input-validator';
import RateLimit from 'express-rate-limit';
import eventPublic from '../collezioni/eventPublic.mjs';
import eventPers from '../collezioni/eventPersonal.mjs';
import eventPriv from '../collezioni/eventPrivat.mjs';
import map from './eventsMap.mjs';
import User from '../collezioni/utenti.mjs';

var limiter = RateLimit ({
    windowMs: 1*60*1000, //1 minute
    max: 100, //Limit each IP to 10 requests per minute
    message: async () => "Hai raggiunto il numero massimo di richieste al minuto.",
    statusCode: 429
});

//Apply rate limiter to all requests
//Avoids Denial of Service attacks by limiting the number of requests per IP
router.use(limiter);

var getOrgNames = async events => {
    var orgNames = [];
    for(let e of events) {
        orgNames.push((await User.findById(e.organizzatoreID)).nome);
    }
    return orgNames;
}

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

        if(utent === req.loggedUser.id) {
            eventList = await eventPublic.find({organizzatoreID: {$eq: utent}, data: {$eq: data}});
            eventsPers = await eventPers.find({organizzatoreID: {$eq: utent}, data: {$eq: data}});
            eventsPriv = await eventPriv.find({organizzatoreID: {$eq: utent}, data: {$eq: data}});
        } else {
            eventList = await eventPublic.find({email: {$eq: req.loggedUser.email}, data: {$eq: data}});
            console.log("list: " + eventList);
            eventsPers = await eventPers.find({email: {$eq: req.loggedUser.email}, data: {$eq: data}});
            eventsPriv = await eventPriv.find({email: {$eq: req.loggedUser.email}, data: {$eq: data}});
        }

        if(eventList != null && eventList != undefined && eventList.length > 0) {
            eventList = map(eventList, "pub", getOrgNames(eventList));
        }

        if(eventsPers != null && eventsPers != undefined && eventsPers.length > 0) {
            eventsPers = map(eventsPers, "pers", getOrgNames(eventsPers));
            eventList.push(eventsPers);
        }
        if(eventsPriv != null && eventsPriv != undefined && eventsPriv.length > 0) {
            eventsPriv = map(eventsPriv, "priv", getOrgNames(eventsPriv));
            eventList.push(eventsPriv);
        }

        console.log(eventList);
        if(eventList != null && eventList != undefined && eventList.length > 0) {
            res.status(200).json({eventi: eventList}).send();
        } else {
            res.status(404).json({error: "Nessun evento organizzato da questo utente."}).send();
        }
    });
});

export default router;