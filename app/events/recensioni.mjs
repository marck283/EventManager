import { Router } from 'express';
const router = Router();
import eventPublic from '../collezioni/eventPublic.mjs';
import { Validator } from 'node-input-validator';
import Recensione from '../collezioni/recensioniPub.mjs';
import User from '../collezioni/utenti.mjs';

var meanEval = evArr => {
    var sum = 0;
    evArr.forEach(e => sum += e.valMedia);
    
    return sum/evArr.length;
}

router.post("/:id", async (req, res) => {
    try {
        var id = req.params.id, evento = await eventPublic.findById(id);

        const v = new Validator({
            valutazione: req.body.evaluation,
            motivazione: req.body.description
        }, {
            valutazione: 'required|integer|min:1|max:10',
            motivazione: 'required|string|minLength:1'
        });
        v.check()
            .then(async matched => {
                if (!matched) {
                    res.status(400).json({ error: "Richiesta malformata" }).send();
                    return;
                }
                var recensione = new Recensione({
                    idUtente: req.loggedUser.id || req.loggedUser.sub,
                    idEvento: id,
                    valutazione: req.body.evaluation,
                    descrizione: req.body.description
                });
                var recensione1 = await recensione.save();

                evento.recensioni.push(recensione1.id);
                evento.valMedia = (evento.valMedia*(evento.recensioni.length - 1) + recensione1.valutazione)/evento.recensioni.length;
                await evento.save();

                //Now find the user and update its evaluation.
                var user = await User.findById(req.loggedUser.id || req.loggedUser.sub);
                var eventsPub = await eventPublic.find({organizzatoreID: {$eq: req.loggedUser.id || req.loggedUser.sub}});
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