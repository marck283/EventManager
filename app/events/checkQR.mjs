import { Router } from 'express';
import RateLimit from 'express-rate-limit';
const router = Router();
import { Validator } from 'node-input-validator';
import biglietti from '../collezioni/biglietti.mjs';
import fromDataUrl from 'qrcode';

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
    const v = new Validator({
        qr_code: req.params.qrcode
    }, {
        qr_code: 'required|string|minLength:1'
    });

    v.check()
    .then(async matched => {
        if(!matched) {
            res.status(400).json({error: "QR Code non valido. Riprova."}).send();
            return;
        }
        console.log(req.params.qrcode);
        const biglietto = await biglietti.findOne({qr: {$eq: req.params.qrcode}});
        if(biglietto != null && biglietto != undefined) {
            res.status(200).json({status: "OK"}).send();
        } else {
            res.status(404).json({error: "QR Code non trovato."}).send();
        }
        return;
    })
});

export default router;