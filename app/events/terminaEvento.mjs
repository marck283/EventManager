import { Router, json } from 'express';
import eventPublic from '../collezioni/eventPublic.mjs';
const router = Router();
import { Validator } from 'node-input-validator';
import mongoose from 'mongoose';

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
                res.status(400).json({error: "Richiesta malformata."}).send();
                return;
            }
    
            /*let eventoPub = */await eventPublic.findOneAndUpdate({_id: {$eq: new mongoose.Types.ObjectId(req.params.id)},
                "luogoEv.data": {$eq: req.body.data}, "luogoEv.ora": {$eq: req.body.ora}},
                {$set: {"luogoEv.$.terminato": true}});
            /*if(eventoPub == undefined) {
                res.status(404).json({error: "Evento non trovato."}).send();
                return;
            }
            eventoPub.luogoEv.filter(e => e.data == req.headers.data && e.ora == req.headers.ora)[0].terminato = true;
            console.log(eventoPub);
            await eventoPub.save();*/
        });
        res.status(200).json({message: "Evento terminato con successo."}).send();
    } catch(err) {
        console.log(err);
        res.status(500).json({error: "Errore interno al server"}).send();
    }
    return;
});

export default router;