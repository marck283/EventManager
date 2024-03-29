import { Router } from 'express';
const router = Router();
import eventPublic from '../collezioni/eventPublic.mjs';
import { Validator } from 'node-input-validator';
import Recensione from '../collezioni/recensioniPub.mjs';
import returnUser from '../findUser.mjs';
import User from '../collezioni/utenti.mjs';
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

var meanEval = (evArr, recLength) => {
    var sum = 0.0;
    
    if(evArr.length > 0) {
        for(let e of evArr) {
            console.log(e.valMedia);
            sum += e.valMedia*1.0;
        }
        return sum/(evArr.length*1.0); //Floating-point division
    }
    return sum;
}

router.post("/:id", async (req, res) => {
    try {
        var id = req.params.id, evento = await eventPublic.findById(id);

        const v = new Validator({
            titolo: req.body.title,
            valutazione: req.body.evaluation,
            motivazione: req.body.description
        }, {
            titolo: 'required|string|minLength:1',
            valutazione: 'required|numeric|min:1|max:10',
            motivazione: 'required|string|minLength:1'
        });
        v.check()
            .then(async matched => {
                if (!matched || !Number(req.body.evaluation)) {
                    res.status(400).json({ error: "Richiesta malformata" }).send();
                    return;
                }
                let evaluation = Number(req.body.evaluation);
                var user = await returnUser(req);
                var utenteId = user.id;
                console.log(utenteId);
                var recensione = new Recensione({
                    idUtente: utenteId,
                    idEvento: id,
                    titolo: req.body.title,
                    valutazione: evaluation,
                    descrizione: req.body.description
                });
                var recensione1 = await recensione.save();

                evento.recensioni.push(recensione1.id);
                evento.valMedia = (evento.valMedia*(evento.recensioni.length - 1) + recensione1.valutazione)/evento.recensioni.length;
                await evento.save();

                //Now find the user and update its evaluation.
                var event = await eventPublic.findById(id);
                var orgID = event.organizzatoreID;
                var user1 = await User.findById(orgID);
                var eventsPub = await eventPublic.find({ organizzatoreID: orgID });
                eventsPub = eventsPub.filter(async e => {
                    let recensioni = await Recensione.find({idEvento: e.id});
                    return recensioni != undefined && recensioni.length > 0;
                });

                let recensioni = await Recensione.find({idUtente: user1.id});
                console.log(recensioni == undefined || recensioni.length == 0);
                if(recensioni != undefined) {
                    console.log("OK");
                    user1.valutazioneMedia = meanEval(eventsPub, recensioni.length);
                } else {
                    console.log("NOK");
                    user1.valutazioneMedia = 0;
                }
                await user1.save();

                res.status(201).json({ message: "Recensione salvata con successo" }).send();
            });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Errore nel server" }).send();
    }
});

export default router;