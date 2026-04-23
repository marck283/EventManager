import { Router } from 'express';
import eventPersonal from '../collezioni/eventPersonal.mjs';
const router = Router();
import Users from '../collezioni/utenti.mjs';
import { validate_body } from '../validate.mjs';
import test from '../hourRegexTest.mjs';
import RateLimit from 'express-rate-limit';

var limiter = RateLimit({
    windowMs: 1 * 20 * 1000, //20 seconds
    max: 10, //Limit each IP to a certain number of requests per 20 seconds
    message: async () => "Hai raggiunto il numero massimo di richieste al minuto.",
    statusCode: 429
});

//Apply rate limiter to all requests
//Avoids Denial of Service attacks by limiting the number of requests per IP
router.use(limiter);

router.patch('/:id', validate_body({
    nomeAtt: 'string|minLength:1',
    categoria: 'string|in:Sport,Spettacolo,Manifestazione,Viaggio,Altro',
    indirizzo: 'string|minLength:1',
    citta: 'string|minLength:1'
}, "Dati dell'evento non validi"), async (req, res) => {
    var utent = req.loggedUser.id || req.loggedUser;
    var id_evento = req.params.id;

    try {
        let evento = await eventPersonal.findById(id_evento);

        if (evento == undefined) {
            res.status(404).json({ error: "Non esiste alcun evento personale con l'id specificato." });
            return;
        }

        if (utent == req.loggedUser) {
            utent = (await Users.find({ email: { $eq: utent.email } })).id;
        }

        if (utent != evento.organizzatoreID) {
            res.status(403).json({ error: "Non sei autorizzato a modificare l'evento." });
            return;
        }

        const nomeAtt = req.body?.nomeAtt;
        const categoria = req.body?.categoria;
        const indirizzo = req.body?.luogoEv?.indirizzo;
        const citta = req.body?.luogoEv?.citta;
        if (nomeAtt != undefined) {
            evento.nomeAtt = nomeAtt;
        }
        if (categoria != undefined) {
            evento.categoria = categoria
        }
        if (indirizzo != undefined) {
            evento.luogoEv.indirizzo = indirizzo
        }
        if (citta != undefined) {
            evento.luogoEv.citta = citta;
        }

        await evento.save();
        res.location("/api/v2/EventiPersonali/" + id_evento).status(200);
        console.log('Evento personale modificato con successo');
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Errore lato server." });
    }
});

router.get('/:id', async (req, res) => {
    try {
        let eventoPersonale = await eventPersonal.findById(req.params.id);
        if (eventoPersonale == undefined) {
            res.status(404).json({ error: "Non esiste nessun evento con l'id selezionato" });
            return;
        }
        let organizzatore = await Users.findById(eventoPersonale.organizzatoreID);

        res.status(200).json({
            nomeAtt: eventoPersonale.nomeAtt,
            categoria: eventoPersonale.categoria,
            data: eventoPersonale.data,
            ora: eventoPersonale.ora,
            durata: eventoPersonale.durata,
            luogoEv: eventoPersonale.luogoEv,
            organizzatore: organizzatore.nome
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Errore nel Server" });
    }
});

router.post('', validate_body({
    'data': 'required|arrayUnique',
    'data.*': 'required|dateFormat:MM-DD-YYYY',
    durata: 'required|integer|min:1',
    ora: 'required|string|minLength:1',
    categoria: 'required|string|in:Sport,Spettacolo,Manifestazione,Viaggio,Altro',
    nomeAtt: 'required|string|minLength:1',
    indirizzo: 'required|string|minLength:1',
    citta: 'required|string|minLength:1'
}, "Dati dell'evento non validi"), async (req, res) => {
    try {
        //Si cerca l'utente organizzatore dell'evento
        let utente = await returnUser(req);

        var ElencoDate = req.body.data;

        if (!test(req.body.ora)) {
            res.status(400).json({ error: "Formato ora non valido" });
            return;
        }

        let eventP = new eventPersonal({
            data: ElencoDate,
            durata: req.body.durata,
            ora: req.body.ora,
            categoria: req.body.categoria,
            nomeAtt: req.body.nomeAtt,
            luogoEv: {
                indirizzo: req.body.luogoEv.indirizzo,
                citta: req.body.luogoEv.citta
            },
            organizzatoreID: utente.id
        });

        //Si salva il documento personale
        eventP = await eventP.save();

        utente.numEvOrg += 1;

        //Si indica fra gli eventi creati dell'utente, l'evento appena creato
        utente.EventiCreati.push(eventP.id);

        //Si salva il modulo dell'utente
        await utente.save();

        let eventId = eventP.id;

        console.log('Evento salvato con successo');

        /**
         * Si posiziona il link alla risorsa appena creata nel header location della risposata
         */
        res.location("/api/v2/EventiPersonali/" + eventId).status(201).send();
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Errore nel server" });
    }
    return;
});

export default router;