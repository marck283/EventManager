import { Router } from 'express';
var router = Router();
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

router.get("/:id", async (req, res) => {
    var utent = req.loggedUser.id || req.loggedUser.sub;

    if(utent === req.loggedUser.sub) {
        utent = (await User.findOne({email: {$eq: req.loggedUser.email}})).id;
    }

    var pubEvent = await eventPublic.findOne({id: {$eq: req.params.id}, organizzatoreID: {$eq: utent}});
    var privEvent = await eventPriv.findOne({id: {$eq: req.params.id}, organizzatoreID: {$eq: utent}});
    var persEvent = await eventPers.findOne({id: {$eq: req.params.id}, organizzatoreID: {$eq: utent}});

    if(pubEvent != null && pubEvent != undefined) {
        res.status(200).json({event: map([pubEvent], "pub", getOrgNames([pubEvent]))});
    } else {
        if(privEvent != null && privEvent != undefined) {
            res.status(200).json({event: map([privEvent], "priv", getOrgNames([privEvent]))});
        } else {
            if(persEvent != null && persEvent != undefined) {
                res.status(200).json({event: map([persEvent], "pers", getOrgNames([persEvent]))});
            } else {
                res.status(404).json({error: "Evento non trovato."});
            }
        }
    }

    return;
});

export default router;