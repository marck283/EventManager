import { Router } from 'express';
const router = Router();
import { validate_params, validate_query, validate_hdrs } from '../validate.mjs';
import mongoose from 'mongoose';
import RateLimit from 'express-rate-limit';
import { filterAndListPersonalEvents, listPersonalEventsByData } from '../controllers/listPersonalEvents.mjs';

var limiter = RateLimit({
    windowMs: 1 * 20 * 1000, //20 seconds
    max: 10, //Limit each IP to a certain number of requests per 20 seconds
    message: async () => "Hai raggiunto il numero massimo di richieste al minuto.",
    statusCode: 429
});

//Apply rate limiter to all requests
//Avoids Denial of Service attacks by limiting the number of requests per IP
router.use(limiter);

router.get("/:data", validate_params({
    data: 'required|dateFormat:MM-DD-YYYY'
}, "Data non valida"), listPersonalEventsByData);

router.get("", validate_hdrs({
    durata: 'integer|min:1',
    nomeAtt: 'string|minLength:1',
    categoria: 'string|minLength:1',
    indirizzo: 'string|minLength:1',
    citta: 'string|minLength:1'
}, "Durata non valida"), validate_query({
    passato: 'required|boolean|in:true,false'
}, "Parametri della richiesta non validi"), filterAndListPersonalEvents);

export default router;