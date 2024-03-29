import { Router } from 'express';
import RateLimit from 'express-rate-limit';
import biglietti from '../collezioni/biglietti.mjs';
import { Validator } from 'node-input-validator';
import test from '../hourRegexTest.mjs';
import User from '../collezioni/utenti.mjs';
const router = Router();

var limiter = RateLimit({
    windowMs: 1 * 10 * 1000, //10 seconds
    max: 10, //Limit each IP to 10 requests every 10 seconds
    message: async () => "Hai raggiunto il numero massimo di richieste al minuto.",
    statusCode: 429
});

//Apply rate limiter to all requests
//Avoids Denial of Service attacks by limiting the number of requests per IP
router.use(limiter);

router.get("/:id", async (req, res) => {
    var eventId = req.params.id, user = req.loggedUser.id || req.loggedUser.sub;

    if(user === req.loggedUser.sub) {
        user = (await User.findOne({email: {$eq: req.loggedUser.email}})).id;
    }

    const v = new Validator({
        giorno: req.headers.giorno,
        ora: req.headers.ora
    }, {
        giorno: 'required|string|dateFormat:MM-DD-YYYY',
        ora: 'required|string|minLength:5|maxLength:5'
    });
    v.check()
    .then(async matched => {
        if (!matched) {
            console.log(v.errors);
            res.status(400).json({error: "Richiesta non valida."}).send();
            return;
        }
        if(!test(req.headers.ora)) {
            res.status(400).json({error: "Ora non valida."}).send();
            return;
        }

        var biglietto = await biglietti.findOne({eventoid: {$eq: eventId}, utenteid: {$eq: user},
            giorno: {$eq: req.headers.giorno}, ora: {$eq: req.headers.ora}});

        if(biglietto != null && biglietto != undefined) {
            res.status(200).json({biglietto: biglietto}).send();
        } else {
            res.status(404).json({error: "Biglietto non trovato."}).send();
        }
    })
});

export default router;