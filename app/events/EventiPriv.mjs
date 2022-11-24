import { Router } from 'express';
import eventPrivat from '../collezioni/eventPrivat.mjs';
import invit from '../collezioni/invit.mjs';
const router = Router();
import biglietti from '../collezioni/biglietti.mjs';
import Users from '../collezioni/utenti.mjs';
import { toDataURL } from 'qrcode';
import { Validator } from 'node-input-validator';
import { test } from '../hourRegexTest.mjs';
import dateCheck from '../dateCheck.mjs';

router.patch('/:id', async (req, res) => {
    //var utent = req.loggedUser.id || req.loggedUser.sub;
    var utent = req.loggedUser.id || req.loggedUser.sub;
    var id_evento = req.params.id;

    try {
        let evento = await eventPrivat.findById(id_evento);

        if (evento == undefined) {
            res.status(404).json({ error: "Non esiste alcun evento privato con l'id specificato." });
            return;
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
        res.location("/api/v2/EventiPrivati/" + id_evento).status(200).send();
        console.log('Evento privato modificato con successo');
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Errore lato server." }).send();
    }
    return;
});

var spliceArr = (param1, param2) => {
    var arr = param1, index = arr.indexOf(param2);
    if (index > -1) {
        return new Promise.resolve(() => {
            arr.splice(index, 1);
            param1 = arr;
        });
    } else {
        return new Promise.reject("L'utente non risulta iscritto all'evento.");
    }
}

router.delete('/:idEvento/Iscrizioni/:idIscr', async (req, res) => {
    try {
        var evento = await eventPrivat.findById(req.params.idEvento);
        var utente = req.loggedUser.id || req.loggedUser.sub;
        var utenteObj = await Users.findById(utente);
        var iscr = await biglietti.findById(req.params.idIscr);

        if (evento == undefined) {
            res.status(404).json({ error: "Non corrisponde alcun evento privato all'ID specificato." });
            return;
        }

        if (iscr == undefined) {
            res.status(404).json({ error: "Non corrisponde alcuna iscrizione all'ID specificato." });
            return;
        }

        if (iscr.eventoid != req.params.idEvento || iscr.utenteid != utente) {
            res.status(403).json({ error: "L'iscrizione non corrisponde all'evento specificato." }).send();
            return;
        }

        spliceArr(evento.partecipantiID, utente)
            .then(async () => {
                await evento.save(); //Aggiornamento partecipantiID
                return spliceArr(utenteObj.EventiIscrtto, req.params.idEvento)
                    .then(async () => {
                        utenteObj.EventiIscrtto = array2;
                        await utenteObj.save(); //Aggiornamento EventiIscritto
                        await biglietti.deleteOne({ _id: req.params.idIscr }); //Aggiornamento Biglietto DB
                        console.log('Annullamento iscrizione effettuato con successo.');
                        res.status(204).send();
                        return;
                    });
            })
            //The error in the promise gets propagated to the catch block
            .catch(err => {
                res.status(403).json({ error: "L'utente non risulta iscritto all'evento." }).send();
                return;
            });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Errore nel Server" }).send();
    }

});

router.get('/:id', async (req, res) => {
    try {
        let eventoPrivato = await eventPrivat.findById(req.params.id);
        if (eventoPrivato == undefined) {
            res.status(404).json({ error: "Non esiste nessun evento con l'id selezionato" }).send();
            return;

        }
        let organizzatore = await Users.findById(eventoPrivato.organizzatoreID);
        let partecipanti = [];
        for (var i of eventoPrivato.partecipantiID) {
            let tmp = await Users.findById(i);
            partecipanti.push(tmp.nome);
        }

        let invitati = [];

        for (var i of eventoPrivato.invitatiID) {
            let tmp = await Users.findById(i);
            invitati.push(tmp.nome);
        }

        res.status(200).json({
            nomeAtt: eventoPrivato.nomeAtt,
            categoria: eventoPrivato.categoria,
            data: eventoPrivato.data,
            ora: eventoPrivato.ora,
            durata: eventoPrivato.durata,
            luogoEv: eventoPrivato.luogoEv,
            organizzatore: organizzatore.nome,
            partecipanti: partecipanti,
            invitati: invitati
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Errore nel Server" }).send();
    }
});


router.post('/:id/Iscrizioni', async (req, res) => {
    var utent = req.loggedUser.id || req.loggedUser.sub;
    var id_evento = req.params.id;

    try {
        let eventP = await eventPrivat.findById(id_evento);

        if (eventP == undefined) {
            res.status(404).json({ error: "Non esiste nessun evento con l'id selezionato" }).send();
            return;
        }

        for (var elem of eventP.data) {
            let date = new Date(), d1 = new Date(elem);
            let orario = eventP.ora.split(':');

            d1.setHours(orario[0].toString().padStart(2, '0'), orario[1].toString().padStart(2, '0'));
            d1.setDate(d1.getDate() + 1);

            if (d1 < date) {
                res.status(403).json({ error: "evento non disponibile" }).send()
                return;
            }
        }

        if (!eventP.invitatiID.includes(utent)) {
            res.status(403).json({ error: "Non sei invitato a questo evento" }).send();
            return;
        }

        if(eventP.partecipantiID.includes(utent)) {
            res.status(403).json({ error: "Già iscritto" }).send();
            return;
        }

        let data = {
            idUtente: utent,
            idEvento: id_evento
        };

        let stringdata = JSON.stringify(data);

        //Print QR code to file using base64 encoding
        var idBigl = "";

        toDataURL(stringdata, async function (err, qrcode) {
            if (err) {
                throw Error("errore creazione biglietto")
            }

            let bigl = new biglietti({ eventoid: id_evento, utenteid: utent, qr: qrcode, tipoevento: "priv" });
            idBigl = bigl.id;
            await bigl.save();
        });

        //Si cerca l'utente organizzatore dell'evento
        let utente = await Users.findById(utent);

        eventP.partecipantiID.push(utent);
        utente.EventiIscrtto.push(id_evento);

        await eventP.save()
        await utente.save()

        res.location("/api/v2/EventiPrivati/" + id_evento + "/Iscrizioni/" + idBigl).status(201).send();
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Errore nel server" }).send();
    }
});

router.post('', async (req, res) => {
    var utent = req.loggedUser.id || req.loggedUser.sub;
    try {
        //Si cerca l'utente organizzatore dell'evento
        let utente = await Users.findById(utent);
        //Si crea un documento evento personale
        var options = {
            data: req.body.data,
            durata: req.body.durata,
            ora: req.body.ora,
            categoria: req.body.categoria,
            nomeAtt: req.body.nomeAtt,
            indirizzo: req.body.luogoEv.indirizzo,
            citta: req.body.luogoEv.citta,            
            ElencoEmailInviti: req.body.ElencoEmailInviti
        };
        const v = new Validator(options, {
            'data': 'required|arrayUnique',
            'data.*': 'required|dateFormat:MM-DD-YYYY',
            durata: 'required|integer|min:1',
            ora: 'required|string|minLength:1',
            categoria: 'required|string|in:Sport,Spettacolo,Manifestazione,Viaggio,Altro',
            nomeAtt: 'required|string|minLength:1',
            indirizzo: 'required|string|minLength:1',
            citta: 'required|string|minLength:1',
            'ElencoEmailInviti': 'required|arrayUnique|minLength:1',
            'ElencoEmailInviti.*': 'required|email|minLength:1|notIn:' + utente.email
        });
        v.check()
            .then(async matched => {
                if (!matched) {
                    res.status(400).json({ error: "Campo vuoto o indefinito o non del formato corretto." }).send();
                    return;
                }
                
                if (!test(req.body.ora)) {
                    res.status(400).json({ error: "Ora non valida." }).send();
                    return;
                }

                //Riscrivere questa parte...
                if(!dateCheck(req.body.data, req.body.ora)) {
                    res.status(400).json({ error: "Data non valida." }).send();
                    return;
                }

                //controllo se l'elenco dell'email contiene solo email di utenti nel sistema
                var ListaInvitati = [];
                for (var elem of req.body.ElencoEmailInviti) {
                    let u = await Users.find({ email: { $eq: elem } });
                    if(u.length > 0) {
                        ListaInvitati.push(u.id);
                    } else {
                        res.status(404).json({error: "email non trovata"}).send();
                        return;
                    }
                }

                let eventP = new eventPrivat({
                    data: req.body.data,
                    durata: req.body.durata,
                    ora: req.body.ora,
                    categoria: req.body.categoria,
                    nomeAtt: req.body.nomeAtt,
                    luogoEv: {
                        indirizzo: req.body.luogoEv.indirizzo,
                        citta: req.body.luogoEv.citta
                    },
                    organizzatoreID: utent,
                    invitatiID: ListaInvitati,
                    partecipantiID: []
                });
                eventP.partecipantiID.push(utent);

                //Si salva il documento personale
                eventP = await eventP.save();

                //Si indica fra gli eventi creati dell'utente, l'evento appena creato
                utente.EventiCreati.push(eventP.id);
                utente.EventiIscrtto.push(eventP.id);
                utente.numEvOrg += 1; //Incremento il numero di eventi organizzati dall'utente

                //Si salva il modulo dell'utente
                await utente.save();

                let eventId = eventP.id;

                //creare gli inviti a questi eventi 
                ListaInvitati.forEach(async elem => {
                    let invito = new invit({ utenteid: elem, eventoid: eventId, tipoevent: "priv" });
                    await invito.save();
                });
                console.log('Evento salvato con successo');

                /**
                 * Si posiziona il link alla risorsa appena creata nel header location della risposata
                 */
                res.status(201).location("/api/v2/EventiPrivati/" + eventId).send();
            });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Errore nel server" }).send();
    }
});

export default router;