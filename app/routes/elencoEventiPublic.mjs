import { Router } from 'express';
import RateLimit from 'express-rate-limit';
const router = Router();
import { listPublicEvents } from '../controllers/listPublicEvents.mjs';

var limiter = RateLimit({
    windowMs: 1 * 20 * 1000, //20 seconds
    max: 10, //Limit each IP to a certain number of requests per 20 seconds
    message: async () => "Hai raggiunto il numero massimo di richieste al minuto.",
    statusCode: 429
});

//Apply rate limiter to all requests
//Avoids Denial of Service attacks by limiting the number of requests per IP
router.use(limiter);

router.get("", listPublicEvents);

export default router;