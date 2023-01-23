import { Router } from 'express';
import eventPublic from '../collezioni/eventPublic.mjs';
const router = Router();
import Users from '../collezioni/utenti.mjs';
import recensioni from '../collezioni/recensioniPub.mjs';

router.get('/:id', async (req, res) => {
    try {
        let eventoPubblico = await eventPublic.findById(req.params.id);
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
            eventPic: eventoPubblico.eventPic,
            terminato: eventoPubblico.terminato,
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
            var user = await Users.findById(recensioniEvento.idUtente);
            console.log(recensioniEvento.idUtente, user);
            result.push({
                name: user.nome,
                picture: user.profilePic,
                recensione: o
            });
        }

        res.status(200).json({ recensioni: result });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Errore interno al server" });
    }
    return;
});

export default router;