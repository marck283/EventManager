import { Router } from 'express';
import RateLimit from 'express-rate-limit';
const router = Router();
import { Validator } from 'node-input-validator';
import biglietti from '../collezioni/biglietti.mjs';
import User from '../collezioni/utenti.mjs';
import hourCheck from '../hourRegexTest.mjs';

var limiter = RateLimit({
    windowMs: 1 * 60 * 1000, //1 minute
    max: 100, //Limit each IP to 10 requests per minute
    message: async () => "Hai raggiunto il numero massimo di richieste al minuto.",
    statusCode: 429
});

//Apply rate limiter to all requests
//Avoids Denial of Service attacks by limiting the number of requests per IP
router.use(limiter);

router.get("/:qrcode", async (req, res) => {
    var user = req.loggedUser.id || req.loggedUser.sub;

    if(user === req.loggedUser.sub) {
        user = (await User.findOne({email: {$eq: req.loggedUser.email}})).id;
    }

    const v = new Validator({
        qr_code: req.params.qrcode,
        eventoid: req.headers.eventoid,
        day: req.headers.day,
        hour: req.headers.hour
    }, {
        qr_code: 'required|string|minLength:1',
        eventoid: 'required|string|minLength:1',
        day: 'required|string|dateFormat:MM-DD-YYYY',
        hour: 'required|string|minLength:5|maxLength:5'
    });

    v.check()
    .then(async matched => {
        if(!matched || !hourCheck(req.headers.hour)) {
            res.status(400).json({error: "QR Code non valido. Riprova."}).send();
            return;
        }
        console.log(req.params.qrcode);

        const biglietto = await biglietti.findOne({qr: {$eq: req.params.qrcode},
            eventoid: {$eq: req.headers.eventoid}, utenteid: {$eq: user}, giorno: {$eq: req.headers.day},
            ora: {$eq: req.headers.hour}});
        if(biglietto != null && biglietto != undefined) {
            res.status(200).json({status: "OK"}).send();
        } else {
            res.status(404).json({error: "QR Code non trovato."}).send();
        }
        return;
    })
});

export default router;