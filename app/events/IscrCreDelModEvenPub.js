const express = require('express');
const eventPublic = require('../collezioni/eventPublic.js');
const router = express.Router();
var qrcode = require('qrcode');
const Inviti = require('../collezioni/invit.js');
const Users = require('../collezioni/utenti.js');
const biglietti = require('../collezioni/biglietti.js');
const { Validator } = require('node-input-validator');
const dateTest = require('../dateRegexTest.js');
const Recensioni = require('../collezioni/recensioniPub.js');

router.use(express.json({ limit: "50mb" })); //Limiting the size of the request should avoid "Payload too large" errors

router.delete('/:id/annullaEvento', async (req, res) => {
    var utent = req.loggedUser.id;
    var id_evento = req.params.id;

    try {
        let evento = await eventPublic.findById(id_evento);

        if (evento == undefined) {
            res.status(404).json({ error: "Non esiste alcun evento pubblico con l'id specificato." });
            return;
        }

        if (utent != evento.organizzatoreID) {
            res.status(403).json({ error: "Non sei autorizzato a modificare, terminare od annullare l'evento." });
            return;
        }

        //Trova e cancella tutte le recensioni relative all'evento
        var recensioni = evento.recensioni;
        recensioni.forEach(async e => {
            var recensione = await Recensioni.findById(e);
            await recensione.delete();
        });

        await evento.delete();
        res.status(200).json({ message: "Evento annullato con successo." }).send();
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Errore del server." }).send();
    }
    return;
});

router.patch('/:id', async (req, res) => {
    var utent = req.loggedUser.id;
    var id_evento = req.params.id;

    try {
        let evento = await eventPublic.findById(id_evento);

        if (evento == undefined) {
            res.status(404).json({ error: "Non esiste alcun evento pubblico con l'id specificato." });
            return;
        }

        if (utent != evento.organizzatoreID) {
            res.status(403).json({ error: "Non sei autorizzato a modificare, terminare od annullare l'evento." });
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

        const v = new Validator({
            maxPers: req.body.maxPers
        }, {
            maxPers: 'required|integer|min:2'
        });
        v.check()
            .then(async matched => {
                if (!matched) {
                    res.status(400).json({ error: "Numero massimo partecipanti non valido: formato non valido o valore inferiore a 2." });
                    return;
                } else {
                    evento.maxPers = Math.max(req.body.maxPers, evento.partecipantiID.length);
                    await evento.save();
                    res.location("/api/v2/EventiPubblici/" + id_evento).status(200).send();
                    console.log('Evento pubblico modificato con successo');
                }
            });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Errore lato server." }).send();
    }
});

router.delete('/:idEvento/Iscrizioni/:idIscr', async (req, res) => {
    try {
        var evento = await eventPublic.findById(req.params.idEvento);
        var utente = req.loggedUser.id;
        var utenteObj = await Users.findById(utente);
        var iscr = await biglietti.findById(req.params.idIscr);

        if (evento == undefined) {
            res.status(404).json({ error: "Non corrisponde alcun evento pubblico all'ID specificato." });
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

        var array1 = evento.partecipantiID;
        var index1 = array1.indexOf(utente);
        if (index1 > -1) {
            array1.splice(index1, 1);
        } else {
            res.status(403).json({ error: "L'utente non risulta iscritto all'evento." }).send();
            return;
        }
        evento.partecipantiID = array1;
        await evento.save(); //Aggiornamento partecipantiID

        var array2 = utenteObj.EventiIscrtto;
        var index2 = array2.indexOf(req.params.idEvento);
        if (index2 > -1) {
            array2.splice(index2, 1);
        } else {
            res.status(403).json({ error: "L'utente non risulta iscritto all'evento." }).send();
            return;
        }
        utenteObj.EventiIscrtto = array2;
        await utenteObj.save(); //Aggiornamento EventiIscritto
        await biglietti.deleteOne({ _id: req.params.idIscr }); //Aggiornamento Biglietto DB

        console.log('Annullamento iscrizione effettuato con successo.');

        res.status(204).send();
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Errore nel Server" }).send();
    }
});

router.post('/:id/Iscrizioni', async (req, res) => {
    var utent = req.loggedUser.id;
    var id_evento = req.params.id;

    try {
        let eventP = await eventPublic.findById(id_evento);
        if (eventP == undefined) {
            res.status(404).json({ error: "Non esiste nessun evento con l'id selezionato" }).send();
            return;
        }

        for (var elem of eventP.data) {
            var date = new Date(), d1 = new Date(elem);
            let orario = eventP.ora.split(':');
            d1.setDate(d1.getDate() + 1);
            d1.setHours(orario[0].padStart(2, '0'), orario[1].padStart(2, '0'));

            if (date < d1) {
                res.status(403).json({ error: "evento non disponibile" }).send();
                return;
            }
        }

        if (eventP.partecipantiID.length == eventP.maxPers) {
            res.status(403).json({ error: "Non spazio nell'evento" }).send();
            return;
        }

        if (eventP.partecipantiID.includes(utent)) {
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

        qrcode.toDataURL(stringdata, async function (err, qrcode) {
            if (err) {
                throw Error("errore creazione biglietto");
            }

            bigl = new biglietti({ eventoid: id_evento, utenteid: utent, qr: qrcode, tipoevento: "pub" });

            idBigl = bigl._id;
            return await bigl.save();
        });

        //Si cerca l'utente organizzatore dell'evento
        let utente = await Users.findById(utent);

        eventP.partecipantiID.push(utent);
        utente.EventiIscrtto.push(id_evento);

        await eventP.save();
        await utente.save();

        res.location("/api/v2/EventiPubblici/" + id_evento + "/Iscrizioni/" + idBigl).status(201).send();
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Errore nel server" }).send();
    }
});

router.post('/:id/Inviti', async (req, res) => {
    try {
        var utent = req.loggedUser.id;
        var id_evento = req.params.id;

        if (req.body.email == "" || req.body.email == undefined) {
            res.status(400).json({ error: "Campo vuoto o indefinito" }).send();
            return;
        }

        let eventP = await eventPublic.findById(id_evento);
        if (eventP == undefined) {
            res.status(404).json({ error: "Non esiste nessun evento con l'id selezionato" }).send();
            return;
        }

        //controllo che le date non siano di una giornata precedente a quella odierna
        for (var elem of eventP.data) {
            var date = new Date(), d1 = new Date(elem);
            let orario = eventP.ora.split(':');

            d1.setHours(orario[0].toString().padStart(2, '0'), orario[1].toString().padStart(2, '0'));
            d1.setDate(d1.getDate() + 1);

            if (d1 < date) {
                res.status(403).json({ error: "evento non disponibile" }).send();
                return;
            }
        }

        if (eventP.organizzatoreID != utent) {
            res.status(403).json({ error: "L'utente non può invitare ad un evento che non è suo" }).send();
            return;
        }

        var utenteorg = await Users.findById(utent)
        if (utenteorg.email == req.body.email) {
            res.status(403).json({ error: "L'utente non può auto invitarsi" }).send();
            return;
        }

        var utente = await Users.find({ email: { $eq: req.body.email } })
        if (utente.length == 0) {
            res.status(404).json({ error: "Non esiste un utente con quella email" }).send();
            return;
        }

        var ListaInviti = await Inviti.find({ utenteid: utente[0]._id })
        if (ListaInviti.length > 0) {
            for (var elem of ListaInviti) {
                if (elem.eventoid == id_evento) {
                    res.status(403).json({ error: "L'utente con quella email è già invitato a quell'evento" }).send();
                    return;
                }
            }
        }

        if (eventP.partecipantiID.includes(utente[0]._id)) {
            res.status(403).json({ error: "L'utente con quella email è già partecipante all'evento" }).send();
            return;
        }

        let invito = new Inviti({ utenteid: utente[0]._id, eventoid: id_evento, tipoevent: "pub" });
        let invitii = await invito.save();
        res.location("/api/v2/EventiPubblici/" + id_evento + "/Inviti/" + invitii.id).status(201).send();
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Errore nel server" }).send();
        return;
    }
});

router.post('', async (req, res) => {
    var utent = req.loggedUser.id;
    try {
        //Si cerca l'utente organizzatore dell'evento
        let utente = await Users.findById(utent);
        const v = new Validator({
            data: req.body.data
        }, {
            'data': 'required|arrayUnique|minLength:1',
            'data.*': 'required|string|minLength:10|maxLength:10'
        });
        v.check()
            .then(matched => {
                if (!matched) {
                    res.status(400).json({ error: "Date ripetute o nessuna data inserita." }).send();
                    return;
                }
                var options = {
                    durata: req.body.durata,
                    descrizione: req.body.descrizione,
                    ora: req.body.ora,
                    maxPers: req.body.maxPers,
                    categoria: req.body.categoria,
                    nomeAtt: req.body.nomeAtt,
                    indirizzo: req.body.luogoEv.indirizzo,
                    citta: req.body.luogoEv.citta,
                    picture: req.body.eventPic,
                    etaMin: req.body.etaMin,
                    etaMax: req.body.etaMax
                };
                const v1 = new Validator(options, {
                    durata: 'required|integer|min:1',
                    descrizione: 'required|string|minLength:1|maxLength:140',
                    ora: 'required|string|minLength:5|maxLength:5',
                    maxPers: 'required|integer|min:2',
                    categoria: 'required|string|in:Sport,Spettacolo,Manifestazione,Viaggio,Altro',
                    nomeAtt: 'required|string|minLength:1',
                    indirizzo: 'required|string|minLength:1',
                    citta: 'required|string|minLength:1',
                    picture: 'required|base64',
                    etaMin: 'integer|min:0',
                    etaMax: 'integer|gte:etaMin'
                });
                v1.check()
                    .then(async matched => {
                        if (!matched) {
                            res.status(400).json({ error: "Campo vuoto o indefinito o non del formato corretto." }).send();
                            return;
                        }
                        var ElencoDate = req.body.data, ora = req.body.ora, date = new Date();

                        for (var elem of ElencoDate) {
                            //controllo che la data ha un formato corretto
                            let d1 = new Date(elem);
                            if (!dateTest.test(d1, elem + "T" + ora)) {
                                res.status(400).json({ error: "Formato data o ora non valido" }).send();
                                return;
                            }

                            d1.setDate(d1.getDate() + 1); //Dates are expressed in UTC, so we need to add 1 day to the date to get the correct date.

                            //controllo che le date non siano di una giornata precedente a quella odierna
                            if (d1 < date) {
                                res.status(403).json({ error: "giorno o ora non disponibile" }).send();
                                return;
                            }
                        }

                        let etaMin = null, etaMax = null;
                        if (req.body.etaMin != undefined) {
                            etaMin = Number(req.body.etaMin);
                        }
                        if (req.body.etaMax != undefined) {
                            etaMax = Number(req.body.etaMax);
                        }

                        //Si crea un documento evento pubblico
                        let eventP = new eventPublic({
                            data: ElencoDate,
                            durata: req.body.durata,
                            ora: req.body.ora,
                            maxPers: req.body.maxPers,
                            categoria: req.body.categoria,
                            nomeAtt: req.body.nomeAtt,
                            luogoEv: {
                                indirizzo: req.body.luogoEv.indirizzo,
                                citta: req.body.luogoEv.citta
                            },
                            organizzatoreID: utent,
                            eventPic: "data:image/png;base64," + req.body.eventPic,
                            etaMin: etaMin,
                            etaMax: etaMax,
                            terminato: false,
                            recensioni: [],
                            valMedia: 0.0
                        });
                        eventP.partecipantiID.push(utent);

                        //Si salva il documento pubblico
                        eventP = await eventP.save();

                        //Si indica fra gli eventi creati dell'utente, l'evento appena creato
                        utente.EventiCreati.push(eventP._id);
                        utente.EventiIscrtto.push(eventP._id);
                        utente.numEvOrg += 1; //Incremento il numero di eventi organizzati dall'utente

                        //Si salva il modulo dell'utente
                        await utente.save();

                        let eventId = eventP.id;

                        console.log('Evento salvato con successo');

                        /**
                         * Si posiziona il link alla risorsa appena creata nel header location della risposata
                         */
                        res.location("/api/v2/EventiPubblici/" + eventId).status(201).send();
                    });
            })
            .catch(err => {
                //Qualcosa
            });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Errore del server" }).send();
    }
});

module.exports = router;
