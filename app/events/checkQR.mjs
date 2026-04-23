import { Router } from 'express';
import RateLimit from 'express-rate-limit';
const router = Router();
import { Validator } from 'node-input-validator';
import biglietti from '../collezioni/biglietti.mjs';
import User from '../collezioni/utenti.mjs';
import hourCheck from '../hourRegexTest.mjs';
import toDataURL from 'qrcode';
import { validate_params, validate_hdrs } from '../validate.mjs';

var limiter = RateLimit({
    windowMs: 1 * 60 * 1000, //1 minute
    max: 10, //Limit each IP to 10 requests per minute
    message: async () => "Hai raggiunto il numero massimo di richieste al minuto.",
    statusCode: 429
});

//Apply rate limiter to all requests
//Avoids Denial of Service attacks by limiting the number of requests per IP
router.use(limiter);

router.get("/:qrcode", validate_params({
    qrcode: 'required|string|minLength:1'
}, "QR Code non valido."), validate_hdrs({
    eventoid: 'required|string|minLength:1',
    day: 'required|string|dateFormat:MM-DD-YYYY',
    hour: 'required|string|minLength:5|maxLength:5'
}, "Dati dell'evento non validi."), async (req, res) => {
    var user = req.loggedUser.id || req.loggedUser.sub;

    if(user === req.loggedUser.sub) {
        user = (await User.findOne({email: {$eq: req.loggedUser.email}})).id;
    }

    if (!hourCheck(req.headers.hour)) {
        res.status(400).json({error: "Orario non valido. Riprova."});
        return;
    }

    let obj = JSON.parse(req.params.qrcode);
    const qrcode = await toDataURL.toDataURL(req.params.qrcode), biglietto = await biglietti.findOne({qr: {$eq: qrcode},
        eventoid: {$eq: req.headers.eventoid}, utenteid: {$eq: obj.idUtente},
        giorno: {$eq: req.headers.day}, ora: {$eq: req.headers.hour}});
    if(biglietto != null && biglietto != undefined) {
        res.status(200).json({status: "OK"});
    } else {
        res.status(404).json({error: "QR Code non trovato."});
    }
    return;
});

export default router;