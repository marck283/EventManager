import { Router } from 'express';
const router = Router();
import eventPublic from '../collezioni/eventPublic.mjs';
import { Validator } from 'node-input-validator';
import Recensione from '../collezioni/recensioniPub.mjs';
import returnUser from '../findUser.mjs';
import User from '../collezioni/utenti.mjs';

var meanEval = evArr => {
    var sum = 0.0;
    evArr.forEach(e => sum += e.valMedia*1.0);

    console.log(evArr.length);
    
    if(evArr.length > 0) {
        return sum/(evArr.length*1.0); //Floating-point division
    }
    return 0;
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
            valutazione: 'required|string|min:1|max:10',
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
                var eventsPub = await eventPublic.find({organizzatoreID: {$eq: user.id}});
                user.valutazioneMedia = meanEval(eventsPub);
                await user.save();

                res.status(201).json({ message: "Recensione salvata con successo" }).send();
            });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Errore nel server" }).send();
    }
});

export default router;