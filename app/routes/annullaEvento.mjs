import { Router } from 'express';
import RateLimit from 'express-rate-limit';
const router = Router();
import { deleteEventById } from "../controllers/deleteEvent.mjs"

var limiter = RateLimit({
    windowMs: 1 * 60 * 1000, //1 minute
    max: 10, //Limit each IP to 10 requests per minute
    message: async () => "Hai raggiunto il numero massimo di richieste al minuto.",
    statusCode: 429
});

//Apply rate limiter to all requests
//Avoids Denial of Service attacks by limiting the number of requests per IP
router.use(limiter);

router.delete("/:id", deleteEventById);

export default router;