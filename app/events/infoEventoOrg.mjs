import { Router } from 'express';
var router = Router();
import RateLimit from 'express-rate-limit';
import eventPublic from '../collezioni/eventPublic.mjs';
import eventPriv from '../collezioni/eventPrivat.mjs';
import map from './eventsMap.mjs';
import User from '../collezioni/utenti.mjs';
import getOrgNames from './OrgNames.mjs';

var limiter = RateLimit ({
    windowMs: 1*10*1000, //10 seconds
    max: 10, //Limit each IP to 10 requests every 10 seconds
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

    var pubEvent = await eventPublic.findById(req.params.id);
    var privEvent = await eventPriv.findById(req.params.id);

    if(pubEvent != undefined) {
        res.status(200).json({event: await map([pubEvent], "pub", [pubEvent.orgName])[0]});
    } else {
        let orgName;
        if(privEvent != undefined) {
            orgName = await getOrgNames([privEvent]);
            res.status(200).json({event: await map([privEvent], "priv", orgName)[0]});
        } else {
            res.status(404).json({error: "Evento non trovato."});
        }
    }

    return;
});

export default router;