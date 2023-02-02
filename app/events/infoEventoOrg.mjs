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

    var pubEvent = await eventPublic.findById(req.params.id);
    var privEvent = await eventPriv.findById(req.params.id);
    var persEvent = await eventPers.findById(req.params.id);

    //Qui c'è di sicuro un errore... provare a stampare il risultato di map...
    if(pubEvent != null && pubEvent != undefined) {
        //console.log("pub:", await map([pubEvent], "pub", [pubEvent.orgName])[0]);
        res.status(200).json({event: await map([pubEvent], "pub", [pubEvent.orgName])[0]});
    } else {
        let orgName;
        if(privEvent != null && privEvent != undefined) {
            orgName = await getOrgNames([privEvent]);
            //console.log("priv:", await map([privEvent], "priv", orgName)[0]);
            res.status(200).json({event: await map([privEvent], "priv", orgName)}[0]);
        } else {
            if(persEvent != null && persEvent != undefined) {
                orgName = (await getOrgNames([persEvent]))[0];
                //console.log("pers:", await map([persEvent], "pers", orgName)[0]);
                res.status(200).json({ event: await map([persEvent], "pers", orgName)[0] });
            } else {
                res.status(404).json({error: "Evento non trovato."});
            }
        }
    }

    return;
});

export default router;