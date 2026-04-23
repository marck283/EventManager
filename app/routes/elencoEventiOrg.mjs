import { Router } from 'express';
var router = Router();
import RateLimit from 'express-rate-limit';
import { validate_hdrs } from '../validate.mjs';
import { listEventsByData, listEventsByName } from '../controllers/listOrgEvents.mjs';

var limiter = RateLimit({
    windowMs: 1 * 20 * 1000, //20 seconds
    max: 10, //Limit each IP to 10 requests per 20 seconds
    message: async () => "Hai raggiunto il numero massimo di richieste al minuto.",
    statusCode: 429
});

//Apply rate limiter to all requests
//Avoids Denial of Service attacks by limiting the number of requests per IP
router.use(limiter);

router.get("/:data", listEventsByData);

router.get("", validate_hdrs({
    nome: 'string|minLength:1'
}, "Dati dell'evento non validi."), listEventsByName);

export default router;