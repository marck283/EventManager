import { Router, json } from 'express';
const router = Router();
import { validate_body } from '../validate.mjs';
import { endPublicEvent } from '../controllers/endPublicEvent.mjs';
import RateLimit from 'express-rate-limit';

var limiter = RateLimit({
    windowMs: 1 * 10 * 1000, //10 seconds
    max: 10, //Limit each IP to a certain number of requests every 10 seconds
    message: async () => "Hai raggiunto il numero massimo di richieste al minuto.",
    statusCode: 429
});

//Apply rate limiter to all requests
//Avoids Denial of Service attacks by limiting the number of requests per IP
router.use(limiter);

router.use(json({ limit: "50mb" })); //Limiting the size of the request should avoid "Payload too large" errors

router.patch("/:id", validate_body({
    data: 'required|string|dateFormat:MM-DD-YYYY',
    ora: 'required|string|minLength:5|maxLength:5'
}, "Invalid request data"), endPublicEvent);

export default router;