import { Router } from 'express';
import eventPublic from '../collezioni/eventPublic.mjs';
const router = Router();
import Users from '../collezioni/utenti.mjs';
import recensioni from '../collezioni/recensioniPub.mjs';
import RateLimit from 'express-rate-limit';

var limiter = RateLimit({
    windowMs: 1 * 20 * 1000, //20 seconds
    max: 1, //Limit each IP to a certain number of requests per 20 seconds
    message: async () => "Hai raggiunto il numero massimo di richieste al minuto.",
    statusCode: 429
});

//Apply rate limiter to all requests
//Avoids Denial of Service attacks by limiting the number of requests per IP
router.use(limiter);

router.get('/:id', async (req, res) => {
    try {
        let eventoPubblico = await eventPublic.findById(req.params.id);

        console.log(eventoPubblico);
        if (eventoPubblico == undefined) {
            res.status(404).json({ error: "Non esiste nessun evento con l'id selezionato" }).send();
            return;
        }
        let organizzatore = await Users.findById(eventoPubblico.organizzatoreID);

        //Da reinserire quando sarà implementata la funzionalità di creazione degli eventi
        eventoPubblico.luogoEv = eventoPubblico.luogoEv.filter(l => new Date() < new Date(l.data + "Z" + l.ora));

        //Al client andrà la computazione del numero di posti rimanenti
        res.status(200).json({
            id: req.params.id,
            nomeAtt: eventoPubblico.nomeAtt,
            categoria: eventoPubblico.categoria,
            durata: eventoPubblico.durata,
            luogoEv: eventoPubblico.luogoEv, //Non si potrebbe non restituire gli id dei partecipanti?
            organizzatore: organizzatore.nome,
            eventPic: eventoPubblico.eventPic
        }).send();
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Errore nel Server" }).send();
    }
});

router.get("/:id/recensioni", async (req, res) => {
    try {
        var recensioniEvento = await recensioni.find({ idEvento: { $eq: req.params.id } });
        var result = [];

        for (let o of recensioniEvento) {
            var user = await Users.findById(o.idUtente);
            result.push({
                name: user.nome,
                picture: user.profilePic,
                recensione: o
            });
        }
        console.log(result);

        res.status(200).json({ recensioni: result });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Errore interno al server" });
    }
    return;
});

export default router;