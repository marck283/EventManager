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

var findEvents = async id => {
    let eventoPub = await eventPublic.findById(id), eventoPriv = await eventPriv.findById(id);
    let eventoPers = await eventPers.findById(id);

    if(eventoPub != null && eventoPub != undefined) {
        return {event: await map([eventoPub], "pub", [eventoPub.orgName])[0]};
    }
    if(eventoPriv != null && eventoPriv != undefined) {
        return {event: await map([eventoPriv], "priv", await getOrgNames([eventoPriv])[0])[0]};
    }
    if(eventoPers != null && eventoPers != undefined) {
        return {event: await map([eventoPers], "pers", await getOrgNames([eventoPers])[0])[0]};
    }
    return;
};

router.get("/:id", async (req, res) => {
    let user = req.loggedUser.id || req.loggedUser.sub;

    if(user === req.loggedUser.sub) {
        user = (await User.findOne({email: {$eq: req.loggedUser.email}})).id;
    }

    let event = await findEvents(req.params.id);
    if(event != null && event != undefined) {
        res.status(200).json({event: event}).send();
    } else {
        res.status(404).json({error: "Evento non trovato"}).send();
    }
});

export default router;