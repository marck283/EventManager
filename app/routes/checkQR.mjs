import { Router } from 'express';
import RateLimit from 'express-rate-limit';
const router = Router();
import { validate_params, validate_hdrs } from '../validate.mjs';
import { checkQR } from '../controllers/checkQR.mjs';

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
}, "Dati dell'evento non validi."), checkQR);

export default router;