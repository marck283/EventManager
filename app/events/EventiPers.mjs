import { Router } from 'express';
import eventPersonal from '../collezioni/eventPersonal.mjs';
const router = Router();
import Users from '../collezioni/utenti.mjs';
import { Validator } from 'node-input-validator';
import { test } from '../hourRegexTest.mjs';

router.patch('/:id', async (req, res) => {
    var utent = req.loggedUser.id || req.loggedUser;
    var id_evento = req.params.id;

    try {
        let evento = await eventPersonal.findById(id_evento);

        if (evento == undefined) {
            res.status(404).json({ error: "Non esiste alcun evento personale con l'id specificato." });
            return;
        }

        if(utent == req.loggedUser) {
            utent = (await Users.find({email: {$eq: utent.email}})).id;
        }

        if (utent != evento.organizzatoreID) {
            res.status(403).json({ error: "Non sei autorizzato a modificare l'evento." });
            return;
        }

        if (req.body.nomeAtt != "" && req.body.nomeAtt != undefined) {
            evento.nomeAtt = req.body.nomeAtt;
        }
        if (req.body.categoria != "" && req.body.categoria != undefined) {
            evento.categoria = req.body.categoria
        }
        if (req.body.indirizzo != "" && req.body.indirizzo != undefined) {
            evento.luogoEv.indirizzo = req.body.indirizzo
        }
        if (req.body.citta != "" && req.body.citta != undefined) {
            evento.luogoEv.citta = req.body.citta;
        }

        await evento.save();
        res.location("/api/v2/EventiPersonali/" + id_evento).status(200).send();
        console.log('Evento personale modificato con successo');
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Errore lato server." }).send();
    }
});

router.get('/:id', async (req, res) => {
    try {
        let eventoPersonale = await eventPersonal.findById(req.params.id);
        if (eventoPersonale == undefined) {
            res.status(404).json({ error: "Non esiste nessun evento con l'id selezionato" }).send();
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
        res.status(500).json({ error: "Errore nel Server" }).send();
    }
});

router.post('', async (req, res) => {
    try {
        //Si cerca l'utente organizzatore dell'evento
        let utente = await returnUser(req);

        //Prima validiamo i dati inseriti dall'utente
        const v = new Validator({
            data: req.body.data,
            durata: req.body.durata,
            ora: req.body.ora,
            categoria: req.body.categoria,
            nomeAtt: req.body.nomeAtt,
            indirizzo: req.body.luogoEv.indirizzo,
            citta: req.body.luogoEv.citta
        }, {
            'data': 'required|arrayUnique',
            'data.*': 'required|dateFormat:MM-DD-YYYY',
            durata: 'required|integer|min:1',
            ora: 'required|string|minLength:1',
            categoria: 'required|string|in:Sport,Spettacolo,Manifestazione,Viaggio,Altro',
            nomeAtt: 'required|string|minLength:1',
            indirizzo: 'required|string|minLength:1',
            citta: 'required|string|minLength:1'
        });
        v.check()
            .then(async matched => {
                if (!matched) {
                    res.status(400).json({ error: "Campo vuoto o indefinito o non del formato corretto." }).send();
                    return;
                }
                var ElencoDate = req.body.data;

                if (!test(req.body.ora)) {
                    res.status(400).json({ error: "Formato ora non valido" }).send();
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
            });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Errore nel server" }).send();
    }
    return;
});

export default router;