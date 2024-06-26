import { Router } from 'express';
import RateLimit from 'express-rate-limit';
const router = Router();
import eventPublic from '../collezioni/eventPublic.mjs';
import eventPrivat from '../collezioni/eventPrivat.mjs';
import User from '../collezioni/utenti.mjs';
import biglietti from '../collezioni/biglietti.mjs';
import recensioniPub from '../collezioni/recensioniPub.mjs';

var limiter = RateLimit({
    windowMs: 1 * 60 * 1000, //1 minute
    max: 10, //Limit each IP to 10 requests per minute
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

    if(publicEv == undefined && privEv == undefined) {
        res.status(404).json({error: "Evento non trovato."}).send();
        return;
    }

    if(userId === req.loggedUser.sub) {
        userId = (await User.findOne({email: {$eq: req.loggedUser.email}})).id;
    }

    let user = await User.findById(userId);

    if(publicEv != undefined) {
        if(userId != publicEv.organizzatoreID) {
            res.status(403).json({error: "Non sei autorizzato a cancellare questo evento."}).send();
            return;
        }
        var index = user.EventiCreati.indexOf(publicEv.id);
        if(index > -1) {
            user.EventiCreati.splice(index, 1);
        }
        await biglietti.deleteMany({eventoid: {$eq: publicEv.id}});
        await recensioniPub.deleteMany({idEvento: {$eq: publicEv.id}});
        await publicEv.deleteOne();

        user.numEvOrg--;
        await user.save();

        res.status(200).json({message: "Evento eliminato con successo."}).send();
        return;
    }

    if(privEv != undefined) {
        if(userId != privEv.organizzatoreID) {
            res.status(403).json({error: "Non sei autorizzato a cancellare questo evento."}).send();
            return;
        }
        var index = user.EventiCreati.indexOf(privEv.id);
        if(index > -1) {
            user.EventiCreati.splice(index, 1);
        }
        await biglietti.deleteMany({eventoid: {$eq: privEv.id}});
        await recensioniPub.deleteMany({idEvento: {$eq: privEv.id}});
        await privEv.deleteOne();

        user.numEvOrg--;
        await user.save();

        res.status(200).json({message: "Evento eliminato con successo."}).send();
        return;
    }
});

export default router;