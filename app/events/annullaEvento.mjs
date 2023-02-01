import { Router } from 'express';
import RateLimit from 'express-rate-limit';
const router = Router();
import eventPublic from '../collezioni/eventPublic.mjs';
import eventPrivat from '../collezioni/eventPrivat.mjs';
import User from '../collezioni/utenti.mjs';

var limiter = RateLimit({
    windowMs: 1 * 60 * 1000, //1 minute
    max: 100, //Limit each IP to 10 requests per minute
    message: async () => "Hai raggiunto il numero massimo di richieste al minuto.",
    statusCode: 429
});

//Apply rate limiter to all requests
//Avoids Denial of Service attacks by limiting the number of requests per IP
router.use(limiter);

router.delete("/:id", async (req, res) => {
    var userId = req.loggedUser.id || req.loggedUser.sub, eventId = req.params.id;

    const publicEv = await eventPublic.findById(eventId);
    const privEv = await eventPrivat.findById(eventId);

    if((publicEv == null || publicEv == undefined) && (privEv == null || privEv == undefined)) {
        res.status(404).json({error: "Evento non trovato."}).send();
        return;
    }

    if(userId === req.loggedUser.sub) {
        userId = (await User.findOne({email: {$eq: req.loggedUser.email}})).id;
    }

    if(publicEv != null && publicEv != undefined) {
        await publicEv.delete();
        res.status(200).json({message: "Evento eliminato con successo."}).send();
        return;
    }

    if(privEv != null && privEv != undefined) {
        await privEv.delete();
        res.status(200).json({message: "Evento eliminato con successo."}).send();
        return;
    }
});

export default router;