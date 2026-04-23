import { Router } from 'express';
import RateLimit from 'express-rate-limit';
import biglietti from '../collezioni/biglietti.mjs';
import test from '../hourRegexTest.mjs';
import User from '../collezioni/utenti.mjs';
const router = Router();
import { validate_hdrs } from '../validate.mjs';

var limiter = RateLimit({
    windowMs: 1 * 10 * 1000, //10 seconds
    max: 10, //Limit each IP to 10 requests every 10 seconds
    message: async () => "Hai raggiunto il numero massimo di richieste al minuto.",
    statusCode: 429
});

//Apply rate limiter to all requests
//Avoids Denial of Service attacks by limiting the number of requests per IP
router.use(limiter);

router.get("/:id", validate_hdrs({
    giorno: 'required|string|dateFormat:MM-DD-YYYY',
    ora: 'required|string|minLength:5|maxLength:5'
}, "Invalid ticket search parameters"), async (req, res) => {
    var eventId = req.params.id, user = req.loggedUser.id || req.loggedUser.sub;

    if (user === req.loggedUser.sub) {
        user = (await User.findOne({ email: { $eq: req.loggedUser.email } })).id;
    }

    if (!test(req.headers.ora)) {
        res.status(400).json({ error: "Ora non valida." });
        return;
    }

    var biglietto = await biglietti.findOne({
        eventoid: { $eq: eventId }, utenteid: { $eq: user },
        giorno: { $eq: req.headers.giorno }, ora: { $eq: req.headers.ora }
    });

    if (biglietto != null && biglietto != undefined) {
        res.status(200).json({ biglietto: biglietto });
    } else {
        res.status(404).json({ error: "Biglietto non trovato." });
    }
});

export default router;