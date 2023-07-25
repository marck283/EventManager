import { Router, json } from 'express';
import eventPublic from '../collezioni/eventPublic.mjs';
const router = Router();
import { Validator } from 'node-input-validator';
import mongoose from 'mongoose';
import RateLimit from 'express-rate-limit';

var limiter = RateLimit({
    windowMs: 1 * 10 * 1000, //10 seconds
    max: 1, //Limit each IP to a certain number of requests every 10 seconds
    message: async () => "Hai raggiunto il numero massimo di richieste al minuto.",
    statusCode: 429
});

//Apply rate limiter to all requests
//Avoids Denial of Service attacks by limiting the number of requests per IP
router.use(limiter);

router.use(json({ limit: "50mb" })); //Limiting the size of the request should avoid "Payload too large" errors

router.patch("/:id", async (req, res) => {
    try {
        const v = new Validator({
            data: req.body.data,
            ora: req.body.ora
        }, {
            data: 'required|string|dateFormat:MM-DD-YYYY',
            ora: 'required|string|minLength:5|maxLength:5'
        });
        v.check()
        .then(async matched => {
            if(!matched) {
                res.status(400).json({error: "Richiesta malformata."});
                return;
            }
    
            await eventPublic.findOneAndUpdate({_id: {$eq: new mongoose.Types.ObjectId(req.params.id)},
                "luogoEv.data": {$eq: req.body.data}, "luogoEv.ora": {$eq: req.body.ora}},
                {$set: {"luogoEv.$.terminato": true}});
            
            res.status(200).json({message: "Evento terminato con successo."});
        });
    } catch(err) {
        console.log(err);
        res.status(500).json({error: "Errore interno al server"});
    }
    return;
});

export default router;