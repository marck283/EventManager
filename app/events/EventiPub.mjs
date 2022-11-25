import { Router } from 'express';
import eventPublic from '../collezioni/eventPublic.mjs';
const router = Router();
import Users from '../collezioni/utenti.mjs';

router.get('/:id', async(req, res) => {
    try {
        let eventoPubblico = await eventPublic.findById(req.params.id);
        if(eventoPubblico == undefined) {
            res.status(404).json({error: "Non esiste nessun evento con l'id selezionato"}).send();
            return;
        }
        let organizzatore = await Users.findById(eventoPubblico.organizzatoreID);
        eventoPubblico.luogoEv = eventoPubblico.luogoEv.filter(l => new Date() >= new Date(l.data));

        //Al client andrà la computazione del numero di posti rimanenti
        res.status(200).json({
            nomeAtt: eventoPubblico.nomeAtt,
            categoria: eventoPubblico.categoria,
            durata: eventoPubblico.durata,
            luogoEv: eventoPubblico.luogoEv, //Non si potrebbe non restituire gli id dei partecipanti?
            organizzatore: organizzatore.nome,
            eventPic: eventoPubblico.eventPic,
            terminato: eventoPubblico.terminato,
        }).send();
    } catch(error) {
        console.log(error);
        res.status(500).json({error: "Errore nel Server"}).send();
    }
});

export default router;